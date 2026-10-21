package com.LenasLYS.Backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeparacionClientesTest {
  @Autowired MockMvc mvc;
  @Autowired UsuarioRepositorio usuarios;
  @Autowired ClienteRepositorio clientes;
  @Autowired RolRepositorio roles;
  @Autowired RecuperacionRepositorio tokens;
  @Autowired PasswordEncoder encoder;
  @Autowired ObjectMapper json;
  @Autowired JdbcTemplate jdbc;

  @BeforeEach
  void limpiar() {
    tokens.deleteAll();
    clientes.deleteAll();
    usuarios.deleteAll();
  }

  MockHttpSession registrar() throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(
                    "{\"name\":\"Cliente"
                        + " Prueba\",\"email\":\"cliente@example.com\",\"phone\":\"+51987654321\",\"password\":\"Prueba2026!\",\"termsAccepted\":true,\"role\":\"administrador\"}"))
        .andExpect(status().isCreated());
    return login("cliente@example.com");
  }

  MockHttpSession login(String email) throws Exception {
    return (MockHttpSession)
        mvc.perform(
                post("/api/auth/login")
                    .with(csrf())
                    .contentType("application/json")
                    .content("{\"email\":\"" + email + "\",\"password\":\"Prueba2026!\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);
  }

  @Test
  void registroCreaUsuarioYClienteConRolPersistido() throws Exception {
    registrar();
    assertEquals(1, usuarios.count());
    assertEquals(1, clientes.count());
    assertEquals(5, roles.count());
    var u = usuarios.findByEmail("cliente@example.com").orElseThrow();
    var c = clientes.findByUsuarioId(u.getId()).orElseThrow();
    assertEquals("CLIENTE", u.getRolAsignado().getNombre());
    assertEquals("Cliente Prueba", c.getNombre());
    assertEquals("+51987654321", c.getTelefono());
    assertEquals(
        1, jdbc.queryForObject("SELECT id_rol FROM usuarios WHERE id=?", Integer.class, u.getId()));
    assertEquals(
        0,
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='USUARIOS' AND"
                + " column_name IN ('TELEFONO','CUENTA','ROL')",
            Integer.class));
  }

  @Test
  void perfilSeActualizaEnClientesSinCopiarCredenciales() throws Exception {
    var s = registrar();
    var data =
        json.readTree(
            mvc.perform(get("/api/account").session(s))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
    var p = (com.fasterxml.jackson.databind.node.ObjectNode) data.get("profile");
    p.put("name", "Nuevo Nombre");
    p.put("phone", "912345678");
    p.put("documentType", "DNI");
    p.put("document", "12345678");
    p.put("notes", "Entrega por la puerta lateral");
    mvc.perform(
            put("/api/account")
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(json.writeValueAsString(data)))
        .andExpect(status().isOk());
    var u = usuarios.findByEmail("cliente@example.com").orElseThrow();
    var c = clientes.findByUsuarioId(u.getId()).orElseThrow();
    assertEquals("Nuevo Nombre", c.getNombre());
    assertEquals("+51912345678", c.getTelefono());
    assertEquals("12345678", c.getDocumento());
    assertEquals("Entrega por la puerta lateral", c.getNotas());
    assertFalse(c.getCuenta().contains("profile"));
    assertFalse(c.getCuenta().contains("password"));
    mvc.perform(get("/api/auth/me").session(s))
        .andExpect(jsonPath("$.name").value("Nuevo Nombre"))
        .andExpect(jsonPath("$.phone").value("+51912345678"));
    mvc.perform(get("/api/account").session(s))
        .andExpect(jsonPath("$.profile.document").value("12345678"));
  }

  @Test
  void personalIniciaSesionSinCrearPerfilCliente() throws Exception {
    for (var role : Usuario.Rol.values()) {
      if (role == Usuario.Rol.CLIENTE) continue;
      Usuario u = new Usuario();
      u.setNombre("Personal");
      u.setEmail(role.name().toLowerCase() + "@example.com");
      u.setPasswordHash(encoder.encode("Prueba2026!"));
      u.setRolAsignado(roles.findByNombre(role.name()).orElseThrow());
      usuarios.saveAndFlush(u);
      var s = login(u.getEmail());
      mvc.perform(get("/api/auth/me").session(s))
          .andExpect(jsonPath("$.role").value(role.name().toLowerCase()));
      mvc.perform(get("/api/account").session(s)).andExpect(status().isForbidden());
    }
    assertEquals(4, usuarios.count());
    assertEquals(0, clientes.count());
  }

  @Test
  void clientePresencialPuedeExistirSinCuenta() {
    Cliente c = new Cliente();
    c.setNombre("Venta presencial");
    c.setTelefono("912345678");
    clientes.saveAndFlush(c);
    assertNull(clientes.findById(c.getId()).orElseThrow().getUsuario());
    assertEquals(0, usuarios.count());
  }
}
