package com.LenasLYS.Backend.cocina;

import com.LenasLYS.Backend.caja.PedidoCaja;
import com.LenasLYS.Backend.modelo.*;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoWebControlador {
  private final EntityManager em;
  public PedidoWebControlador(EntityManager em) { this.em = em; }
  @GetMapping("/{id}")
  @Transactional(readOnly = true)
  public PedidoCaja consultar(@PathVariable String id, Authentication auth) {
    PedidoCaja pedido = em.find(PedidoCaja.class, id);
    if (pedido == null || pedido.solicitud == null || !pedido.solicitud.startsWith(auth.getName() + ":"))
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido inexistente.");
    return pedido;
  }
  public record Item(@NotBlank String productoId, @Min(1) @Max(99) int cantidad) {}
  public record Nuevo(@NotBlank @Size(max=36) String solicitud,
      @NotBlank @Size(max=150) String cliente, @NotBlank String canal,
      @Size(max=500) String direccion, @Size(max=50) String telefono,
      @Size(max=1000) String notas, @NotEmpty @Size(max=100) List<@NotNull @Valid Item> items) {}

  @PostMapping
  @Transactional
  public PedidoCaja crear(@Valid @RequestBody Nuevo r, Authentication auth) {
    // Serializa los reintentos de una misma cuenta y conserva el código del pedido.
    em.find(Usuario.class, UUID.fromString(auth.getName()), LockModeType.PESSIMISTIC_WRITE);
    String clave = auth.getName() + ":" + r.solicitud();
    var anteriores = em.createQuery("select p from PedidoCaja p where p.solicitud = :clave", PedidoCaja.class)
        .setParameter("clave", clave).getResultList();
    if (!anteriores.isEmpty()) return anteriores.get(0);
    if (!List.of("Delivery", "Recojo").contains(r.canal())) fallo("Canal inválido.");
    if (r.canal().equals("Delivery") && (r.direccion() == null || r.direccion().isBlank())) fallo("Indica la dirección.");
    PedidoCaja p = new PedidoCaja();
    p.id = "W-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    p.solicitud = clave;
    p.cliente = r.cliente().trim(); p.canal = r.canal(); p.mesa = "";
    p.direccion = r.direccion(); p.telefono = r.telefono(); p.notas = r.notas();
    p.envio = r.canal().equals("Delivery") ? new BigDecimal("5.00") : BigDecimal.ZERO;
    Set<String> ids = new HashSet<>();
    for (Item i : r.items()) {
      if (!ids.add(i.productoId())) fallo("Producto repetido.");
      Producto producto = em.find(Producto.class, i.productoId());
      PedidoCaja.Linea linea;
      if (producto != null) {
        if (!Boolean.TRUE.equals(producto.getActivo()) || producto.getStock() == null || producto.getStock() < i.cantidad()) fallo("Producto sin disponibilidad: " + producto.getNombre());
        linea = new PedidoCaja.Linea(producto.getNombre(), i.cantidad(), producto.getPrecio());
        linea.imagen = producto.getImagen();
      } else {
        Promocion promo = em.find(Promocion.class, i.productoId());
        if (promo == null || !Boolean.TRUE.equals(promo.getActiva())) {
          fallo("Producto o promoción no disponible.");
          return null;
        }
        linea = new PedidoCaja.Linea(promo.getNombre(), i.cantidad(), promo.getPrecio());
        linea.imagen = promo.getImagen();
      }
      linea.productoId = i.productoId(); p.items.add(linea);
    }
    em.persist(p); em.flush(); return p;
  }
  private void fallo(String mensaje) { throw new ResponseStatusException(HttpStatus.CONFLICT, mensaje); }
}
