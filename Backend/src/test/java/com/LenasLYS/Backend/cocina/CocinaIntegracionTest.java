package com.LenasLYS.Backend.cocina;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.caja.*;
import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = {
    "spring.datasource.url=${COCINA_TEST_URL:jdbc:h2:mem:lys_cocina_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1}",
    "spring.datasource.driver-class-name=${COCINA_TEST_DRIVER:org.h2.Driver}",
    "spring.datasource.username=${COCINA_TEST_USER:sa}",
    "spring.datasource.password=${COCINA_TEST_PASSWORD:}"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CocinaIntegracionTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired PedidoCajaRepositorio pedidos;
  @Autowired ProductoRepositorio productos;
  @Autowired UsuarioRepositorio usuarios;
  @Autowired RolRepositorio roles;
  @Autowired TurnoRepositorio turnos;
  @Autowired CocinaServicio cocina;

  org.springframework.test.web.servlet.request.RequestPostProcessor identidad(String rol) {
    Usuario u = new Usuario(); u.setNombre("Operador"); u.setEmail(java.util.UUID.randomUUID() + "@test.com");
    u.setRolAsignado(roles.findByNombre(rol).orElseThrow()); usuarios.saveAndFlush(u);
    return identidad(u);
  }
  org.springframework.test.web.servlet.request.RequestPostProcessor identidad(Usuario u) {
    return request -> {
      request = user(u.getId().toString()).roles(u.getRol().name()).postProcessRequest(request);
      request.getSession(true).setAttribute("authVersion", u.getVersionSesion());
      return request;
    };
  }

  PedidoCaja pedido() {
    PedidoCaja p = new PedidoCaja(); p.id = "COCINA-TEST"; p.cliente = "Cliente";
    p.canal = "Salón"; p.mesa = "3";
    p.items.add(new PedidoCaja.Linea("Pollo", 2, new BigDecimal("25.00")));
    return pedidos.saveAndFlush(p);
  }

  void cambiar(String esperado, String estado, String rol, int resultado) throws Exception {
    mvc.perform(post("/api/cocina/pedidos/COCINA-TEST/estado")
        .with(identidad(rol)).with(csrf()).contentType("application/json")
        .content(json.writeValueAsString(Map.of("esperado", esperado, "estado", estado))))
        .andExpect(status().is(resultado));
  }

  @Test void persisteEstadosYRechazaActualizacionesObsoletas() throws Exception {
    PedidoCaja p = pedido();
    cambiar("Recibido", "Listo", "COCINA", 409);
    cambiar("Recibido", "En preparación", "COCINA", 200);
    assertNotNull(p.aceptado);
    cambiar("Recibido", "En preparación", "COCINA", 409);
    cambiar("En preparación", "Listo", "COCINA", 200);
    assertNotNull(p.listo);
    cambiar("Listo", "Entregado", "COCINA", 409);
    cambiar("Listo", "Entregado", "ADMINISTRADOR", 200);
    assertNotNull(p.entregado);
    assertEquals("Entregado", pedidos.findById(p.id).orElseThrow().estado);
  }

  @Test void restringeRolesYExigeCsrf() throws Exception {
    pedido();
    mvc.perform(get("/api/cocina")).andExpect(status().isUnauthorized());
    for (String rol : List.of("CLIENTE", "CAJA", "DELIVERY"))
      mvc.perform(get("/api/cocina").with(identidad(rol))).andExpect(status().isForbidden());
    mvc.perform(get("/api/cocina").with(identidad("COCINA")))
        .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value("COCINA-TEST"));
    mvc.perform(post("/api/cocina/pedidos/COCINA-TEST/estado").with(identidad("COCINA"))
        .contentType("application/json").content("{\"esperado\":\"Recibido\",\"estado\":\"Listo\"}"))
        .andExpect(status().isForbidden());
  }

  @Test void cocinaCompartePedidosConCaja() throws Exception {
    Turno turno = new Turno(); turno.cajero = "Cajero"; turno.apertura = java.time.Instant.now();
    turno.inicial = BigDecimal.ZERO; turnos.saveAndFlush(turno);
    var producto = productos.findByActivoTrue().get(0); producto.setStock(99); productos.saveAndFlush(producto);
    var result = mvc.perform(post("/api/caja/pedidos").with(identidad("CAJA")).with(csrf())
        .contentType("application/json").content(json.writeValueAsString(Map.of("cliente", "Mesa 3",
            "canal", "Salón", "mesa", "3", "items", List.of(Map.of("productoId", producto.getId(), "cantidad", 1))))))
        .andExpect(status().isOk()).andReturn();
    String id = json.readTree(result.getResponse().getContentAsString()).path("id").asText();
    mvc.perform(get("/api/cocina").with(identidad("COCINA")))
        .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
    mvc.perform(post("/api/cocina/pedidos/" + id + "/estado").with(identidad("COCINA")).with(csrf())
        .contentType("application/json").content("{\"esperado\":\"Recibido\",\"estado\":\"En preparación\"}"))
        .andExpect(status().isOk());
    mvc.perform(get("/api/caja").with(identidad("CAJA")))
        .andExpect(status().isOk()).andExpect(jsonPath("$.pedidos[0].estado").value("En preparación"));
  }

  @Test void checkoutUsaPreciosRealesYReintentosNoDuplican() throws Exception {
    Usuario u = new Usuario(); u.setNombre("Cliente"); u.setEmail("cocina@test.com");
    u.setRolAsignado(roles.findByNombre("CLIENTE").orElseThrow()); usuarios.saveAndFlush(u);
    var producto = productos.findByActivoTrue().get(0);
    producto.setStock(99); producto.setPrecio(new BigDecimal("19.90")); productos.saveAndFlush(producto);
    String body = json.writeValueAsString(Map.of("solicitud", "intento-1", "cliente", "Cliente",
        "canal", "Delivery", "direccion", "Av. Lima 123", "telefono", "999999999", "notas", "Sin ají",
        "items", List.of(Map.of("productoId", producto.getId(), "cantidad", 2, "precio", 0))));
    String id = null;
    long antes = pedidos.count();
    for (int i = 0; i < 2; i++) {
      var result = mvc.perform(post("/api/pedidos").with(identidad(u))
          .with(csrf()).contentType("application/json").content(body))
          .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(44.8))
          .andExpect(jsonPath("$.pagado").value(false)).andReturn();
      String actual = json.readTree(result.getResponse().getContentAsString()).path("id").asText();
      if (id != null) assertEquals(id, actual);
      id = actual;
    }
    assertEquals(antes + 1, pedidos.count());
    mvc.perform(get("/api/cocina").with(identidad("COCINA")))
        .andExpect(status().isOk()).andExpect(jsonPath("$[0].notas").value("Sin ají"));
  }

  @Test void flujoClienteCocinaCajaYSeguimientoPrivado() throws Exception {
    Usuario cliente = new Usuario(); cliente.setNombre("Cliente Carta"); cliente.setEmail("flujo@test.com");
    cliente.setRolAsignado(roles.findByNombre("CLIENTE").orElseThrow()); usuarios.saveAndFlush(cliente);
    var producto = productos.findByActivoTrue().get(0);
    producto.setStock(10); producto.setPrecio(new BigDecimal("20.00")); productos.saveAndFlush(producto);
    var result = mvc.perform(post("/api/pedidos").with(identidad(cliente)).with(csrf())
        .contentType("application/json").content(json.writeValueAsString(Map.of(
            "solicitud", "flujo-completo", "cliente", "Cliente Carta", "canal", "Recojo",
            "notas", "Sin ají", "items", List.of(Map.of("productoId", producto.getId(), "cantidad", 2))))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("Recibido")).andReturn();
    String id = json.readTree(result.getResponse().getContentAsString()).path("id").asText();
    Turno turno = new Turno(); turno.cajero = "Caja"; turno.apertura = java.time.Instant.now();
    turno.inicial = BigDecimal.ZERO; turnos.saveAndFlush(turno);
    String cobro = json.writeValueAsString(Map.of("pedidoId", id, "metodo", "Efectivo", "recibido", 50));
    mvc.perform(post("/api/caja/cobros").with(identidad("CAJA")).with(csrf()).contentType("application/json").content(cobro))
        .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("El pedido todavía está en Cocina. Debe estar listo antes de cobrar."));
    cocina.cambiar(id, "Recibido", "En preparación", false);
    mvc.perform(post("/api/caja/cobros").with(identidad("CAJA")).with(csrf()).contentType("application/json").content(cobro))
        .andExpect(status().isConflict());
    cocina.cambiar(id, "En preparación", "Listo", false);
    mvc.perform(post("/api/caja/cobros").with(identidad("CAJA")).with(csrf()).contentType("application/json").content(cobro))
        .andExpect(status().isNoContent());
    assertEquals(8, productos.findById(producto.getId()).orElseThrow().getStock());
    mvc.perform(get("/api/pedidos/" + id).with(identidad(cliente)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.pagado").value(true)).andExpect(jsonPath("$.estado").value("Listo"));
    mvc.perform(get("/api/pedidos/" + id).with(identidad("CLIENTE"))).andExpect(status().isNotFound());
    mvc.perform(get("/api/pedidos/" + id)).andExpect(status().isUnauthorized());
  }
}
