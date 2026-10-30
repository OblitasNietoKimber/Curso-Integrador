package com.LenasLYS.Backend.dto;

import com.LenasLYS.Backend.modelo.Producto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoDTO {

    private String id;
    private String categoriaId;
    private String categoriaNombre;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String tamano;
    private Integer popularidad;
    private Boolean esNuevo;
    private Boolean esPromocion;
    private String imagen;
    private Integer stock;

    public static ProductoDTO desdeEntidad(Producto producto) {
        if (producto == null) return null;
        return ProductoDTO.builder()
                .id(producto.getId())
                .categoriaId(producto.getCategoria() != null ? producto.getCategoria().getId() : null)
                .categoriaNombre(producto.getCategoria() != null ? producto.getCategoria().getNombre() : null)
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .precio(producto.getPrecio())
                .tamano(producto.getTamano())
                .popularidad(producto.getPopularidad())
                .esNuevo(producto.getEsNuevo())
                .esPromocion(producto.getEsPromocion())
                .imagen(producto.getImagen())
                .stock(producto.getStock())
                .build();
    }
}
