package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.ActualizarCantidadDTO;
import com.LenasLYS.Backend.dto.AgregarItemDTO;
import com.LenasLYS.Backend.dto.CarritoDTO;
import com.LenasLYS.Backend.servicio.CarritoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoControlador {

    private final CarritoServicio carritoServicio;

    @GetMapping
    public ResponseEntity<CarritoDTO> obtenerCarrito(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId
    ) {
        String carritoId = headerCarritoId != null && !headerCarritoId.isBlank() ? headerCarritoId : paramCarritoId;
        return ResponseEntity.ok(carritoServicio.obtenerCarrito(carritoId));
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoDTO> agregarItem(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            @RequestBody AgregarItemDTO peticion
    ) {
        String carritoId = headerCarritoId != null && !headerCarritoId.isBlank() ? headerCarritoId : paramCarritoId;
        CarritoDTO carrito = carritoServicio.agregarItem(carritoId, peticion.getProductoId(), peticion.getCantidad());
        return ResponseEntity.ok(carrito);
    }

    @PutMapping("/items/{productoId}")
    public ResponseEntity<CarritoDTO> actualizarCantidad(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            @PathVariable String productoId,
            @RequestBody ActualizarCantidadDTO peticion
    ) {
        String carritoId = headerCarritoId != null && !headerCarritoId.isBlank() ? headerCarritoId : paramCarritoId;
        CarritoDTO carrito = carritoServicio.actualizarCantidad(carritoId, productoId, peticion.getCantidad());
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping("/items/{productoId}")
    public ResponseEntity<CarritoDTO> eliminarItem(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            @PathVariable String productoId
    ) {
        String carritoId = headerCarritoId != null && !headerCarritoId.isBlank() ? headerCarritoId : paramCarritoId;
        CarritoDTO carrito = carritoServicio.eliminarItem(carritoId, productoId);
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping
    public ResponseEntity<CarritoDTO> vaciarCarrito(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId
    ) {
        String carritoId = headerCarritoId != null && !headerCarritoId.isBlank() ? headerCarritoId : paramCarritoId;
        CarritoDTO carrito = carritoServicio.vaciarCarrito(carritoId);
        return ResponseEntity.ok(carrito);
    }
}
