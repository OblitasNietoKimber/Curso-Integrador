package com.LenasLYS.Backend.dto;

import java.math.BigDecimal;

public record AdminProductoRequest(
        String categoriaId,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String tamano,
        Boolean esNuevo,
        Boolean esPromocion,
        String imagen,
        Integer stock
) {}