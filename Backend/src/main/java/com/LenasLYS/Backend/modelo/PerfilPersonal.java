package com.LenasLYS.Backend.modelo;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "perfiles_personal")
@Getter
@Setter
public class PerfilPersonal {
  @Id
  @Column(name = "usuario_id")
  private UUID usuarioId;

  @Column(nullable = false, length = 25)
  private String telefono = "";

  @Column(columnDefinition = "text")
  private String foto;

  @Column(name = "tipo_documento", nullable = false, length = 20)
  private String tipoDocumento = "DNI";

  @Column(nullable = false, length = 20)
  private String documento = "";

  @Column(name = "fecha_nacimiento", nullable = false, length = 10)
  private String fechaNacimiento = "";

  @Column(nullable = false, length = 40)
  private String genero = "";

  @Column(nullable = false, length = 500)
  private String notas = "";
}
