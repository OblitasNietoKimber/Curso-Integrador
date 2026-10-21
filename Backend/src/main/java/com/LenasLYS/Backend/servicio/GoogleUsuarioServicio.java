package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoogleUsuarioServicio {
  private final UsuarioRepositorio usuarios;

  @Transactional
  public Usuario obtenerOCrear(OidcUser identidad, java.util.UUID vincular, Long version) {
    // Spring ya ha validado firma, emisor, destinatario, nonce y vigencia del ID token.
    String sub = identidad.getSubject();
    String email = identidad.getEmail();
    if (sub == null
        || sub.isBlank()
        || sub.length() > 255
        || !Boolean.TRUE.equals(identidad.getEmailVerified())
        || email == null
        || email.isBlank()
        || email.length() > 254) throw error("identity_invalid");
    var existente = usuarios.findByGoogleSub(sub);
    if (existente.isPresent()) {
      if (vincular != null && !vincular.equals(existente.get().getId()))
        throw error("identity_mismatch");
      if (!existente.get().isActivo()) throw error("account_disabled");
      return existente.get();
    }
    email = UsuarioServicio.normalizar(email);
    // Vincular cuentas requiere autenticar primero al propietario de la cuenta local.
    if (vincular != null) {
      var local = usuarios.findById(vincular).orElseThrow(() -> error("identity_invalid"));
      if (!local.isActivo() || !java.util.Objects.equals(version, local.getVersionSesion()))
        throw error("identity_invalid");
      if (!local.getEmail().equals(email)) throw error("identity_mismatch");
      local.setGoogleSub(sub);
      return usuarios.saveAndFlush(local);
    }
    if (usuarios.existsByEmail(email)) throw error("account_exists");
    Usuario u = new Usuario();
    u.setGoogleSub(sub);
    u.setEmail(email);
    String nombre = identidad.getFullName();
    u.setNombre(
        nombre == null || nombre.isBlank()
            ? "Cliente"
            : nombre.substring(0, Math.min(120, nombre.length())));
    u.setTelefono("");
    u.setPasswordHash(null);
    u.setRol(Usuario.Rol.CLIENTE);
    return usuarios.saveAndFlush(u);
  }

  public static OAuth2AuthenticationException error(String code) {
    return new OAuth2AuthenticationException(
        new OAuth2Error(code), "No se pudo completar el acceso con Google.");
  }
}
