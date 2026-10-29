package com.LenasLYS.Backend.caja;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice(assignableTypes = CajaControlador.class)
public class CajaErrores {
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> error(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode())
        .body(Map.of("message", e.getReason() == null ? "Operación inválida." : e.getReason()));
  }
}
