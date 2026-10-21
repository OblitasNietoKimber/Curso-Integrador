package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.dto.AutenticacionDTO.*;
import com.LenasLYS.Backend.servicio.RecuperacionServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class RecuperacionControlador {
 private final RecuperacionServicio servicio;
 @PostMapping("/forgot-password") public Map<String,String> solicitar(@Valid @RequestBody Correo dto){servicio.solicitar(dto.email());return Map.of("message","Si existe una cuenta activa con ese correo, recibirás un enlace para recuperar tu contraseña.");}
 @PostMapping("/reset-password") @ResponseStatus(HttpStatus.NO_CONTENT) public void restablecer(@Valid @RequestBody Restablecer dto){servicio.restablecer(dto.token(),dto.password());}
}
