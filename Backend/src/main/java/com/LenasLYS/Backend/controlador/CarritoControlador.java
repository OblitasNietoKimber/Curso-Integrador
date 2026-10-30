package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.ActualizarCantidadDTO;
import com.LenasLYS.Backend.dto.AgregarItemDTO;
import com.LenasLYS.Backend.dto.CarritoDTO;
import com.LenasLYS.Backend.servicio.CarritoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    private String resolverCarritoId(String headerCarritoId, String paramCarritoId, Authentication auth) {
        String clienteCarritoId = headerCarritoId != null && !headerCarritoId.isBlank() ? headerCarritoId : paramCarritoId;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String usuarioCarritoId = "usr_" + auth.getName();
            if (clienteCarritoId != null && !clienteCarritoId.isBlank() && !clienteCarritoId.equals(usuarioCarritoId)) {
                return carritoServicio.migrarOFusionar(clienteCarritoId, usuarioCarritoId);
            }
            return usuarioCarritoId;
        }
        return clienteCarritoId;
    }

    @GetMapping
    public ResponseEntity<CarritoDTO> obtenerCarrito(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            Authentication auth
    ) {
        String carritoId = resolverCarritoId(headerCarritoId, paramCarritoId, auth);
        return ResponseEntity.ok(carritoServicio.obtenerCarrito(carritoId));
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoDTO> agregarItem(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            @RequestBody AgregarItemDTO peticion,
            Authentication auth
    ) {
        String carritoId = resolverCarritoId(headerCarritoId, paramCarritoId, auth);
        CarritoDTO carrito = carritoServicio.agregarItem(carritoId, peticion.getProductoId(), peticion.getCantidad());
        return ResponseEntity.ok(carrito);
    }

    @PutMapping("/items/{productoId}")
    public ResponseEntity<CarritoDTO> actualizarCantidad(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            @PathVariable String productoId,
            @RequestBody ActualizarCantidadDTO peticion,
            Authentication auth
    ) {
        String carritoId = resolverCarritoId(headerCarritoId, paramCarritoId, auth);
        CarritoDTO carrito = carritoServicio.actualizarCantidad(carritoId, productoId, peticion.getCantidad());
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping("/items/{productoId}")
    public ResponseEntity<CarritoDTO> eliminarItem(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            @PathVariable String productoId,
            Authentication auth
    ) {
        String carritoId = resolverCarritoId(headerCarritoId, paramCarritoId, auth);
        CarritoDTO carrito = carritoServicio.eliminarItem(carritoId, productoId);
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping
    public ResponseEntity<CarritoDTO> vaciarCarrito(
            @RequestHeader(value = "X-Carrito-Id", required = false) String headerCarritoId,
            @RequestParam(value = "carritoId", required = false) String paramCarritoId,
            Authentication auth
    ) {
        String carritoId = resolverCarritoId(headerCarritoId, paramCarritoId, auth);
        CarritoDTO carrito = carritoServicio.vaciarCarrito(carritoId);
        return ResponseEntity.ok(carrito);
    }
}
