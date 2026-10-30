package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.AutenticacionDTO.*;
import com.LenasLYS.Backend.servicio.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacionControlador {
  private final UsuarioServicio usuarios;
  private final AuthenticationManager manager;
  private final AccesoSesionServicio accesos;
  private final SegundoFactorServicio segundoFactor;

  @Value("${app.auth.cookie-secure:false}")
  private boolean secure;

  @Value("${app.auth.google-enabled:false}")
  private boolean googleEnabled;

  @GetMapping("/google")
  public Map<String, Boolean> google() {
    return Map.of("enabled", googleEnabled);
  }

  @GetMapping("/csrf")
  public Map<String, String> csrf(CsrfToken token) {
    return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public Sesion registrar(@Valid @RequestBody Registro dto) {
    return usuarios.sesion(usuarios.registrar(dto));
  }

  @PostMapping("/login")
  public Object login(
      @Valid @RequestBody Login dto, HttpServletRequest req, HttpServletResponse res) {
    Authentication auth =
        manager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(
                UsuarioServicio.normalizar(dto.email()), dto.password()));
    var u = usuarios.actual(auth);
    if (u.getTotpSecret() != null) {
      accesos.desafiar(u, Boolean.TRUE.equals(dto.remember()), req, res);
      return Map.of("twoFactorRequired", true);
    }
    accesos.iniciar(u, Boolean.TRUE.equals(dto.remember()), req, res);
    return usuarios.sesion(u);
  }

  @GetMapping("/2fa/challenge")
  public Map<String, Boolean> desafio(HttpServletRequest req) {
    accesos.pendiente(req);
    return Map.of("pending", true);
  }

  @PostMapping("/2fa/verify")
  public Sesion verificarSegundoFactor(
      @Valid @RequestBody Codigo dto, HttpServletRequest req, HttpServletResponse res) {
    var session = req.getSession();
    synchronized (session) {
      var p = accesos.pendiente(req);
      int intentos = (int) session.getAttribute("segundoFactorIntentos");
      if (intentos >= 5) {
        session.invalidate();
        throw new org.springframework.web.server.ResponseStatusException(
            HttpStatus.TOO_MANY_REQUESTS, "Demasiados intentos. Vuelve a iniciar sesión.");
      }
      session.setAttribute("segundoFactorIntentos", intentos + 1);
      var u = segundoFactor.verificar(p.id(), p.version(), dto.code());
      accesos.iniciar(u, p.recordar(), req, res);
      return usuarios.sesion(u);
    }
  }

  @GetMapping("/me")
  public Sesion me(Authentication auth) {
    return usuarios.sesion(usuarios.actual(auth));
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(HttpServletRequest req, HttpServletResponse res) {
    var session = req.getSession(false);
    if (session != null) session.invalidate();
    SecurityContextHolder.clearContext();
    res.addHeader(
        HttpHeaders.SET_COOKIE,
        ResponseCookie.from("LYSSESSION", "")
            .path("/")
            .httpOnly(true)
            .secure(secure || req.isSecure())
            .sameSite("Lax")
            .maxAge(0)
            .build()
            .toString());
  }

  @PostMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void clave(
      Authentication auth,
      @Valid @RequestBody CambiarClave dto,
      HttpServletRequest req,
      HttpServletResponse res) {
    usuarios.cambiarClave(auth, dto);
    logout(req, res);
  }
}
