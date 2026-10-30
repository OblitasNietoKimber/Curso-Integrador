package com.LenasLYS.Backend.dto;

import com.LenasLYS.Backend.modelo.Categoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaDTO {

    private String id;
    private String nombre;
    private String icono;
    private Integer orden;

    public static CategoriaDTO desdeEntidad(Categoria categoria) {
        if (categoria == null) return null;
        return CategoriaDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .icono(categoria.getIcono())
                .orden(categoria.getOrden())
                .build();
    }
}
