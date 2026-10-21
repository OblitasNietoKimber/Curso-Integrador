package com.LenasLYS.Backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.repositorio.*;
import com.LenasLYS.Backend.servicio.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest(properties = "app.auth.totp-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SegundoFactorIntegracionTest {
  @Autowired org.springframework.test.web.servlet.MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired UsuarioRepositorio usuarios;
  @Autowired ClienteRepositorio clientes;
  @Autowired RecuperacionRepositorio tokens;
  final String email = "seguridad@example.com";

  @BeforeEach
  void limpiar() {
    tokens.deleteAll();
    clientes.deleteAll();
    usuarios.deleteAll();
  }

  MockHttpServletRequestBuilder peticion(String path, Object value, MockHttpSession s)
      throws Exception {
    var req =
        post(path)
            .with(csrf())
            .contentType("application/json")
            .content(json.writeValueAsString(value));
    return s == null ? req : req.session(s);
  }

  MockHttpSession iniciar() throws Exception {
    return (MockHttpSession)
        mvc.perform(
                peticion(
                    "/api/auth/login", Map.of("email", email, "password", "Prueba2026!"), null))
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);
  }

  MockHttpSession crear() throws Exception {
    mvc.perform(
            peticion(
                "/api/auth/register",
                Map.of(
                    "name",
                    "Prueba",
                    "email",
                    email,
                    "phone",
                    "+51987654321",
                    "password",
                    "Prueba2026!",
                    "termsAccepted",
                    true),
                null))
        .andExpect(status().isCreated());
    return iniciar();
  }

  String preparar(MockHttpSession s) throws Exception {
    var result =
        mvc.perform(peticion("/api/account/security/setup", Map.of(), s))
            .andExpect(status().isOk())
            .andExpect(header().string("Cache-Control", "no-store"))
            .andReturn();
    return json.readTree(result.getResponse().getContentAsString()).get("secret").asText();
  }

  List<String> activar(MockHttpSession s, String secret) throws Exception {
    var result =
        mvc.perform(
                peticion(
                    "/api/account/security/enable",
                    Map.of("code", Totp.codigo(secret, Instant.now().getEpochSecond() / 30)),
                    s))
            .andExpect(status().isOk())
            .andReturn();
    List<String> codes = new ArrayList<>();
    json.readTree(result.getResponse().getContentAsString())
        .get("recoveryCodes")
        .forEach(n -> codes.add(n.asText()));
    return codes;
  }

  @Test
  void vectorRfcYVentanaTemporal() {
    String secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    assertEquals("287082", Totp.codigo(secret, 59 / 30));
    assertEquals("081804", Totp.codigo(secret, 1111111109L / 30));
    assertEquals(-1, Totp.verificar(secret, "287082", 1, 59));
    assertEquals(-1, Totp.verificar(secret, "287082", -1, 180));
    assertEquals(-1, Totp.verificar(secret, "abc", -1, 59));
    assertEquals(1, Totp.verificar(secret, "287082", -1, 59));
  }

  @Test
  void altaCifraSecretoExigeSegundoPasoYNoReutilizaRecuperacion() throws Exception {
    var s = crear();
    var otra = iniciar();
    String secret = preparar(s);
    mvc.perform(get("/api/account/security").session(s))
        .andExpect(jsonPath("$.enabled").value(false));
    mvc.perform(peticion("/api/account/security/enable", Map.of("code", "------"), s))
        .andExpect(status().isBadRequest());
    var codes = activar(s, secret);
    assertEquals(8, codes.size());
    var u = usuarios.findByEmail(email).orElseThrow();
    assertFalse(u.getTotpSecret().contains(secret));
    assertFalse(u.getTotpRecovery().contains(codes.get(0)));
    mvc.perform(get("/api/auth/me").session(otra)).andExpect(status().isUnauthorized());
    var pending = iniciar();
    mvc.perform(get("/api/account").session(pending)).andExpect(status().isUnauthorized());
    mvc.perform(
            peticion(
                "/api/auth/2fa/verify",
                Map.of("code", Totp.codigo(secret, u.getTotpCounter())),
                pending))
        .andExpect(status().isBadRequest());
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", codes.get(0)), pending))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(email));
    mvc.perform(get("/api/account").session(pending)).andExpect(status().isOk());
    var next = iniciar();
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", codes.get(0)), next))
        .andExpect(status().isBadRequest());
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", codes.get(1)), next))
        .andExpect(status().isOk());
  }

  @Test
  void aceptaCodigoNuevoYRechazaReutilizacion() throws Exception {
    var s = crear();
    String secret = preparar(s);
    activar(s, secret);
    var u = usuarios.findByEmail(email).orElseThrow();
    u.setTotpCounter(Instant.now().getEpochSecond() / 30 - 2);
    usuarios.save(u);
    String code = Totp.codigo(secret, Instant.now().getEpochSecond() / 30);
    var a = iniciar();
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", code), a))
        .andExpect(status().isOk());
    var b = iniciar();
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", code), b))
        .andExpect(status().isBadRequest());
  }

  @Test
  void desactivarRequiereCodigoYRevocaSesiones() throws Exception {
    var s = crear();
    var codes = activar(s, preparar(s));
    var otra = iniciar();
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", codes.get(0)), otra))
        .andExpect(status().isOk());
    mvc.perform(peticion("/api/account/security/disable", Map.of("code", "------"), s))
        .andExpect(status().isBadRequest());
    mvc.perform(peticion("/api/account/security/disable", Map.of("code", codes.get(1)), s))
        .andExpect(status().isNoContent());
    mvc.perform(get("/api/auth/me").session(otra)).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/auth/me").session(iniciar())).andExpect(status().isOk());
    assertNull(usuarios.findByEmail(email).orElseThrow().getTotpSecret());
  }

  @Test
  void desafioVenceLimitaIntentosYExigeCsrf() throws Exception {
    var s = crear();
    activar(s, preparar(s));
    var pending = iniciar();
    mvc.perform(
            post("/api/auth/2fa/verify")
                .session(pending)
                .contentType("application/json")
                .content("{\"code\":\"123456\"}"))
        .andExpect(status().isForbidden());
    for (int i = 0; i < 5; i++)
      mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", "------"), pending))
          .andExpect(status().isBadRequest());
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", "------"), pending))
        .andExpect(status().isTooManyRequests());
    var expired = iniciar();
    var p = (AccesoSesionServicio.Pendiente) expired.getAttribute("segundoFactor");
    expired.setAttribute(
        "segundoFactor",
        new AccesoSesionServicio.Pendiente(
            p.id(), p.version(), Instant.now().minusSeconds(1), false));
    mvc.perform(peticion("/api/auth/2fa/verify", Map.of("code", "123456"), expired))
        .andExpect(status().isUnauthorized());
  }
}
