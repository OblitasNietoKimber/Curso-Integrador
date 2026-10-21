package com.LenasLYS.Backend.modelo;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "recuperaciones")
@Getter
@Setter
public class Recuperacion {
  @Id private UUID id = UUID.randomUUID();

  @Column(name = "usuario_id", nullable = false)
  private UUID usuarioId;

  @Column(name = "token_hash", nullable = false, unique = true, length = 64)
  private String tokenHash;

  @Column(nullable = false)
  private Instant vence;
}
