package com.LenasLYS.Backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PerfilPersonalIntegracionTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired UsuarioRepositorio usuarios;
  @Autowired ClienteRepositorio clientes;
  @Autowired RolRepositorio roles;
  @Autowired PerfilPersonalRepositorio perfiles;
  @Autowired PasswordEncoder encoder;
  Usuario usuario;

  @BeforeEach
  void crear() {
    usuario = new Usuario();
    usuario.setNombre("Cajero Prueba");
    usuario.setEmail("perfil.personal@test.com");
    usuario.setPasswordHash(encoder.encode("Prueba2026!"));
    usuario.setRolAsignado(roles.findByNombre("CAJA").orElseThrow());
    usuarios.saveAndFlush(usuario);
  }

  MockHttpSession login() throws Exception {
    return (MockHttpSession)
        mvc.perform(
                post("/api/auth/login")
                    .with(csrf())
                    .contentType("application/json")
                    .content(
                        "{\"email\":\"perfil.personal@test.com\",\"password\":\"Prueba2026!\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);
  }

  ObjectNode perfil(MockHttpSession session) throws Exception {
    return (ObjectNode)
        json.readTree(
            mvc.perform(get("/api/account/personal").session(session))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
  }

  @Test
  void personalLeeSuPerfilSinCrearCliente() throws Exception {
    long totalClientes = clientes.count();
    var s = login();
    assertEquals("Cajero Prueba", perfil(s).path("name").asText());
    assertEquals(totalClientes, clientes.count());
    assertFalse(perfiles.existsById(usuario.getId()));
    mvc.perform(get("/api/account").session(s)).andExpect(status().isForbidden());
  }

  @Test
  void actualizaDatosSinCambiarRolNiCredenciales() throws Exception {
    long totalClientes = clientes.count();
    String hash = usuario.getPasswordHash();
    var s = login();
    ObjectNode dto = perfil(s);
    dto.put("name", "Fernando Actualizado");
    dto.put("phone", "912345678");
    dto.put("document", "12345678");
    dto.put("role", "administrador");
    dto.put("notes", "Turno tarde");
    mvc.perform(
            put("/api/account/personal")
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(json.writeValueAsString(dto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("name").value("Fernando Actualizado"));
    assertEquals("CAJA", usuario.getRol().name());
    assertEquals(hash, usuario.getPasswordHash());
    assertEquals(totalClientes, clientes.count());
    mvc.perform(get("/api/account/personal").session(login()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("document").value("12345678"))
        .andExpect(jsonPath("phone").value("912345678"));
    mvc.perform(get("/api/auth/me").session(s))
        .andExpect(jsonPath("name").value("Fernando Actualizado"))
        .andExpect(jsonPath("role").value("caja"));
  }

  @Test
  void rechazaCambioDeCorreo() throws Exception {
    var s = login();
    ObjectNode dto = perfil(s);
    dto.put("email", "otro@test.com");
    mvc.perform(
            put("/api/account/personal")
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(json.writeValueAsString(dto)))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.message")
                .value("El cambio de correo requiere verificación y aún no está disponible."));
    assertEquals("perfil.personal@test.com", usuario.getEmail());
  }

  @Test
  void exigeSesionYCsrf() throws Exception {
    mvc.perform(get("/api/account/personal")).andExpect(status().isUnauthorized());
    var s = login();
    mvc.perform(
            put("/api/account/personal")
                .session(s)
                .contentType("application/json")
                .content(json.writeValueAsString(perfil(s))))
        .andExpect(status().isForbidden());
  }

  @Test
  void clientesNoUsanElPerfilDePersonal() throws Exception {
    usuario.setRolAsignado(roles.findByNombre("CLIENTE").orElseThrow());
    usuarios.saveAndFlush(usuario);
    mvc.perform(get("/api/account/personal").session(login())).andExpect(status().isForbidden());
  }
}
