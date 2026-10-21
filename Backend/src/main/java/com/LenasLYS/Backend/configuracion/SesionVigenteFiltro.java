package com.LenasLYS.Backend.configuracion;

import com.LenasLYS.Backend.repositorio.UsuarioRepositorio;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class SesionVigenteFiltro extends OncePerRequestFilter {
  private final UsuarioRepositorio usuarios;

  public SesionVigenteFiltro(UsuarioRepositorio usuarios) {
    this.usuarios = usuarios;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var session = req.getSession(false);
    if (auth != null && session != null) {
      boolean valido = false;
      try {
        var u = usuarios.findById(UUID.fromString(auth.getName()));
        valido =
            u.isPresent()
                && u.get().isActivo()
                && Long.valueOf(u.get().getVersionSesion())
                    .equals(session.getAttribute("authVersion"));
      } catch (IllegalArgumentException ignored) {
      }
      if (!valido) {
        session.invalidate();
        SecurityContextHolder.clearContext();
      }
    }
    chain.doFilter(req, res);
  }
}
