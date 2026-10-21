package com.LenasLYS.Backend.modelo;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class Usuario {
  @Id private UUID id = UUID.randomUUID();

  @Column(nullable = false, length = 120)
  private String nombre;

  @Column(nullable = false, unique = true, length = 254)
  private String email;

  @Column(nullable = false, length = 25)
  private String telefono;

  @Column(name = "password_hash", length = 100)
  private String passwordHash;

  @Column(name = "google_sub", unique = true, length = 255)
  private String googleSub;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Rol rol = Rol.CLIENTE;

  @Column(nullable = false)
  private boolean activo = true;

  @Column(name = "version_sesion", nullable = false)
  private long versionSesion;

  @Column(nullable = false, columnDefinition = "text")
  private String cuenta = "{}";

  @Column(nullable = false)
  private Instant creado = Instant.now();

  public enum Rol {
    CLIENTE,
    ADMINISTRADOR,
    CAJA,
    COCINA,
    DELIVERY
  }
}
