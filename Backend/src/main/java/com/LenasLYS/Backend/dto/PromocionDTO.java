package com.LenasLYS.Backend.dto;

import com.LenasLYS.Backend.modelo.Promocion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromocionDTO {

    private String id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioOriginal;
    private BigDecimal ahorro;
    private String insignia;
    private String iconoInsignia;
    private String tonoInsignia;
    private String tamano;
    private List<String> filtros;
    private String imagen;

    public static PromocionDTO desdeEntidad(Promocion promocion) {
        if (promocion == null) return null;
        BigDecimal ahorro = null;
        if (promocion.getPrecioOriginal() != null && promocion.getPrecio() != null) {
            ahorro = promocion.getPrecioOriginal().subtract(promocion.getPrecio());
        }

        List<String> listaFiltros = Collections.emptyList();
        if (promocion.getFiltros() != null && !promocion.getFiltros().isBlank()) {
            listaFiltros = Arrays.stream(promocion.getFiltros().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        return PromocionDTO.builder()
                .id(promocion.getId())
                .nombre(promocion.getNombre())
                .descripcion(promocion.getDescripcion())
                .precio(promocion.getPrecio())
                .precioOriginal(promocion.getPrecioOriginal())
                .ahorro(ahorro)
                .insignia(promocion.getInsignia())
                .iconoInsignia(promocion.getIconoInsignia())
                .tonoInsignia(promocion.getTonoInsignia())
                .tamano(promocion.getTamano())
                .filtros(listaFiltros)
                .imagen(promocion.getImagen())
                .build();
    }
}
