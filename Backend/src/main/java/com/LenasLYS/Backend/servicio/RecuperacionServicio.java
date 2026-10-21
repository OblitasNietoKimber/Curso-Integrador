package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.modelo.Recuperacion;
import com.LenasLYS.Backend.repositorio.*;
import java.security.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RecuperacionServicio {
  private final UsuarioRepositorio usuarios;
  private final RecuperacionRepositorio tokens;
  private final PasswordEncoder encoder;
  private final UsuarioServicio servicio;
  private final JavaMailSender correo;

  @Value("${app.auth.reset-enabled:false}")
  private boolean habilitado;

  @Value("${app.auth.frontend-url}")
  private String frontend;

  @Value("${app.auth.mail-from}")
  private String remitente;

  public static String hash(String token) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256")
                  .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  @Transactional
  public void solicitar(String email) {
    if (!habilitado)
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "La recuperación por correo todavía no está habilitada.");
    var found = usuarios.findByEmail(UsuarioServicio.normalizar(email)).filter(u -> u.isActivo());
    if (found.isEmpty()) return;
    var u = found.get();
    byte[] bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    tokens.deleteByUsuarioId(u.getId());
    var recuperacion = new Recuperacion();
    recuperacion.setUsuarioId(u.getId());
    recuperacion.setTokenHash(hash(token));
    recuperacion.setVence(Instant.now().plus(Duration.ofMinutes(30)));
    tokens.saveAndFlush(recuperacion);
    var mensaje = new SimpleMailMessage();
    mensaje.setFrom(remitente);
    mensaje.setTo(u.getEmail());
    mensaje.setSubject("Recupera tu contraseña — Leñas y Sabores");
    mensaje.setText(
        "Solicitaste restablecer tu contraseña. Abre este enlace, válido durante 30 minutos y para"
            + " un solo uso:\n"
            + frontend.replaceAll("/$", "")
            + "/restablecer-contrasena?token="
            + token
            + "\nSi no fuiste tú, ignora este mensaje.");
    try {
      correo.send(mensaje);
    } catch (MailException e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "No se pudo enviar el correo. Inténtalo más tarde.");
    }
  }

  @Transactional
  public void restablecer(String token, String password) {
    servicio.validarClave(password);
    var t =
        tokens
            .findByTokenHash(hash(token))
            .filter(v -> v.getVence().isAfter(Instant.now()))
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "El enlace no es válido o ha vencido."));
    var u =
        usuarios
            .findById(t.getUsuarioId())
            .filter(v -> v.isActivo())
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "El enlace no es válido o ha vencido."));
    u.setPasswordHash(encoder.encode(password));
    u.setVersionSesion(u.getVersionSesion() + 1);
    usuarios.save(u);
    tokens.deleteByUsuarioId(u.getId());
  }
}
