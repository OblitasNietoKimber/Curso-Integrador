package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.CuentaDTO;
import com.LenasLYS.Backend.dto.CuentaDTO.*;
import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.ClienteRepositorio;
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
  private final ClienteRepositorio clientes;
  private final ObjectMapper json;

  /** Los datos propios de una cuenta cliente, sin repetir el perfil ni el correo de acceso. */
  public record PreferenciasCuenta(
      List<Direccion> addresses,
      List<Tarjeta> cards,
      String preferredPayment,
      Map<String, Boolean> preferences,
      List<String> readNotifications) {}

  private Cliente cliente(Usuario u) {
    if (u.getRol() != Usuario.Rol.CLIENTE)
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Este apartado es exclusivo de clientes.");
    return clientes
        .findByUsuarioId(u.getId())
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.CONFLICT, "La cuenta no tiene un perfil de cliente asociado."));
  }

  private Perfil perfil(Usuario u, Cliente c) {
    return new Perfil(
        c.getFoto(),
        c.getNombre(),
        u.getEmail(),
        c.getTelefono().replaceFirst("^\\+51(?=9[0-9]{8}$)", ""),
        c.getTipoDocumento(),
        c.getDocumento(),
        c.getFechaNacimiento(),
        c.getGenero(),
        c.getNotas());
  }

  private CuentaDTO leer(Usuario u, Cliente c) {
    try {
      if (!c.getCuenta().equals("{}")) {
        var datos = json.readValue(c.getCuenta(), PreferenciasCuenta.class);
        return new CuentaDTO(
            perfil(u, c),
            datos.addresses(),
            datos.cards(),
            datos.preferredPayment(),
            datos.preferences(),
            datos.readNotifications());
      }
    } catch (Exception e) {
      throw new IllegalStateException("No se pudo leer la cuenta.", e);
    }
    return new CuentaDTO(
        perfil(u, c),
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

  @Transactional(readOnly = true)
  public CuentaDTO obtener(Authentication auth) {
    Usuario u = usuarios.actual(auth);
    return leer(u, cliente(u));
  }

  @Transactional
  public CuentaDTO guardar(Authentication auth, CuentaDTO cuenta) {
    Usuario u = usuarios.actual(auth);
    Cliente c = cliente(u);
    if (!UsuarioServicio.normalizar(cuenta.profile().email()).equals(u.getEmail()))
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "El cambio de correo requiere verificación y aún no está disponible.");
    if (cuenta.addresses().stream().map(Direccion::id).distinct().count()
            != cuenta.addresses().size()
        || cuenta.cards().stream().map(Tarjeta::id).distinct().count() != cuenta.cards().size())
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hay referencias duplicadas.");
    if (cuenta.addresses().stream().filter(Direccion::primary).count() > 1
        || cuenta.cards().stream().filter(Tarjeta::primary).count() > 1)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Selecciona solo una referencia predeterminada.");
    Perfil p = cuenta.profile();
    c.setNombre(p.name().trim());
    c.setTelefono(
        (p.phone().isEmpty() || p.phone().startsWith("+")) ? p.phone() : "+51" + p.phone());
    c.setFoto(p.photo());
    c.setTipoDocumento(p.documentType());
    c.setDocumento(p.document());
    c.setFechaNacimiento(p.birthday());
    c.setGenero(p.gender());
    c.setNotas(p.notes());
    u.setNombre(c.getNombre());
    try {
      c.setCuenta(
          json.writeValueAsString(
              new PreferenciasCuenta(
                  cuenta.addresses(),
                  cuenta.cards(),
                  cuenta.preferredPayment(),
                  cuenta.preferences(),
                  cuenta.readNotifications())));
    } catch (Exception e) {
      throw new IllegalStateException("No se pudo guardar la cuenta.", e);
    }
    clientes.save(c);
    return leer(u, c);
  }
}
