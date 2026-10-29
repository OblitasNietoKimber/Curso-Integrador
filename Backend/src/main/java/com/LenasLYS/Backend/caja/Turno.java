package com.LenasLYS.Backend.caja;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "caja_turnos")
public class Turno {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public String cajero;
  public Instant apertura;
  public Instant cierre;
  public BigDecimal inicial;
  public BigDecimal contado;
  public BigDecimal esperado;
  public BigDecimal diferencia;

  @Column(length = 1000)
  public String notas;
}
