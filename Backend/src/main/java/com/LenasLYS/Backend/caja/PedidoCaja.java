package com.LenasLYS.Backend.caja;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "caja_pedidos")
public class PedidoCaja {
  @Id
  @Column(length = 60)
  public String id;

  public String cliente;
  public String canal;
  public String mesa;
  public boolean pagado;
  public java.time.Instant creado = java.time.Instant.now();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "caja_lineas")
  @OrderColumn(name = "posicion")
  public List<Linea> items = new ArrayList<>();

  @Embeddable
  public static class Linea {
    public String producto;
    public String productoId;
    public int cantidad;
    public BigDecimal precio;

    public Linea() {}

    public Linea(String producto, int cantidad, BigDecimal precio) {
      this.producto = producto;
      this.cantidad = cantidad;
      this.precio = precio;
    }
  }

  public BigDecimal getTotal() {
    return items.stream()
        .map(i -> i.precio.multiply(BigDecimal.valueOf(i.cantidad)))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
