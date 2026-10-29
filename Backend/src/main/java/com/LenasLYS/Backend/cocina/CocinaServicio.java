package com.LenasLYS.Backend.cocina;

import com.LenasLYS.Backend.caja.PedidoCaja;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CocinaServicio {
  private final EntityManager em;
  public CocinaServicio(EntityManager em) { this.em = em; }

  @Transactional(readOnly = true)
  public List<PedidoCaja> pedidos() {
    return em.createQuery("select p from PedidoCaja p order by p.creado", PedidoCaja.class)
        .getResultList();
  }

  public PedidoCaja cambiar(String id, String esperado, String destino, boolean administrador) {
    PedidoCaja p = em.find(PedidoCaja.class, id, LockModeType.PESSIMISTIC_WRITE);
    if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido inexistente.");
    String actual = p.estado == null ? "Recibido" : p.estado;
    if (!actual.equals(esperado))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El pedido cambió. Actualiza Cocina.");
    boolean valido = (actual.equals("Recibido") && "En preparación".equals(destino))
        || (actual.equals("En preparación") && "Listo".equals(destino))
        || (administrador && actual.equals("Listo") && "Entregado".equals(destino));
    if (!valido) throw new ResponseStatusException(HttpStatus.CONFLICT, "Cambio de estado no permitido.");
    p.estado = destino;
    Instant ahora = Instant.now();
    if (destino.equals("En preparación")) p.aceptado = ahora;
    if (destino.equals("Listo")) p.listo = ahora;
    if (destino.equals("Entregado")) p.entregado = ahora;
    em.flush();
    return p;
  }
}
