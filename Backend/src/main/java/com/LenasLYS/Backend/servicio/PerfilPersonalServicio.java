package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.CuentaDTO.Perfil;
import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.PerfilPersonalRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PerfilPersonalServicio {
  private final UsuarioServicio usuarios;
  private final PerfilPersonalRepositorio perfiles;

  private Usuario personal(Authentication auth) {
    Usuario u = usuarios.actual(auth);
    if (u.getRol() == Usuario.Rol.CLIENTE)
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Este apartado es exclusivo del personal.");
    return u;
  }

  private PerfilPersonal datos(Usuario u) {
    return perfiles
        .findById(u.getId())
        .orElseGet(
            () -> {
              PerfilPersonal p = new PerfilPersonal();
              p.setUsuarioId(u.getId());
              return p;
            });
  }

  private Perfil dto(Usuario u, PerfilPersonal p) {
    return new Perfil(
        p.getFoto(),
        u.getNombre(),
        u.getEmail(),
        p.getTelefono(),
        p.getTipoDocumento(),
        p.getDocumento(),
        p.getFechaNacimiento(),
        p.getGenero(),
        p.getNotas());
  }

  @Transactional(readOnly = true)
  public Perfil obtener(Authentication auth) {
    Usuario u = personal(auth);
    return dto(u, datos(u));
  }

  @Transactional
  public Perfil guardar(Authentication auth, Perfil perfil) {
    Usuario u = personal(auth);
    if (!UsuarioServicio.normalizar(perfil.email()).equals(u.getEmail()))
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "El cambio de correo requiere verificación y aún no está disponible.");
    if (!perfil.document().isBlank()
        && !(perfil.documentType().equals("DNI")
            ? perfil.document().matches("[0-9]{8}")
            : perfil.document().matches("[A-Za-z0-9]{6,12}")))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Revisa el número de documento.");
    PerfilPersonal p = datos(u);
    p.setTelefono(perfil.phone().replaceFirst("^\\+51(?=9[0-9]{8}$)", ""));
    p.setFoto(perfil.photo());
    p.setTipoDocumento(perfil.documentType());
    p.setDocumento(perfil.document());
    p.setFechaNacimiento(perfil.birthday());
    p.setGenero(perfil.gender());
    p.setNotas(perfil.notes());
    u.setNombre(perfil.name().trim());
    perfiles.save(p);
    return dto(u, p);
  }
}
