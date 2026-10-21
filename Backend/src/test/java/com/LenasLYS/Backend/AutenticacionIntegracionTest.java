package com.LenasLYS.Backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.*;
import com.LenasLYS.Backend.servicio.RecuperacionServicio;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AutenticacionIntegracionTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired UsuarioRepositorio usuarios;
  @Autowired ClienteRepositorio clientes;
  @Autowired RecuperacionRepositorio tokens;
  @Autowired PasswordEncoder encoder;
  @MockitoBean JavaMailSender mail;
  final String clave = "Prueba2026!";

  @BeforeEach
  void limpiar() {
    tokens.deleteAll();
    clientes.deleteAll();
    usuarios.deleteAll();
    reset(mail);
  }

  String registro(String email) throws Exception {
    return json.writeValueAsString(
        Map.of(
            "name",
            "Cliente Prueba",
            "email",
            email,
            "phone",
            "+51987654321",
            "password",
            clave,
            "termsAccepted",
            true,
            "role",
            "administrador"));
  }

  void crear(String email) throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registro(email)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.role").value("cliente"))
        .andExpect(jsonPath("$.passwordHash").doesNotExist());
  }

  MockHttpSession login(String email, String password) throws Exception {
    return (MockHttpSession)
        mvc.perform(
                post("/api/auth/login")
                    .with(csrf())
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of("email", email, "password", password, "remember", false))))
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);
  }

  @Test
  void registraClienteConHashYCorreoNormalizado() throws Exception {
    crear("CLIENTE@example.com");
    var u = usuarios.findByEmail("cliente@example.com").orElseThrow();
    assertEquals(Usuario.Rol.CLIENTE, u.getRol());
    assertNotEquals(clave, u.getPasswordHash());
    assertTrue(encoder.matches(clave, u.getPasswordHash()));
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registro("cliente@example.com")))
        .andExpect(status().isConflict());
  }

  @Test
  void rechazaDatosInvalidosYFaltaDeCsrf() throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .contentType("application/json")
                .content(registro("c@example.com")))
        .andExpect(status().isForbidden());
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registro("c@example.com").replace(clave, "abc")))
        .andExpect(status().isBadRequest());
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registro("c@example.com").replace("true", "false")))
        .andExpect(status().isBadRequest());
  }

  @Test
  void loginRechazaClaveIncorrectaYProtegeCuenta() throws Exception {
    crear("c@example.com");
    mvc.perform(get("/api/account")).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/auth/login")
                .with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"c@example.com\",\"password\":\"incorrecta\"}"))
        .andExpect(status().isUnauthorized());
    var s = login("c@example.com", clave);
    mvc.perform(get("/api/auth/me").session(s))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("c@example.com"));
    mvc.perform(get("/api/admin/prueba").session(s)).andExpect(status().isForbidden());
  }

  @Test
  void tokenCsrfRealPermiteLoginYLogout() throws Exception {
    crear("c@example.com");
    var inicial = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
    var s = (MockHttpSession) inicial.getRequest().getSession(false);
    var token = json.readTree(inicial.getResponse().getContentAsString());
    mvc.perform(
            post("/api/auth/login")
                .session(s)
                .header(token.get("headerName").asText(), token.get("token").asText())
                .contentType("application/json")
                .content(
                    "{\"email\":\"c@example.com\",\"password\":\"Prueba2026!\",\"remember\":true}"))
        .andExpect(status().isOk())
        .andExpect(
            header()
                .string(
                    "Set-Cookie",
                    org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.containsString("HttpOnly"),
                        org.hamcrest.Matchers.containsString("Max-Age=604800"))));
    mvc.perform(post("/api/auth/logout").session(s).with(csrf())).andExpect(status().isNoContent());
    assertTrue(s.isInvalid());
  }

  @Test
  void persisteCuentaYAislaUsuarios() throws Exception {
    crear("uno@example.com");
    crear("dos@example.com");
    var uno = login("uno@example.com", clave);
    var dos = login("dos@example.com", clave);
    var data =
        json.readTree(
            mvc.perform(get("/api/account").session(uno))
                .andReturn()
                .getResponse()
                .getContentAsString());
    ((com.fasterxml.jackson.databind.node.ObjectNode) data.get("profile"))
        .put("name", "Nombre editado");
    ((com.fasterxml.jackson.databind.node.ArrayNode) data.get("addresses"))
        .add(
            json.valueToTree(
                Map.of(
                    "id",
                    "casa",
                    "label",
                    "Casa",
                    "street",
                    "Av. Ejemplo 123",
                    "district",
                    "Lima",
                    "reference",
                    "Frente al parque",
                    "primary",
                    true)));
    mvc.perform(
            put("/api/account")
                .session(uno)
                .with(csrf())
                .contentType("application/json")
                .content(data.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.addresses[0].street").value("Av. Ejemplo 123"));
    mvc.perform(get("/api/account").session(dos))
        .andExpect(jsonPath("$.addresses").isEmpty())
        .andExpect(jsonPath("$.profile.name").value("Cliente Prueba"));
    var otra = login("uno@example.com", clave);
    mvc.perform(get("/api/account").session(otra))
        .andExpect(jsonPath("$.profile.name").value("Nombre editado"));
  }

  @Test
  void rechazaCambioDeCorreoYSolicitudesDeTarjetaInvalida() throws Exception {
    crear("c@example.com");
    var s = login("c@example.com", clave);
    var data =
        json.readTree(
            mvc.perform(get("/api/account").session(s))
                .andReturn()
                .getResponse()
                .getContentAsString());
    ((com.fasterxml.jackson.databind.node.ObjectNode) data.get("profile"))
        .put("email", "otro@example.com");
    mvc.perform(
            put("/api/account")
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(data.toString()))
        .andExpect(status().isBadRequest());
    ((com.fasterxml.jackson.databind.node.ObjectNode) data.get("profile"))
        .put("email", "c@example.com");
    ((com.fasterxml.jackson.databind.node.ArrayNode) data.get("cards"))
        .add(
            json.valueToTree(
                Map.of(
                    "id",
                    "visa",
                    "brand",
                    "Visa",
                    "last4",
                    "1234567812345678",
                    "holder",
                    "Prueba",
                    "expiry",
                    "12/29",
                    "primary",
                    true)));
    mvc.perform(
            put("/api/account")
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(data.toString()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void cambioDeClaveInvalidaTodasLasSesiones() throws Exception {
    crear("c@example.com");
    var uno = login("c@example.com", clave);
    var dos = login("c@example.com", clave);
    mvc.perform(
            post("/api/auth/password")
                .session(uno)
                .with(csrf())
                .contentType("application/json")
                .content("{\"previous\":\"Prueba2026!\",\"next\":\"Nueva2026!\"}"))
        .andExpect(status().isNoContent());
    mvc.perform(get("/api/account").session(dos)).andExpect(status().isUnauthorized());
    login("c@example.com", "Nueva2026!");
  }

  @Test
  void recuperacionNoExponeTokenYEsDeUnSoloUso() throws Exception {
    crear("c@example.com");
    var s = login("c@example.com", clave);
    mvc.perform(
            post("/api/auth/forgot-password")
                .with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"c@example.com\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").doesNotExist());
    var captor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mail).send(captor.capture());
    String raw = captor.getValue().getText().split("token=")[1].split("\n")[0];
    assertEquals(RecuperacionServicio.hash(raw), tokens.findAll().get(0).getTokenHash());
    String payload = json.writeValueAsString(Map.of("token", raw, "password", "Nueva2026!"));
    mvc.perform(
            post("/api/auth/reset-password")
                .with(csrf())
                .contentType("application/json")
                .content(payload))
        .andExpect(status().isNoContent());
    mvc.perform(
            post("/api/auth/reset-password")
                .with(csrf())
                .contentType("application/json")
                .content(payload))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/account").session(s)).andExpect(status().isUnauthorized());
    login("c@example.com", "Nueva2026!");
  }

  @Test
  void rechazaTokenVencidoYNoEnumeraCorreos() throws Exception {
    crear("c@example.com");
    var t = new Recuperacion();
    t.setUsuarioId(usuarios.findByEmail("c@example.com").orElseThrow().getId());
    t.setTokenHash(RecuperacionServicio.hash("vencido"));
    t.setVence(Instant.now().minusSeconds(1));
    tokens.saveAndFlush(t);
    mvc.perform(
            post("/api/auth/reset-password")
                .with(csrf())
                .contentType("application/json")
                .content("{\"token\":\"vencido\",\"password\":\"Nueva2026!\"}"))
        .andExpect(status().isBadRequest());
    mvc.perform(
            post("/api/auth/forgot-password")
                .with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"desconocido@example.com\"}"))
        .andExpect(status().isOk());
    verifyNoInteractions(mail);
  }
}
