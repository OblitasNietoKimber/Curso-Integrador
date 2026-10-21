package com.LenasLYS.Backend.modelo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@NoArgsConstructor
public class RolSistema {
  @Id
  @Column(name = "id_rol")
  private Integer id;

  @Column(nullable = false, unique = true, length = 20)
  private String nombre;
}
