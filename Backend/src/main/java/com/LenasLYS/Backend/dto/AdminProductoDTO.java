package com.LenasLYS.Backend.dto;

import com.LenasLYS.Backend.modelo.Producto;

import java.math.BigDecimal;

public record AdminProductoDTO(
        String id,
        String categoriaId,
        String categoriaNombre,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String tamano,
        Integer popularidad,
        Boolean esNuevo,
        Boolean esPromocion,
        String imagen,
        Integer stock,
        Boolean activo
) {
    public static AdminProductoDTO desdeEntidad(Producto p) {
        return new AdminProductoDTO(
                p.getId(),
                p.getCategoria() != null ? p.getCategoria().getId() : null,
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getNombre(),
                p.getDescripcion(),
                p.getPrecio(),
                p.getTamano(),
                p.getPopularidad(),
                p.getEsNuevo(),
                p.getEsPromocion(),
                p.getImagen(),
                p.getStock(),
                p.getActivo()
        );
    }
}