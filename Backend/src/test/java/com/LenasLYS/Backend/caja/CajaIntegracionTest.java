package com.LenasLYS.Backend.caja;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=${CAJA_TEST_URL}",
      "spring.datasource.username=${CAJA_TEST_USER:postgres}",
      "spring.datasource.password=${CAJA_TEST_PASSWORD:}",
      "spring.datasource.driver-class-name=org.postgresql.Driver"
    })
@AutoConfigureMockMvc
@ActiveProfiles("caja-local")
@org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable(
    named = "CAJA_TEST_URL",
    matches = ".+")
@Transactional
class CajaIntegracionTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired ProductoRepositorio productos;
  @Autowired PagoRepositorio pagos;
  @Autowired TurnoRepositorio turnos;
  @Autowired ComprobanteRepositorio comprobantes;
  Producto producto;

  @BeforeEach
  void preparar() {
    producto = productos.findByActivoTrue().get(0);
    producto.setPrecio(new BigDecimal("19.90"));
    producto.setStock(5);
    productos.saveAndFlush(producto);
  }

  MockHttpSession entrar() throws Exception {
    var result =
        mvc.perform(
                post("/api/auth/login")
                    .with(csrf())
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of(
                                "email",
                                "caja.local@lys.test",
                                "password",
                                "CajaLocal2026!",
                                "remember",
                                false))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("caja"))
            .andReturn();
    return (MockHttpSession) result.getRequest().getSession(false);
  }

  String enviar(MockHttpSession s, String ruta, Object body, int esperado) throws Exception {
    return mvc.perform(
            post("/api/caja" + ruta)
                .session(s)
                .with(csrf())
                .contentType("application/json")
                .content(json.writeValueAsString(body)))
        .andExpect(status().is(esperado))
        .andReturn()
        .getResponse()
        .getContentAsString();
  }

  void abrir(MockHttpSession s) throws Exception {
    enviar(s, "/apertura", Map.of("monto", 100, "notas", "Prueba"), 204);
  }

  String venta(MockHttpSession s, int cantidad, int esperado) throws Exception {
    return enviar(
        s,
        "/pedidos",
        Map.of(
            "cliente",
            "Cliente",
            "canal",
            "Salón",
            "mesa",
            "3",
            "items",
            java.util.List.of(Map.of("productoId", producto.getId(), "cantidad", cantidad))),
        esperado);
  }

  @Test
  void requiereSesion() throws Exception {
    mvc.perform(get("/api/caja")).andExpect(status().isUnauthorized());
  }

  @Test
  void credencialesRealesFuncionan() throws Exception {
    var s = entrar();
    mvc.perform(get("/api/caja").session(s))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pedidos").isArray());
  }

  @Test
  void conservaCsrf() throws Exception {
    var s = entrar();
    mvc.perform(
            post("/api/caja/apertura")
                .session(s)
                .contentType("application/json")
                .content("{\"monto\":100}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void exigeAperturaParaCrearCuenta() throws Exception {
    venta(entrar(), 1, 409);
  }

  @Test
  void rechazaStockInsuficiente() throws Exception {
    var s = entrar();
    abrir(s);
    venta(s, 6, 409);
  }

  @Test
  void rechazaProductoInactivo() throws Exception {
    var s = entrar();
    abrir(s);
    producto.setActivo(false);
    productos.saveAndFlush(producto);
    venta(s, 1, 409);
  }

  @Test
  void flujoCatalogoCobroComprobanteYCierre() throws Exception {
    var s = entrar();
    abrir(s);
    String body = venta(s, 2, 200);
    var cuenta = json.readTree(body);
    String id = cuenta.path("id").asText();
    assertEquals(39.80, cuenta.path("total").asDouble(), 0.001);
    enviar(s, "/cobros", Map.of("pedidoId", id, "metodo", "Efectivo", "recibido", 50), 204);
    assertEquals(3, productos.findById(producto.getId()).orElseThrow().getStock());
    Pago pago = pagos.findAll().get(0);
    assertEquals(0, new BigDecimal("10.20").compareTo(pago.vuelto));
    enviar(s, "/cobros", Map.of("pedidoId", id, "metodo", "Efectivo", "recibido", 50), 409);
    enviar(
        s,
        "/comprobantes",
        Map.of("pagoId", pago.id, "tipo", "Boleta", "cliente", "Cliente", "documento", "12345678"),
        204);
    assertEquals(1, comprobantes.count());
    enviar(s, "/cierre", Map.of("monto", 139.80, "notas", "Cuadra"), 204);
    assertEquals(0, BigDecimal.ZERO.compareTo(turnos.findAll().get(0).diferencia));
  }

  @Test
  void reembolsoNoDescuentaStockDosVeces() throws Exception {
    var s = entrar();
    abrir(s);
    String id = json.readTree(venta(s, 2, 200)).path("id").asText();
    enviar(s, "/cobros", Map.of("pedidoId", id, "metodo", "Yape", "referencia", "OP-123"), 204);
    Pago p = pagos.findAll().get(0);
    enviar(
        s,
        "/comprobantes",
        Map.of("pagoId", p.id, "tipo", "Boleta", "cliente", "Cliente", "documento", ""),
        204);
    enviar(s, "/pagos/" + p.id + "/reembolso", Map.of("motivo", "Método incorrecto"), 204);
    assertTrue(comprobantes.findAll().get(0).anulado);
    enviar(s, "/cobros", Map.of("pedidoId", id, "metodo", "Efectivo", "recibido", 40), 204);
    assertEquals(3, productos.findById(producto.getId()).orElseThrow().getStock());
  }

  @Test
  void validaRuc() throws Exception {
    var s = entrar();
    abrir(s);
    String id = json.readTree(venta(s, 1, 200)).path("id").asText();
    enviar(s, "/cobros", Map.of("pedidoId", id, "metodo", "Efectivo", "recibido", 20), 204);
    enviar(
        s,
        "/comprobantes",
        Map.of(
            "pagoId",
            pagos.findAll().get(0).id,
            "tipo",
            "Factura",
            "cliente",
            "Empresa",
            "documento",
            "123"),
        409);
  }
}
