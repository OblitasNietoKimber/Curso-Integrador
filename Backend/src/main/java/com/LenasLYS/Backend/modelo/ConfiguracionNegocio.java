package com.LenasLYS.Backend.modelo;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="configuracion_negocio") @Getter @Setter
public class ConfiguracionNegocio {
 @Id private Integer id=1;
 @Column(nullable=false,length=120) private String nombre="Leñas y Sabores";
 @Column(nullable=false,length=255) private String direccion="C. Turístico Los Palomares Mz. D Lt. 5, Carabayllo";
 @Column(nullable=false,length=25) private String telefono="947 540 597";
 @Column(nullable=false,length=254) private String email="ventas@lenasysabores.store";
 @Column(nullable=false,length=11) private String ruc="";
 @Column(nullable=false,length=100) private String horario="12 m. – 11 p. m.";
}
