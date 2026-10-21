package com.LenasLYS.Backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.*;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.*;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.oauth2.client.registration.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;

@SpringBootTest(
    properties = {
      "app.auth.google-enabled=true",
      "app.auth.totp-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      "app.auth.google-client-id=test-client",
      "app.auth.google-client-secret=test-secret"
    })
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoogleOAuthIntegracionTest {
  static final ProveedorGoogle proveedor = new ProveedorGoogle();
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired UsuarioRepositorio usuarios;
  @Autowired ClienteRepositorio clientes;
  @Autowired RecuperacionRepositorio tokens;

  @BeforeEach
  void limpiar() {
    tokens.deleteAll();
    clientes.deleteAll();
    usuarios.deleteAll();
    proveedor.nonce = "";
  }

  @AfterAll
  static void cerrar() {
    proveedor.server.stop(0);
  }

  @TestConfiguration
  static class Config {
    @Bean
    @Primary
    ClientRegistrationRepository proveedorPrueba() {
      return new InMemoryClientRegistrationRepository(
          ClientRegistration.withRegistrationId("google")
              .clientId("test-client")
              .clientSecret("test-secret")
              .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
              .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
              .redirectUri("http://localhost:5173/login/oauth2/code/google")
              .scope("openid", "email", "profile")
              .authorizationUri(proveedor.url + "/authorize")
              .tokenUri(proveedor.url + "/token")
              .jwkSetUri(proveedor.url + "/jwks")
              .issuerUri(proveedor.url)
              .userInfoUri(proveedor.url + "/userinfo")
              .userNameAttributeName("sub")
              .clientName("Google de prueba")
              .build());
    }
  }

  MvcResult callback(String code) throws Exception {
    return callback(code, null);
  }

  MvcResult callback(String code, MockHttpSession local) throws Exception {
    var inicio =
        mvc.perform(
                local == null
                    ? get("/oauth2/authorization/google")
                    : get("/oauth2/authorization/google").session(local))
            .andExpect(status().is3xxRedirection())
            .andReturn();
    var params = parametros(URI.create(inicio.getResponse().getRedirectedUrl()).getRawQuery());
    proveedor.nonce = params.get("nonce");
    assertNotNull(params.get("state"));
    assertNotNull(proveedor.nonce);
    return mvc.perform(
            get("/login/oauth2/code/google")
                .session((MockHttpSession) inicio.getRequest().getSession(false))
                .param("code", code)
                .param("state", params.get("state")))
        .andReturn();
  }

  @Test
  void googleCreaClienteYConservaSuIdentidad() throws Exception {
    mvc.perform(get("/api/auth/google"))
        .andExpect(jsonPath("$.enabled").value(true))
        .andExpect(jsonPath("$.clientSecret").doesNotExist());
    var resultado = callback("valid");
    assertEquals("http://localhost:5173/mi-cuenta", resultado.getResponse().getRedirectedUrl());
    var s = (MockHttpSession) resultado.getRequest().getSession(false);
    mvc.perform(get("/api/auth/me").session(s))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.role").value("cliente"))
        .andExpect(jsonPath("$.email").value("google@example.com"));
    var u = usuarios.findByGoogleSub("google-sub-123").orElseThrow();
    assertNull(u.getPasswordHash());
    assertEquals(Usuario.Rol.CLIENTE, u.getRol());
    assertEquals("", clientes.findByUsuarioId(u.getId()).orElseThrow().getTelefono());
    callback("changed-email");
    assertEquals(1, usuarios.count());
    assertEquals(u.getId(), usuarios.findByGoogleSub("google-sub-123").orElseThrow().getId());
  }

  @Test
  void googleNoOmiteElSegundoFactor() throws Exception {
    var initial = callback("valid");
    var session = (MockHttpSession) initial.getRequest().getSession(false);
    var setup =
        mvc.perform(post("/api/account/security/setup").session(session).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();
    String secret = json.readTree(setup.getResponse().getContentAsString()).get("secret").asText();
    var enable =
        mvc.perform(
                post("/api/account/security/enable")
                    .session(session)
                    .with(csrf())
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of(
                                "code",
                                com.LenasLYS.Backend.servicio.Totp.codigo(
                                    secret, Instant.now().getEpochSecond() / 30)))))
            .andExpect(status().isOk())
            .andReturn();
    String recovery =
        json.readTree(enable.getResponse().getContentAsString())
            .get("recoveryCodes")
            .get(0)
            .asText();
    var next = callback("valid");
    assertEquals(
        "http://localhost:5173/iniciar-sesion?two_factor=1", next.getResponse().getRedirectedUrl());
    var pending = (MockHttpSession) next.getRequest().getSession(false);
    mvc.perform(get("/api/auth/me").session(pending)).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/auth/2fa/verify")
                .session(pending)
                .with(csrf())
                .contentType("application/json")
                .content(json.writeValueAsString(Map.of("code", recovery))))
        .andExpect(status().isOk());
    mvc.perform(get("/api/auth/me").session(pending)).andExpect(status().isOk());
  }

  @Test
  void preferenciasSeGuardanAntesDeCompletarElCelular() throws Exception {
    var resultado = callback("valid");
    var s = (MockHttpSession) resultado.getRequest().getSession(false);
    String cuenta =
        mvc.perform(get("/api/account").session(s))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    mvc.perform(
            put("/api/account")
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(cuenta))
        .andExpect(status().isOk());
    assertEquals(
        "",
        clientes
            .findByUsuarioId(usuarios.findByGoogleSub("google-sub-123").orElseThrow().getId())
            .orElseThrow()
            .getTelefono());
  }

  @Test
  void noVinculaUnaCuentaLocalSoloPorCorreo() throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(
                    json.writeValueAsString(
                        Map.of(
                            "name",
                            "Local",
                            "email",
                            "google@example.com",
                            "phone",
                            "+51987654321",
                            "password",
                            "Prueba2026!",
                            "termsAccepted",
                            true))))
        .andExpect(status().isCreated());
    var respuesta = callback("valid");
    assertTrue(respuesta.getResponse().getRedirectedUrl().endsWith("google_error=account_exists"));
    assertEquals(1, usuarios.count());
    assertNull(usuarios.findByEmail("google@example.com").orElseThrow().getGoogleSub());
  }

  @Test
  void vinculacionRetirada() throws Exception {
    var result = callback("valid");
    mvc.perform(
            post("/api/auth/google/link")
                .session((MockHttpSession) result.getRequest().getSession(false))
                .with(csrf()))
        .andExpect(status().isNotFound());
  }

  @Test
  void rechazaCorreoNoVerificadoYCuentaDeshabilitada() throws Exception {
    assertTrue(
        callback("unverified")
            .getResponse()
            .getRedirectedUrl()
            .endsWith("google_error=identity_invalid"));
    assertEquals(0, usuarios.count());
    callback("valid");
    var u = usuarios.findByGoogleSub("google-sub-123").orElseThrow();
    u.setActivo(false);
    usuarios.saveAndFlush(u);
    assertTrue(
        callback("valid")
            .getResponse()
            .getRedirectedUrl()
            .endsWith("google_error=account_disabled"));
  }

  @Test
  void validaFirmaAudienciaYVigenciaDelToken() throws Exception {
    for (String codigo : List.of("invalid-signature", "wrong-audience", "expired")) {
      assertTrue(
          callback(codigo)
              .getResponse()
              .getRedirectedUrl()
              .endsWith("google_error=cancelled_or_failed"),
          codigo);
      assertEquals(0, usuarios.count());
    }
  }

  @Test
  void rechazaCallbackSinEstadoYCancelacion() throws Exception {
    mvc.perform(get("/login/oauth2/code/google").param("code", "valid").param("state", "inventado"))
        .andExpect(status().is3xxRedirection())
        .andExpect(
            redirectedUrl("http://localhost:5173/iniciar-sesion?google_error=cancelled_or_failed"));
    var inicio = mvc.perform(get("/oauth2/authorization/google")).andReturn();
    var params = parametros(URI.create(inicio.getResponse().getRedirectedUrl()).getRawQuery());
    mvc.perform(
            get("/login/oauth2/code/google")
                .session((MockHttpSession) inicio.getRequest().getSession(false))
                .param("error", "access_denied")
                .param("state", params.get("state")))
        .andExpect(status().is3xxRedirection())
        .andExpect(
            redirectedUrl("http://localhost:5173/iniciar-sesion?google_error=cancelled_or_failed"));
    assertEquals(0, usuarios.count());
  }

  static Map<String, String> parametros(String texto) {
    Map<String, String> m = new HashMap<>();
    for (var par : texto.split("&")) {
      var partes = par.split("=", 2);
      m.put(
          URLDecoder.decode(partes[0], StandardCharsets.UTF_8),
          partes.length > 1 ? URLDecoder.decode(partes[1], StandardCharsets.UTF_8) : "");
    }
    return m;
  }

  static class ProveedorGoogle {
    final HttpServer server;
    final String url;
    final RSAKey key;
    final RSAKey otra;
    volatile String nonce = "";
    volatile String codigo = "";

    ProveedorGoogle() {
      try {
        key = new RSAKeyGenerator(2048).keyID("test-key").generate();
        otra = new RSAKeyGenerator(2048).keyID("test-key").generate();
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        url = "http://127.0.0.1:" + server.getAddress().getPort();
        server.createContext(
            "/jwks",
            ex -> {
              byte[] body =
                  new JWKSet(key.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8);
              ex.getResponseHeaders().set("Content-Type", "application/json");
              ex.sendResponseHeaders(200, body.length);
              ex.getResponseBody().write(body);
              ex.close();
            });
        server.createContext(
            "/token",
            ex -> {
              try {
                codigo =
                    parametros(
                            new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8))
                        .get("code");
                byte[] body =
                    new ObjectMapper()
                        .writeValueAsBytes(
                            Map.of(
                                "access_token",
                                "test-access",
                                "token_type",
                                "Bearer",
                                "expires_in",
                                3600,
                                "scope",
                                "openid email profile",
                                "id_token",
                                jwt(codigo)));
                ex.getResponseHeaders().set("Content-Type", "application/json");
                ex.sendResponseHeaders(200, body.length);
                ex.getResponseBody().write(body);
              } catch (Exception e) {
                ex.sendResponseHeaders(500, -1);
              } finally {
                ex.close();
              }
            });
        server.createContext(
            "/userinfo",
            ex -> {
              byte[] body =
                  ("{\"sub\":\"google-sub-123\",\"email\":\""
                          + (codigo.equals("changed-email")
                              ? "nuevo@example.com"
                              : "google@example.com")
                          + "\",\"email_verified\":"
                          + !codigo.equals("unverified")
                          + ",\"name\":\"Cliente Google\"}")
                      .getBytes(StandardCharsets.UTF_8);
              ex.getResponseHeaders().set("Content-Type", "application/json");
              ex.sendResponseHeaders(200, body.length);
              ex.getResponseBody().write(body);
              ex.close();
            });
        server.start();
      } catch (Exception e) {
        throw new IllegalStateException(e);
      }
    }

    String jwt(String code) throws Exception {
      var now = Instant.now();
      var claims =
          new JWTClaimsSet.Builder()
              .issuer(url)
              .subject("google-sub-123")
              .audience(code.equals("wrong-audience") ? "otra-app" : "test-client")
              .issueTime(Date.from(now.minusSeconds(code.equals("expired") ? 1000 : 0)))
              .expirationTime(Date.from(now.plusSeconds(code.equals("expired") ? -900 : 300)))
              .claim("nonce", nonce)
              .claim(
                  "email",
                  code.equals("changed-email") ? "nuevo@example.com" : "google@example.com")
              .claim("email_verified", !code.equals("unverified"))
              .claim("name", "Cliente Google")
              .build();
      var token =
          new SignedJWT(
              new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("test-key").build(), claims);
      token.sign(new RSASSASigner(code.equals("invalid-signature") ? otra : key));
      return token.serialize();
    }
  }
}
