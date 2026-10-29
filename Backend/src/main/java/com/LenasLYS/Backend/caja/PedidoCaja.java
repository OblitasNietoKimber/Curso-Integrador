package com.LenasLYS.Backend.caja;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@org.hibernate.annotations.DynamicUpdate
@Table(name = "caja_pedidos")
public class PedidoCaja {
  @Id
  @Column(length = 60)
  public String id;

  public String cliente;
  public String canal;
  public String mesa;
  public boolean pagado;
  public String estado = "Recibido";
  public java.time.Instant aceptado;
  public java.time.Instant listo;
  public java.time.Instant entregado;
  @Column(length = 1000)
  public String notas = "";
  @Column(length = 500)
  public String direccion = "";
  public String telefono = "";
  @Column(unique = true, length = 100)
  public String solicitud;
  public BigDecimal envio = BigDecimal.ZERO;
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
    public String imagen;

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
        .reduce(envio == null ? BigDecimal.ZERO : envio, BigDecimal::add);
  }
}
