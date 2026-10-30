package com.LenasLYS.Backend.caja;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CajaAjustes {
  private final com.LenasLYS.Backend.repositorio.ConfiguracionNegocioRepositorio configuracion;
  public CajaAjustes(com.LenasLYS.Backend.repositorio.ConfiguracionNegocioRepositorio configuracion){this.configuracion=configuracion;}
  @Value("${app.caja.nombre:Leñas y Sabores}")
  private String nombre;

  @Value("${app.caja.direccion:C. Turístico Los Palomares Mz. D Lt. 5, Carabayllo}")
  private String direccion;

  @Value("${app.caja.telefono:947 540 597}")
  private String telefono;

  @Value("${app.caja.email:ventas@lenasysabores.store}")
  private String email;

  @Value("${app.caja.horario:12 m. – 11 p. m.}")
  private String horario;

  @Value("${app.caja.ruc:}")
  private String ruc;

  public Map<String, Object> datos() {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("name", nombre);
    m.put("address", direccion);
    m.put("phone", telefono);
    m.put("email", email);
    m.put("hours", horario);
    m.put("ruc", ruc);
    m.put("open", true);
    m.put("tax", 0);
    m.put("methods", List.of("Efectivo", "Yape", "Plin", "Tarjeta", "Transferencia"));
    configuracion.findById(1).ifPresent(c->{m.put("name",c.getNombre());m.put("address",c.getDireccion());m.put("phone",c.getTelefono());m.put("email",c.getEmail());m.put("ruc",c.getRuc());m.put("hours",c.getHorario());});
    return m;
  }
}
