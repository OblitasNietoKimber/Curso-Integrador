package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.CarritoDTO;
import com.LenasLYS.Backend.modelo.Carrito;
import com.LenasLYS.Backend.modelo.ItemCarrito;
import com.LenasLYS.Backend.modelo.Producto;
import com.LenasLYS.Backend.modelo.Promocion;
import com.LenasLYS.Backend.repositorio.CarritoRepositorio;
import com.LenasLYS.Backend.repositorio.ProductoRepositorio;
import com.LenasLYS.Backend.repositorio.PromocionRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarritoServicio {

    private final CarritoRepositorio carritoRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final PromocionRepositorio promocionRepositorio;

    @Transactional
    public Carrito obtenerOCrear(String carritoId) {
        if (carritoId == null || carritoId.isBlank()) {
            return crearNuevoCarrito(null);
        }
        return carritoRepositorio.findById(carritoId)
                .orElseGet(() -> crearNuevoCarrito(carritoId));
    }

    @Transactional(readOnly = true)
    public CarritoDTO obtenerCarrito(String carritoId) {
        Carrito carrito = obtenerOCrear(carritoId);
        return CarritoDTO.desdeEntidad(carrito);
    }

    @Transactional
    public CarritoDTO agregarItem(String carritoId, String productoId, Integer cantidad) {
        if (cantidad == null || cantidad < 1) {
            cantidad = 1;
        }

        Carrito carrito = obtenerOCrear(carritoId);

        // Buscar producto o promocion en la base de datos para garantizar precios legitimos
        String nombre;
        String descripcion;
        String imagen;
        BigDecimal precio;

        Optional<Producto> productoOpt = productoRepositorio.findById(productoId);
        if (productoOpt.isPresent()) {
            Producto prod = productoOpt.get();
            nombre = prod.getNombre();
            descripcion = prod.getDescripcion();
            imagen = prod.getImagen();
            precio = prod.getPrecio();
        } else {
            Optional<Promocion> promoOpt = promocionRepositorio.findById(productoId);
            if (promoOpt.isPresent()) {
                Promocion promo = promoOpt.get();
                nombre = promo.getNombre();
                descripcion = promo.getDescripcion();
                imagen = promo.getImagen();
                precio = promo.getPrecio();
            } else {
                throw new IllegalArgumentException("No se encontró el producto o promoción con ID: " + productoId);
            }
        }

        // Verificar si el item ya existe en el carrito
        Optional<ItemCarrito> itemExistente = carrito.getItems().stream()
                .filter(i -> i.getProductoId().equals(productoId))
                .findFirst();

        if (itemExistente.isPresent()) {
            ItemCarrito item = itemExistente.get();
            int nuevaCantidad = Math.min(99, item.getCantidad() + cantidad);
            item.setCantidad(nuevaCantidad);
            item.setPrecioUnitario(precio);
        } else {
            ItemCarrito nuevoItem = ItemCarrito.builder()
                    .carrito(carrito)
                    .productoId(productoId)
                    .nombre(nombre)
                    .descripcion(descripcion)
                    .imagen(imagen)
                    .precioUnitario(precio)
                    .cantidad(Math.min(99, cantidad))
                    .build();
            carrito.getItems().add(nuevoItem);
        }

        carrito.setFechaActualizacion(LocalDateTime.now());
        Carrito guardado = carritoRepositorio.save(carrito);
        return CarritoDTO.desdeEntidad(guardado);
    }

    @Transactional
    public CarritoDTO actualizarCantidad(String carritoId, String productoId, Integer nuevaCantidad) {
        Carrito carrito = obtenerOCrear(carritoId);

        if (nuevaCantidad == null || nuevaCantidad <= 0) {
            return eliminarItem(carritoId, productoId);
        }

        int cantidadAjustada = Math.min(99, nuevaCantidad);
        carrito.getItems().stream()
                .filter(i -> i.getProductoId().equals(productoId))
                .findFirst()
                .ifPresent(item -> item.setCantidad(cantidadAjustada));

        carrito.setFechaActualizacion(LocalDateTime.now());
        Carrito guardado = carritoRepositorio.save(carrito);
        return CarritoDTO.desdeEntidad(guardado);
    }

    @Transactional
    public CarritoDTO eliminarItem(String carritoId, String productoId) {
        Carrito carrito = obtenerOCrear(carritoId);
        carrito.getItems().removeIf(item -> item.getProductoId().equals(productoId));
        carrito.setFechaActualizacion(LocalDateTime.now());
        Carrito guardado = carritoRepositorio.save(carrito);
        return CarritoDTO.desdeEntidad(guardado);
    }

    @Transactional
    public CarritoDTO vaciarCarrito(String carritoId) {
        Carrito carrito = obtenerOCrear(carritoId);
        carrito.getItems().clear();
        carrito.setFechaActualizacion(LocalDateTime.now());
        Carrito guardado = carritoRepositorio.save(carrito);
        return CarritoDTO.desdeEntidad(guardado);
    }

    @Transactional
    public String migrarOFusionar(String origenCarritoId, String destinoUsuarioCarritoId) {
        if (origenCarritoId == null || origenCarritoId.isBlank()
                || destinoUsuarioCarritoId == null || destinoUsuarioCarritoId.isBlank()
                || origenCarritoId.equals(destinoUsuarioCarritoId)) {
            return destinoUsuarioCarritoId;
        }

        Optional<Carrito> origenOpt = carritoRepositorio.findById(origenCarritoId);
        if (origenOpt.isEmpty()) {
            return destinoUsuarioCarritoId;
        }

        Carrito origen = origenOpt.get();
        if (origen.getItems().isEmpty()) {
            return destinoUsuarioCarritoId;
        }

        Carrito destino = obtenerOCrear(destinoUsuarioCarritoId);

        for (ItemCarrito itemOrigen : origen.getItems()) {
            Optional<ItemCarrito> existente = destino.getItems().stream()
                    .filter(i -> i.getProductoId().equals(itemOrigen.getProductoId()))
                    .findFirst();

            if (existente.isPresent()) {
                ItemCarrito i = existente.get();
                i.setCantidad(Math.min(99, i.getCantidad() + itemOrigen.getCantidad()));
            } else {
                ItemCarrito nuevo = ItemCarrito.builder()
                        .carrito(destino)
                        .productoId(itemOrigen.getProductoId())
                        .nombre(itemOrigen.getNombre())
                        .descripcion(itemOrigen.getDescripcion())
                        .imagen(itemOrigen.getImagen())
                        .precioUnitario(itemOrigen.getPrecioUnitario())
                        .cantidad(itemOrigen.getCantidad())
                        .build();
                destino.getItems().add(nuevo);
            }
        }

        destino.setFechaActualizacion(LocalDateTime.now());
        carritoRepositorio.save(destino);

        origen.getItems().clear();
        origen.setFechaActualizacion(LocalDateTime.now());
        carritoRepositorio.save(origen);

        return destinoUsuarioCarritoId;
    }

    private Carrito crearNuevoCarrito(String idDeseado) {
        String idFinal = (idDeseado != null && !idDeseado.isBlank()) ? idDeseado : UUID.randomUUID().toString();
        Carrito carrito = Carrito.builder()
                .id(idFinal)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();
        return carritoRepositorio.save(carrito);
    }
}
