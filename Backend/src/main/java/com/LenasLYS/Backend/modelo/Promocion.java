package com.LenasLYS.Backend.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "promociones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promocion {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "precio", precision = 10, scale = 2, nullable = false)
    private BigDecimal precio;

    @Column(name = "precio_original", precision = 10, scale = 2)
    private BigDecimal precioOriginal;

    @Column(name = "insignia", length = 50)
    private String insignia;

    @Column(name = "icono_insignia", length = 50)
    private String iconoInsignia;

    @Column(name = "tono_insignia", length = 50)
    private String tonoInsignia;

    @Column(name = "tamano", length = 50)
    private String tamano;

    @Column(name = "filtros", length = 200)
    private String filtros;

    @Column(name = "imagen", length = 255)
    private String imagen;

    @Column(name = "popularidad")
    @Builder.Default
    private Integer popularidad = 0;

    @Column(name = "activa", nullable = false)
    @Builder.Default
    private Boolean activa = true;
}
