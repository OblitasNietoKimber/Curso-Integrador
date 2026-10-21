package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.CuentaDTO;
import com.LenasLYS.Backend.servicio.CuentaServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class CuentaControlador {
  private final CuentaServicio cuentas;

  @GetMapping
  public CuentaDTO obtener(Authentication auth) {
    return cuentas.obtener(auth);
  }

  @PutMapping
  public CuentaDTO guardar(Authentication auth, @Valid @RequestBody CuentaDTO dto) {
    return cuentas.guardar(auth, dto);
  }
}
