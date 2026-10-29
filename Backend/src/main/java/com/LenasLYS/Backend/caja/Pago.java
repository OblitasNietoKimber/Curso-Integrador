package com.LenasLYS.Backend.caja;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "caja_pagos")
public class Pago {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public String pedidoId;
  public Long turnoId;
  public String metodo;
  public String referencia;
  public BigDecimal monto;
  public BigDecimal recibido;
  public BigDecimal vuelto;
  public Instant fecha;
  public boolean reembolsado;
  public Instant fechaReembolso;

  @Column(length = 500)
  public String motivoReembolso;
}
