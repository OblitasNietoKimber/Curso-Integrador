package com.LenasLYS.Backend.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "precio", precision = 10, scale = 2, nullable = false)
    private BigDecimal precio;

    @Column(name = "tamano", length = 50)
    private String tamano;

    @Column(name = "popularidad")
    @Builder.Default
    private Integer popularidad = 0;

    @Column(name = "es_nuevo", nullable = false)
    @Builder.Default
    private Boolean esNuevo = false;

    @Column(name = "es_promocion", nullable = false)
    @Builder.Default
    private Boolean esPromocion = false;

    @Column(name = "imagen", length = 255)
    private String imagen;

    @Column(name = "stock", nullable = false)
    @Builder.Default
    private Integer stock = 100;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
