package com.LenasLYS.Backend.caja;

import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/caja")
public class CajaControlador {
  private final CajaServicio servicio;
  private final com.LenasLYS.Backend.repositorio.UsuarioRepositorio usuarios;

  public CajaControlador(CajaServicio s, com.LenasLYS.Backend.repositorio.UsuarioRepositorio u) {
    servicio = s;
    usuarios = u;
  }

  @GetMapping
  public CajaServicio.Estado estado() {
    return servicio.estado();
  }

  @PostMapping("/pedidos")
  public PedidoCaja crear(@RequestBody CajaServicio.NuevaVenta r) {
    return servicio.crearPedido(r);
  }

  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  @PostMapping("/apertura")
  public void abrir(@RequestBody CajaServicio.Apertura r, Principal p) {
    servicio.abrir(
        r, usuarios.findById(java.util.UUID.fromString(p.getName())).orElseThrow().getNombre());
  }

  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  @PostMapping("/cierre")
  public void cerrar(@RequestBody CajaServicio.Apertura r) {
    servicio.cerrar(r);
  }

  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  @PostMapping("/cobros")
  public void cobrar(@RequestBody CajaServicio.Cobro r) {
    servicio.cobrar(r);
  }

  public record Reembolso(String motivo) {}

  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  @PostMapping("/pagos/{id}/reembolso")
  public void reembolsar(@PathVariable Long id, @RequestBody Reembolso r) {
    servicio.reembolsar(id, r.motivo());
  }

  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  @PostMapping("/comprobantes")
  public void emitir(@RequestBody CajaServicio.Emision r) {
    servicio.emitir(r);
  }
}
