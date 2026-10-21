package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.modelo.Usuario;
import jakarta.servlet.http.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccesoSesionServicio {
  private final SecurityContextRepository contexts;

  @Value("${app.auth.cookie-secure:false}")
  private boolean secure;

  public record Pendiente(UUID id, long version, Instant vence, boolean recordar)
      implements java.io.Serializable {}

  public void desafiar(
      Usuario u, boolean recordar, HttpServletRequest req, HttpServletResponse res) {
    var session = req.getSession();
    req.changeSessionId();
    SecurityContextHolder.clearContext();
    session.removeAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
    session.removeAttribute("authVersion");
    session.removeAttribute("primaryAt");
    session.setAttribute(
        "segundoFactor",
        new Pendiente(u.getId(), u.getVersionSesion(), Instant.now().plusSeconds(300), recordar));
    session.setAttribute("segundoFactorIntentos", 0);
    session.setMaxInactiveInterval(300);
    new HttpSessionCsrfTokenRepository().saveToken(null, req, res);
  }

  public Pendiente pendiente(HttpServletRequest req) {
    var session = req.getSession(false);
    if (session != null
        && session.getAttribute("segundoFactor") instanceof Pendiente p
        && p.vence().isAfter(Instant.now())) return p;
    throw new org.springframework.web.server.ResponseStatusException(
        HttpStatus.UNAUTHORIZED, "La verificación venció. Vuelve a iniciar sesión.");
  }

  public void iniciar(
      Usuario u, boolean recordar, HttpServletRequest req, HttpServletResponse res) {
    var session = req.getSession();
    req.changeSessionId();
    session.removeAttribute("segundoFactor");
    session.removeAttribute("segundoFactorIntentos");
    session.setAttribute("primaryAt", Instant.now());
    session.setAttribute("authVersion", u.getVersionSesion());
    session.setMaxInactiveInterval(recordar ? 604800 : 1800);
    var auth =
        UsernamePasswordAuthenticationToken.authenticated(
            u.getId().toString(),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_" + u.getRol().name())));
    var context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);
    contexts.saveContext(context, req, res);
    new HttpSessionCsrfTokenRepository().saveToken(null, req, res);
    res.addHeader(
        HttpHeaders.SET_COOKIE,
        ResponseCookie.from("LYSSESSION", session.getId())
            .httpOnly(true)
            .secure(secure || req.isSecure())
            .sameSite("Lax")
            .path("/")
            .maxAge(recordar ? Duration.ofDays(7) : Duration.ofSeconds(-1))
            .build()
            .toString());
  }
}
