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
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class AdminIntegracionTest {
 @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired UsuarioRepositorio usuarios;@Autowired RolRepositorio roles;@Autowired PasswordEncoder encoder;
 @Autowired ClienteRepositorio clientes;
 Usuario admin;
 @BeforeEach void preparar(){admin=crear("admin.panel@test.com","ADMINISTRADOR");}
 Usuario crear(String email,String rol){var u=new Usuario();u.setNombre("Personal Prueba");u.setEmail(email);u.setPasswordHash(encoder.encode("Prueba2026!"));u.setRolAsignado(roles.findByNombre(rol).orElseThrow());return usuarios.saveAndFlush(u);}
 MockHttpSession login(String email)throws Exception{return (MockHttpSession)mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json").content("{\"email\":\""+email+"\",\"password\":\"Prueba2026!\"}")).andExpect(status().isOk()).andReturn().getRequest().getSession(false);}
 @Test void soloAdministradorPuedeGestionar()throws Exception{crear("caja.panel@test.com","CAJA");var s=login("caja.panel@test.com");for(String path:new String[]{"promociones","clientes","usuarios","configuracion","productos"}){mvc.perform(get("/api/admin/"+path).session(s)).andExpect(status().isForbidden());}}
 @Test void promocionSePublicaYDesactivaEnCatalogo()throws Exception{var s=login(admin.getEmail());String body="{\"nombre\":\"Combo Prueba\",\"precio\":19.90,\"precioOriginal\":25,\"activa\":true}";var result=mvc.perform(post("/api/admin/promociones").session(s).with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn();String id=json.readTree(result.getResponse().getContentAsString()).get("id").asText();mvc.perform(get("/api/promociones/"+id)).andExpect(status().isOk()).andExpect(jsonPath("precio").value(19.9));mvc.perform(put("/api/admin/promociones/"+id).session(s).with(csrf()).contentType("application/json").content(body.replace("true","false"))).andExpect(status().isOk());mvc.perform(get("/api/promociones/"+id)).andExpect(status().isNotFound());}
 @Test void noPermiteQuitarseElRolNiExponerCredenciales()throws Exception{var s=login(admin.getEmail());mvc.perform(put("/api/admin/usuarios/"+admin.getId()).session(s).with(csrf()).contentType("application/json").content("{\"nombre\":\"Admin\",\"email\":\"admin.panel@test.com\",\"rol\":\"CAJA\",\"activo\":true}")).andExpect(status().isBadRequest());mvc.perform(get("/api/admin/usuarios").session(s)).andExpect(status().isOk()).andExpect(jsonPath("$[0].passwordHash").doesNotExist()).andExpect(jsonPath("$[0].totpSecret").doesNotExist());}
 @Test void crearPersonalNoCreaClienteYExigeCsrf()throws Exception{var s=login(admin.getEmail());long antes=clientes.count();String body="{\"nombre\":\"Cocinero\",\"email\":\"nuevo.personal@test.com\",\"rol\":\"COCINA\",\"activo\":true,\"password\":\"Prueba2026!\"}";mvc.perform(post("/api/admin/usuarios").session(s).contentType("application/json").content(body)).andExpect(status().isForbidden());mvc.perform(post("/api/admin/usuarios").session(s).with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated()).andExpect(jsonPath("rol").value("COCINA"));assertEquals(antes,clientes.count());assertTrue(encoder.matches("Prueba2026!",usuarios.findByEmail("nuevo.personal@test.com").orElseThrow().getPasswordHash()));}
 @Test void configuracionPersiste()throws Exception{var s=login(admin.getEmail());String body="{\"nombre\":\"LYS Prueba\",\"direccion\":\"Lima\",\"telefono\":\"999888777\",\"email\":\"ventas@test.com\",\"ruc\":\"20123456789\",\"horario\":\"12:00 a 23:00\"}";mvc.perform(put("/api/admin/configuracion").session(s).with(csrf()).contentType("application/json").content(body)).andExpect(status().isOk());mvc.perform(get("/api/admin/configuracion").session(s)).andExpect(status().isOk()).andExpect(jsonPath("nombre").value("LYS Prueba"));}
 @Test void edicionClienteConservaSeguridad()throws Exception{var u=crear("cliente.panel@test.com","CLIENTE");var c=new Cliente();c.setUsuario(u);c.setNombre(u.getNombre());clientes.saveAndFlush(c);String hash=u.getPasswordHash();var s=login(admin.getEmail());mvc.perform(put("/api/admin/clientes/"+c.getId()).session(s).with(csrf()).contentType("application/json").content("{\"nombre\":\"Cliente Editado\",\"telefono\":\"912345678\",\"tipoDocumento\":\"DNI\",\"documento\":\"12345678\",\"notas\":\"Preferente\"}")).andExpect(status().isOk());assertEquals(hash,u.getPasswordHash());assertEquals(Usuario.Rol.CLIENTE,u.getRol());assertEquals("Cliente Editado",u.getNombre());}
}
