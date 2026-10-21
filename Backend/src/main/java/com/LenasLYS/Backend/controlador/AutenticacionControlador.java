package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.dto.AutenticacionDTO.*;
import com.LenasLYS.Backend.servicio.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.util.Map;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AutenticacionControlador {
 private final UsuarioServicio usuarios;private final AuthenticationManager manager;private final SecurityContextRepository contexts;
 @Value("${app.auth.cookie-secure:false}") private boolean secure;
 @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token){return Map.of("token",token.getToken(),"headerName",token.getHeaderName());}
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public Sesion registrar(@Valid @RequestBody Registro dto){return usuarios.sesion(usuarios.registrar(dto));}
 @PostMapping("/login") public Sesion login(@Valid @RequestBody Login dto,HttpServletRequest req,HttpServletResponse res){
  Authentication auth=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(UsuarioServicio.normalizar(dto.email()),dto.password()));
  var session=req.getSession();req.changeSessionId();
  var u=usuarios.actual(auth);session.setAttribute("authVersion",u.getVersionSesion());session.setMaxInactiveInterval(dto.remember()?604800:1800);
  var context=SecurityContextHolder.createEmptyContext();context.setAuthentication(auth);SecurityContextHolder.setContext(context);contexts.saveContext(context,req,res);
  new org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository().saveToken(null,req,res);
  res.addHeader(HttpHeaders.SET_COOKIE,ResponseCookie.from("LYSSESSION",session.getId()).httpOnly(true).secure(secure||req.isSecure()).sameSite("Lax").path("/").maxAge(dto.remember()?Duration.ofDays(7):Duration.ofSeconds(-1)).build().toString());
  return usuarios.sesion(u);
 }
 @GetMapping("/me") public Sesion me(Authentication auth){return usuarios.sesion(usuarios.actual(auth));}
 @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(HttpServletRequest req,HttpServletResponse res){var session=req.getSession(false);if(session!=null)session.invalidate();SecurityContextHolder.clearContext();res.addHeader(HttpHeaders.SET_COOKIE,ResponseCookie.from("LYSSESSION","").path("/").httpOnly(true).secure(secure||req.isSecure()).sameSite("Lax").maxAge(0).build().toString());}
 @PostMapping("/password") @ResponseStatus(HttpStatus.NO_CONTENT) public void clave(Authentication auth,@Valid @RequestBody CambiarClave dto,HttpServletRequest req,HttpServletResponse res){usuarios.cambiarClave(auth,dto);logout(req,res);}
}
