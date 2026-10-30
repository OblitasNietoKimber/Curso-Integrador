package com.LenasLYS.Backend.modelo;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
public class Cliente {
  @Id private UUID id = UUID.randomUUID();

  // Un cliente presencial puede existir sin cuenta de acceso.
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_usuario", unique = true)
  private Usuario usuario;

  @Column(nullable = false, length = 120)
  private String nombre;

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

  // Direcciones, referencias de pago y preferencias; no contiene credenciales ni perfil duplicado.
  @Column(nullable = false, columnDefinition = "text")
  private String cuenta = "{}";
}
