package com.LenasLYS.Backend.dto;

import com.LenasLYS.Backend.modelo.Carrito;
import com.LenasLYS.Backend.modelo.ItemCarrito;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarritoDTO {

    private String id;
    private List<ItemCarritoDTO> items;
    private Integer cantidadTotal;
    private BigDecimal total;
    private LocalDateTime fechaActualizacion;

    public static CarritoDTO desdeEntidad(Carrito carrito) {
        if (carrito == null) return null;

        List<ItemCarritoDTO> itemsDto = carrito.getItems() != null
                ? carrito.getItems().stream().map(ItemCarritoDTO::desdeEntidad).toList()
                : Collections.emptyList();

        int cantidad = itemsDto.stream().mapToInt(ItemCarritoDTO::getCantidad).sum();

        BigDecimal granTotal = itemsDto.stream()
                .map(ItemCarritoDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CarritoDTO.builder()
                .id(carrito.getId())
                .items(itemsDto)
                .cantidadTotal(cantidad)
                .total(granTotal)
                .fechaActualizacion(carrito.getFechaActualizacion())
                .build();
    }
}
