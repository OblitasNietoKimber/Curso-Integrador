package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.AutenticacionDTO.*;
import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.UsuarioRepositorio;
import java.nio.charset.StandardCharsets;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UsuarioServicio {
  private final UsuarioRepositorio usuarios;
  private final PasswordEncoder encoder;

  public static String normalizar(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  public void validarClave(String clave) {
    if (clave.getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "La contraseña debe ocupar como máximo 72 bytes.");
  }

  @Transactional
  public Usuario registrar(Registro dto) {
    validarClave(dto.password());
    String email = normalizar(dto.email());
    if (usuarios.existsByEmail(email))
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
    Usuario u = new Usuario();
    u.setNombre(dto.name().trim());
    u.setEmail(email);
    u.setTelefono(dto.phone());
    u.setPasswordHash(encoder.encode(dto.password()));
    return usuarios.saveAndFlush(u);
  }

  public Usuario actual(Authentication auth) {
    if (auth == null || !auth.isAuthenticated())
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
    try {
      return usuarios
          .findById(UUID.fromString(auth.getName()))
          .filter(Usuario::isActivo)
          .orElseThrow(
              () ->
                  new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión no es válida."));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión no es válida.");
    }
  }

  public Sesion sesion(Usuario u) {
    return new Sesion(
        u.getId().toString(),
        u.getNombre(),
        u.getEmail(),
        u.getTelefono(),
        u.getRol().name().toLowerCase(Locale.ROOT));
  }

  @Transactional
  public void cambiarClave(Authentication auth, CambiarClave dto) {
    Usuario u = actual(auth);
    validarClave(dto.next());
    if (u.getPasswordHash() == null)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Tu cuenta usa Google. Para crear una contraseña, solicita un enlace de recuperación.");
    if (!encoder.matches(dto.previous(), u.getPasswordHash()))
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta.");
    u.setPasswordHash(encoder.encode(dto.next()));
    u.setVersionSesion(u.getVersionSesion() + 1);
    usuarios.save(u);
  }
}
