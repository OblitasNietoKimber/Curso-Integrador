package com.LenasLYS.Backend.cocina;

import com.LenasLYS.Backend.caja.PedidoCaja;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cocina")
public class CocinaControlador {
  private final CocinaServicio servicio;
  public CocinaControlador(CocinaServicio servicio) { this.servicio = servicio; }
  @GetMapping
  public List<PedidoCaja> pedidos() { return servicio.pedidos(); }
  public record Cambio(String esperado, String estado) {}
  @PostMapping("/pedidos/{id}/estado")
  public PedidoCaja cambiar(@PathVariable String id, @RequestBody Cambio cambio, Authentication auth) {
    boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));
    return servicio.cambiar(id, cambio.esperado(), cambio.estado(), admin);
  }
}
