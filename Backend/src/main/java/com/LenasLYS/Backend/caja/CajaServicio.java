package com.LenasLYS.Backend.caja;

import java.math.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CajaServicio {
  private final com.LenasLYS.Backend.repositorio.ProductoRepositorio productos;
  private final jakarta.persistence.EntityManager em;
  private final TurnoRepositorio turnos;
  private final PedidoCajaRepositorio pedidos;
  private final PagoRepositorio pagos;
  private final ComprobanteRepositorio comprobantes;
  private final ControlCajaRepositorio control;
  private final CajaAjustes ajustes;

  public CajaServicio(
      TurnoRepositorio t,
      PedidoCajaRepositorio p,
      PagoRepositorio g,
      ComprobanteRepositorio c,
      ControlCajaRepositorio l,
      com.LenasLYS.Backend.repositorio.ProductoRepositorio productos,
      jakarta.persistence.EntityManager em,
      CajaAjustes ajustes) {
    this.ajustes = ajustes;
    this.productos = productos;
    this.em = em;
    turnos = t;
    pedidos = p;
    pagos = g;
    comprobantes = c;
    control = l;
  }

  public record Estado(
      List<Turno> turnos,
      List<PedidoCaja> pedidos,
      List<Pago> pagos,
      List<Comprobante> comprobantes,
      Map<String, Object> configuracion) {}

  public record ItemVenta(String productoId, int cantidad) {}

  public record NuevaVenta(String cliente, String canal, String mesa, List<ItemVenta> items) {}

  public PedidoCaja crearPedido(NuevaVenta r) {
    lock();
    abierto();
    check(
        r.items() != null && !r.items().isEmpty() && r.items().size() <= 100,
        "Agrega entre 1 y 100 productos.");
    check(
        List.of("Salón", "Recojo", "Delivery").contains(r.canal() == null ? "" : r.canal()),
        "Selecciona el canal de atención.");
    PedidoCaja p = new PedidoCaja();
    p.id = "C-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    p.cliente = texto(r.cliente(), 150);
    if (p.cliente.isBlank()) p.cliente = "Público general";
    p.canal = r.canal();
    p.mesa = texto(r.mesa(), 20);
    check(!p.canal.equals("Salón") || !p.mesa.isBlank(), "Indica la mesa.");
    Set<String> ids = new HashSet<>();
    for (ItemVenta i : r.items()) {
      check(
          i != null
              && i.productoId() != null
              && ids.add(i.productoId())
              && i.cantidad() > 0
              && i.cantidad() <= 99,
          "Revisa los productos y cantidades.");
      var producto =
          productos
              .findById(i.productoId())
              .orElseThrow(
                  () ->
                      new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado."));
      check(
          Boolean.TRUE.equals(producto.getActivo())
              && producto.getStock() != null
              && producto.getStock() >= i.cantidad(),
          "Producto inactivo o sin stock: " + producto.getNombre());
      PedidoCaja.Linea linea =
          new PedidoCaja.Linea(producto.getNombre(), i.cantidad(), dinero(producto.getPrecio()));
      linea.productoId = producto.getId();
      p.items.add(linea);
    }
    return pedidos.saveAndFlush(p);
  }

  public record Apertura(BigDecimal monto, String notas) {}

  public record Cobro(String pedidoId, String metodo, BigDecimal recibido, String referencia) {}

  public record Emision(Long pagoId, String tipo, String cliente, String documento) {}

  private void lock() {
    if (control.bloquear() == null)
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Caja no inicializada.");
  }

  private void check(boolean ok, String mensaje) {
    if (!ok) throw new ResponseStatusException(HttpStatus.CONFLICT, mensaje);
  }

  private BigDecimal dinero(BigDecimal n) {
    check(
        n != null
            && n.signum() >= 0
            && n.scale() <= 2
            && n.compareTo(new BigDecimal("99999999.99")) <= 0,
        "Monto inválido: usa hasta dos decimales.");
    return n.setScale(2);
  }

  private String texto(String s, int max) {
    String v = s == null ? "" : s.trim();
    check(v.length() <= max, "Texto demasiado largo.");
    return v;
  }

  private Turno abierto() {
    return turnos.findAll().stream()
        .filter(t -> t.cierre == null)
        .findFirst()
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.CONFLICT, "Abre la caja antes de continuar."));
  }

  private BigDecimal esperado(Turno t) {
    return pagos.findAll().stream()
        .filter(p -> p.turnoId.equals(t.id) && !p.reembolsado && p.metodo.equals("Efectivo"))
        .map(p -> p.monto)
        .reduce(t.inicial, BigDecimal::add);
  }

  public Estado estado() {
    lock();
    return new Estado(
        turnos.findAll(),
        pedidos.findAll(),
        pagos.findAll(),
        comprobantes.findAll(),
        ajustes.datos());
  }

  public void abrir(Apertura r, String cajero) {
    lock();
    check(turnos.findAll().stream().noneMatch(t -> t.cierre == null), "Ya hay una caja abierta.");
    Turno t = new Turno();
    t.cajero = cajero;
    t.inicial = dinero(r.monto());
    t.notas = texto(r.notas(), 1000);
    t.apertura = Instant.now();
    turnos.save(t);
  }

  public void cerrar(Apertura r) {
    lock();
    Turno t = abierto();
    t.contado = dinero(r.monto());
    t.esperado = esperado(t);
    t.diferencia = t.contado.subtract(t.esperado);
    t.notas = texto(r.notas(), 1000);
    t.cierre = Instant.now();
  }

  public void cobrar(Cobro r) {
    lock();
    Turno t = abierto();
    PedidoCaja o =
        pedidos
            .findById(r.pedidoId() == null ? "" : r.pedidoId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido inexistente."));
    check(!o.pagado, "Este pedido ya fue cobrado.");
    check(
        List.of("Efectivo", "Tarjeta", "Yape", "Plin", "Transferencia")
            .contains(r.metodo() == null ? "" : r.metodo()),
        "Método de pago inválido.");
    BigDecimal total = dinero(o.getTotal());
    check(total.signum() > 0, "El pedido debe tener un total positivo.");
    Pago p = new Pago();
    p.pedidoId = o.id;
    p.turnoId = t.id;
    p.metodo = r.metodo();
    p.monto = total;
    p.recibido = r.metodo().equals("Efectivo") ? dinero(r.recibido()) : total;
    check(p.recibido.compareTo(total) >= 0, "El efectivo recibido es insuficiente.");

    p.referencia = texto(r.referencia(), 100);
    if (pagos.findAll().stream().noneMatch(anterior -> anterior.pedidoId.equals(o.id))) {
      for (PedidoCaja.Linea linea : o.items) {
        var producto =
            em.find(
                com.LenasLYS.Backend.modelo.Producto.class,
                linea.productoId,
                jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        check(
            producto != null
                && Boolean.TRUE.equals(producto.getActivo())
                && producto.getStock() != null
                && producto.getStock() >= linea.cantidad,
            "Stock insuficiente o producto no disponible: " + linea.producto);
        producto.setStock(producto.getStock() - linea.cantidad);
      }
    }
    p.vuelto = p.recibido.subtract(total);
    p.fecha = Instant.now();
    pagos.save(p);
    o.pagado = true;
  }

  public void reembolsar(Long id, String motivo) {
    lock();
    Turno t = abierto();
    Pago p =
        pagos
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago inexistente."));
    check(
        !p.reembolsado && p.turnoId.equals(t.id),
        "Solo puedes reembolsar pagos del turno abierto.");
    String m = texto(motivo, 500);
    check(!m.isBlank(), "Indica el motivo del reembolso.");
    p.reembolsado = true;
    p.fechaReembolso = Instant.now();
    p.motivoReembolso = m;
    pedidos.findById(p.pedidoId).orElseThrow().pagado = false;
    comprobantes.findAll().stream().filter(c -> c.pagoId.equals(id)).forEach(c -> c.anulado = true);
  }

  public void emitir(Emision r) {
    lock();
    Pago p =
        pagos
            .findById(r.pagoId() == null ? -1 : r.pagoId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago inexistente."));
    check(!p.reembolsado, "El pago fue reembolsado.");
    check(
        comprobantes.findAll().stream().noneMatch(c -> c.pagoId.equals(p.id)),
        "El pago ya tiene un comprobante.");
    check(
        List.of("Boleta", "Factura", "Nota de venta").contains(r.tipo() == null ? "" : r.tipo()),
        "Tipo inválido.");
    String doc = texto(r.documento(), 11), cliente = texto(r.cliente(), 200);
    check(!cliente.isBlank(), "Ingresa el nombre o razón social.");
    check(
        !r.tipo().equals("Factura") || doc.matches("[0-9]{11}"),
        "La factura requiere RUC de 11 dígitos.");
    check(
        r.tipo().equals("Factura") || doc.isBlank() || doc.matches("[0-9]{8}"),
        "El DNI debe tener 8 dígitos.");
    Comprobante c = new Comprobante();
    c.pagoId = p.id;
    c.pedidoId = p.pedidoId;
    c.tipo = r.tipo();
    c.cliente = cliente;
    c.documento = doc;
    c.total = p.monto;
    c.fecha = Instant.now();
    comprobantes.saveAndFlush(c);
    c.numero =
        (r.tipo().equals("Factura") ? "F001" : r.tipo().equals("Boleta") ? "B001" : "NV01")
            + "-"
            + String.format("%06d", c.id);
  }
}
