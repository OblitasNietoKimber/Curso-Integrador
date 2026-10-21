package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.CuentaDTO;
import com.LenasLYS.Backend.dto.CuentaDTO.*;
import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.UsuarioRepositorio;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CuentaServicio {
  private final UsuarioServicio usuarios;
  private final UsuarioRepositorio repo;
  private final ObjectMapper json;

  private Perfil perfil(Usuario u, Perfil p) {
    return new Perfil(
        p == null ? null : p.photo(),
        u.getNombre(),
        u.getEmail(),
        u.getTelefono().replaceFirst("^\\+51(?=9[0-9]{8}$)", ""),
        p == null ? "DNI" : p.documentType(),
        p == null ? "" : p.document(),
        p == null ? "" : p.birthday(),
        p == null ? "" : p.gender(),
        p == null ? "" : p.notes());
  }

  private CuentaDTO leer(Usuario u) {
    try {
      if (!u.getCuenta().equals("{}")) {
        var c = json.readValue(u.getCuenta(), CuentaDTO.class);
        return new CuentaDTO(
            perfil(u, c.profile()),
            c.addresses(),
            c.cards(),
            c.preferredPayment(),
            c.preferences(),
            c.readNotifications());
      }
    } catch (Exception e) {
      throw new IllegalStateException("No se pudo leer la cuenta.", e);
    }
    return new CuentaDTO(
        perfil(u, null),
        List.of(),
        List.of(),
        "",
        Map.of(
            "email",
            true,
            "orders",
            true,
            "promotions",
            false,
            "favorites",
            false,
            "account",
            true),
        List.of());
  }

  public CuentaDTO obtener(Authentication auth) {
    return leer(usuarios.actual(auth));
  }

  @Transactional
  public CuentaDTO guardar(Authentication auth, CuentaDTO c) {
    Usuario u = usuarios.actual(auth);
    if (!UsuarioServicio.normalizar(c.profile().email()).equals(u.getEmail()))
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "El cambio de correo requiere verificación y aún no está disponible.");
    if (c.addresses().stream().map(Direccion::id).distinct().count() != c.addresses().size()
        || c.cards().stream().map(Tarjeta::id).distinct().count() != c.cards().size())
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hay referencias duplicadas.");
    if (c.addresses().stream().filter(Direccion::primary).count() > 1
        || c.cards().stream().filter(Tarjeta::primary).count() > 1)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Selecciona solo una referencia predeterminada.");
    u.setNombre(c.profile().name().trim());
    u.setTelefono(
        c.profile().phone().startsWith("+") ? c.profile().phone() : "+51" + c.profile().phone());
    try {
      u.setCuenta(json.writeValueAsString(c));
    } catch (Exception e) {
      throw new IllegalStateException("No se pudo guardar la cuenta.", e);
    }
    repo.save(u);
    return leer(u);
  }
}
