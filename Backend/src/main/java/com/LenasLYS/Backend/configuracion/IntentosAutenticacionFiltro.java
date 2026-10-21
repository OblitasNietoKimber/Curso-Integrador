package com.LenasLYS.Backend.configuracion;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Clock;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/** Límite local por dirección remota; no confía en cabeceras enviadas por el cliente. */
public class IntentosAutenticacionFiltro extends OncePerRequestFilter {
 private static final Set<String> RUTAS=Set.of("/api/auth/login","/api/auth/register","/api/auth/forgot-password","/api/auth/reset-password");
 private record Ventana(long hasta,int intentos) {}
 private final Map<String,Ventana> ventanas=new ConcurrentHashMap<>();
 private final Clock reloj;
 public IntentosAutenticacionFiltro(){this(Clock.systemUTC());}
 public IntentosAutenticacionFiltro(Clock reloj){this.reloj=reloj;}
 @Override protected boolean shouldNotFilter(HttpServletRequest request){return !request.getMethod().equals("POST")||!RUTAS.contains(request.getRequestURI());}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  long ahora=reloj.millis();
  ventanas.entrySet().removeIf(e->e.getValue().hasta()<=ahora);
  String clave=req.getRemoteAddr()+":"+req.getRequestURI();
  if(ventanas.size()>=10000&&!ventanas.containsKey(clave)){rechazar(res);return;}
  var ventana=ventanas.compute(clave,(k,v)->v==null?new Ventana(ahora+900000,1):new Ventana(v.hasta(),v.intentos()+1));
  if(ventana.intentos()>60){rechazar(res);return;}
  chain.doFilter(req,res);
 }
 private void rechazar(HttpServletResponse res)throws IOException{res.setStatus(429);res.setHeader("Retry-After","900");res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Demasiados intentos. Espera unos minutos antes de volver a intentar.\"}");}
}
