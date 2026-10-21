package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.AutenticacionDTO.Codigo;
import com.LenasLYS.Backend.servicio.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/account/security")
@RequiredArgsConstructor
public class SeguridadControlador {
  private final UsuarioServicio usuarios;
  private final SegundoFactorServicio factores;

  record Alta(String cifrado, long version, Instant vence) implements java.io.Serializable {}

  @GetMapping
  public Map<String, Boolean> estado(Authentication auth, HttpServletResponse res) {
    res.setHeader("Cache-Control", "no-store");
    var u = usuarios.actual(auth);
    return Map.of(
        "enabled",
        u.getTotpSecret() != null,
        "available",
        factores.disponible(),
        "hasPassword",
        u.getPasswordHash() != null);
  }

  @PostMapping("/setup")
  public Map<String, String> preparar(
      Authentication auth, HttpServletRequest req, HttpServletResponse res) {
    res.setHeader("Cache-Control", "no-store");
    var u = usuarios.actual(auth);
    if (u.getTotpSecret() != null)
      throw new ResponseStatusException(HttpStatus.CONFLICT, "La verificación ya está activada.");
    if (!(req.getSession().getAttribute("primaryAt") instanceof Instant at)
        || at.isBefore(Instant.now().minusSeconds(300)))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Por seguridad, vuelve a iniciar sesión antes de activar la verificación en dos pasos.");
    String secret = Totp.nuevaClave();
    String cifrado = factores.cifrar(secret);
    req.getSession()
        .setAttribute(
            "altaTotp", new Alta(cifrado, u.getVersionSesion(), Instant.now().plusSeconds(600)));
    String label =
        URLEncoder.encode("Leñas y Sabores:" + u.getEmail(), StandardCharsets.UTF_8)
            .replace("+", "%20");
    return Map.of(
        "secret",
        secret,
        "uri",
        "otpauth://totp/"
            + label
            + "?secret="
            + secret
            + "&issuer=Le%C3%B1as%20y%20Sabores&algorithm=SHA1&digits=6&period=30");
  }

  @PostMapping("/enable")
  public Map<String, List<String>> activar(
      Authentication auth,
      @Valid @RequestBody Codigo dto,
      HttpServletRequest req,
      HttpServletResponse res) {
    res.setHeader("Cache-Control", "no-store");
    var u = usuarios.actual(auth);
    var session = req.getSession();
    if (!(session.getAttribute("altaTotp") instanceof Alta a)
        || !a.vence().isAfter(Instant.now())
        || a.version() != u.getVersionSesion())
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "La configuración venció. Inicia la activación nuevamente.");
    var recovery = factores.activar(u.getId(), a.version(), a.cifrado(), dto.code());
    session.removeAttribute("altaTotp");
    session.setAttribute("authVersion", a.version() + 1);
    return Map.of("recoveryCodes", recovery);
  }

  @PostMapping("/disable")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void desactivar(
      Authentication auth, @Valid @RequestBody Codigo dto, HttpServletRequest req) {
    var u = usuarios.actual(auth);
    long version = factores.desactivar(u.getId(), u.getVersionSesion(), dto.code());
    req.getSession().setAttribute("authVersion", version);
  }
}
