package com.LenasLYS.Backend.dto;

import com.LenasLYS.Backend.modelo.ItemCarrito;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarritoDTO {

    private Long id;
    private String productoId;
    private String nombre;
    private String descripcion;
    private String imagen;
    private BigDecimal precioUnitario;
    private Integer cantidad;
    private BigDecimal subtotal;

    public static ItemCarritoDTO desdeEntidad(ItemCarrito item) {
        if (item == null) return null;
        return ItemCarritoDTO.builder()
                .id(item.getId())
                .productoId(item.getProductoId())
                .nombre(item.getNombre())
                .descripcion(item.getDescripcion())
                .imagen(item.getImagen())
                .precioUnitario(item.getPrecioUnitario())
                .cantidad(item.getCantidad())
                .subtotal(item.calcularSubtotal())
                .build();
    }
}
