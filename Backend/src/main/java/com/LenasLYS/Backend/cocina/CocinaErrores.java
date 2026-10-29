package com.LenasLYS.Backend.cocina;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice(assignableTypes = {CocinaControlador.class, PedidoWebControlador.class})
public class CocinaErrores {
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> error(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "Operación inválida." : e.getReason()));
  }
}
