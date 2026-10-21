package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.UsuarioRepositorio;
import java.security.*;
import java.time.Instant;
import java.util.*;
import javax.crypto.Cipher;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SegundoFactorServicio {
  private final UsuarioRepositorio usuarios;
  private final String key;

  public SegundoFactorServicio(
      UsuarioRepositorio usuarios, @Value("${app.auth.totp-key:}") String key) {
    this.usuarios = usuarios;
    this.key = key;
  }

  public boolean disponible() {
    try {
      return Base64.getDecoder().decode(key).length == 32;
    } catch (IllegalArgumentException e) {
      return false;
    }
  }

  private byte[] clave() {
    if (!disponible())
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "Configura TOTP_ENCRYPTION_KEY en el backend para habilitar la verificación en dos"
              + " pasos.");
    return Base64.getDecoder().decode(key);
  }

  public String cifrar(String secret) {
    try {
      byte[] iv = new byte[12];
      new SecureRandom().nextBytes(iv);
      Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
      c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(clave(), "AES"), new GCMParameterSpec(128, iv));
      return Base64.getEncoder().encodeToString(iv)
          + "."
          + Base64.getEncoder()
              .encodeToString(
                  c.doFinal(secret.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  private String descifrar(String value) {
    try {
      String[] parts = value.split("\\.");
      Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
      c.init(
          Cipher.DECRYPT_MODE,
          new SecretKeySpec(clave(), "AES"),
          new GCMParameterSpec(128, Base64.getDecoder().decode(parts[0])));
      return new String(
          c.doFinal(Base64.getDecoder().decode(parts[1])),
          java.nio.charset.StandardCharsets.US_ASCII);
    } catch (GeneralSecurityException | IllegalArgumentException e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "No se pudo leer la configuración de seguridad. Revisa la clave de cifrado del"
              + " servidor.");
    }
  }

  static ResponseStatusException invalido() {
    return new ResponseStatusException(
        HttpStatus.BAD_REQUEST, "Código incorrecto, vencido o ya utilizado. Usa un código nuevo.");
  }

  private Usuario bloquear(UUID id, long version) {
    Usuario u =
        usuarios
            .bloquearPorId(id)
            .filter(Usuario::isActivo)
            .orElseThrow(SegundoFactorServicio::invalido);
    if (u.getVersionSesion() != version) throw invalido();
    return u;
  }

  @Transactional
  public List<String> activar(UUID id, long version, String encrypted, String code) {
    Usuario u = bloquear(id, version);
    if (u.getTotpSecret() != null)
      throw new ResponseStatusException(HttpStatus.CONFLICT, "La verificación ya está activada.");
    long counter = Totp.verificar(descifrar(encrypted), code, -1, Instant.now().getEpochSecond());
    if (counter < 0) throw invalido();
    List<String> recovery = new ArrayList<>();
    for (int i = 0; i < 8; i++)
      recovery.add(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
    u.setTotpSecret(encrypted);
    u.setTotpCounter(counter);
    u.setTotpRecovery(String.join(",", recovery.stream().map(this::hash).toList()));
    u.setVersionSesion(version + 1);
    return recovery;
  }

  private String hash(String code) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256")
                  .digest(code.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  @Transactional
  public Usuario verificar(UUID id, long version, String code) {
    Usuario u = bloquear(id, version);
    if (u.getTotpSecret() == null) throw invalido();
    long counter =
        Totp.verificar(
            descifrar(u.getTotpSecret()),
            code,
            u.getTotpCounter() == null ? -1 : u.getTotpCounter(),
            Instant.now().getEpochSecond());
    if (counter >= 0) {
      u.setTotpCounter(counter);
      return u;
    }
    List<String> recovery =
        new ArrayList<>(
            Arrays.asList(Optional.ofNullable(u.getTotpRecovery()).orElse("").split(",")));
    if (code != null && code.matches("[0-9a-f]{16}") && recovery.remove(hash(code))) {
      u.setTotpRecovery(String.join(",", recovery));
      return u;
    }
    throw invalido();
  }

  @Transactional
  public long desactivar(UUID id, long version, String code) {
    Usuario u = verificar(id, version, code);
    u.setTotpSecret(null);
    u.setTotpCounter(null);
    u.setTotpRecovery(null);
    u.setVersionSesion(version + 1);
    return u.getVersionSesion();
  }
}
