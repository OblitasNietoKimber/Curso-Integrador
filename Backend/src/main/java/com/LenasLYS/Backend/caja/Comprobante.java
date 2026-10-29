package com.LenasLYS.Backend.caja;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "caja_comprobantes", uniqueConstraints = @UniqueConstraint(columnNames = "pagoId"))
public class Comprobante {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public Long pagoId;
  public String pedidoId;
  public String numero;
  public String tipo;
  public String cliente;
  public String documento;
  public Instant fecha;
  public BigDecimal total;
  public boolean anulado;
}
