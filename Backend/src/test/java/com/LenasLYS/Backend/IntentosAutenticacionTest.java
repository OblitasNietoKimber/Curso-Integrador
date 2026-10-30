package com.LenasLYS.Backend;
import com.LenasLYS.Backend.configuracion.IntentosAutenticacionFiltro;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import java.time.Clock;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class IntentosAutenticacionTest {
 @Test void bloqueaExcesoYLiberaAlVencerLaVentana()throws Exception{
  Clock reloj=mock(Clock.class);when(reloj.millis()).thenReturn(0L);
  var filtro=new IntentosAutenticacionFiltro(reloj);
  for(int i=0;i<61;i++){var req=new MockHttpServletRequest("POST","/api/auth/login");req.setRemoteAddr("127.0.0.10");var res=new MockHttpServletResponse();filtro.doFilter(req,res,new MockFilterChain());assertEquals(i<60?200:429,res.getStatus());}
  when(reloj.millis()).thenReturn(900001L);var req=new MockHttpServletRequest("POST","/api/auth/login");req.setRemoteAddr("127.0.0.10");var res=new MockHttpServletResponse();filtro.doFilter(req,res,new MockFilterChain());assertEquals(200,res.getStatus());
 }
}
