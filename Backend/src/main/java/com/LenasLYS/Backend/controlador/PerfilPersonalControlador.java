package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.CuentaDTO.Perfil;
import com.LenasLYS.Backend.servicio.PerfilPersonalServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account/personal")
@RequiredArgsConstructor
public class PerfilPersonalControlador {
  private final PerfilPersonalServicio perfiles;

  @GetMapping
  public Perfil obtener(Authentication auth) {
    return perfiles.obtener(auth);
  }

  @PutMapping
  public Perfil guardar(Authentication auth, @Valid @RequestBody Perfil perfil) {
    return perfiles.guardar(auth, perfil);
  }
}
