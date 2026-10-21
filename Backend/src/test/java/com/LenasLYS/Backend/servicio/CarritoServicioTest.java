package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.CarritoDTO;
import com.LenasLYS.Backend.modelo.Carrito;
import com.LenasLYS.Backend.modelo.ItemCarrito;
import com.LenasLYS.Backend.modelo.Producto;
import com.LenasLYS.Backend.repositorio.CarritoRepositorio;
import com.LenasLYS.Backend.repositorio.ProductoRepositorio;
import com.LenasLYS.Backend.repositorio.PromocionRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarritoServicioTest {

    @Mock
    private CarritoRepositorio carritoRepositorio;

    @Mock
    private ProductoRepositorio productoRepositorio;

    @Mock
    private PromocionRepositorio promocionRepositorio;

    @InjectMocks
    private CarritoServicio carritoServicio;

    private Carrito carritoPrueba;
    private Producto productoPrueba;

    @BeforeEach
    void inicializar() {
        carritoPrueba = Carrito.builder()
                .id("carrito-test-123")
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        productoPrueba = Producto.builder()
                .id("pollo-02")
                .nombre("1/4 de pollo")
                .descripcion("Un cuarto de pollo con papas")
                .precio(new BigDecimal("18.90"))
                .imagen("/images/carta/products/pollo-02.webp")
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Debe agregar un producto y calcular importes correctamente")
    void testAgregarItem() {
        when(carritoRepositorio.findById("carrito-test-123")).thenReturn(Optional.of(carritoPrueba));
        when(productoRepositorio.findById("pollo-02")).thenReturn(Optional.of(productoPrueba));
        when(carritoRepositorio.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CarritoDTO resultado = carritoServicio.agregarItem("carrito-test-123", "pollo-02", 2);

        assertNotNull(resultado);
        assertEquals(1, resultado.getItems().size());
        assertEquals(2, resultado.getCantidadTotal());
        assertEquals(new BigDecimal("37.80"), resultado.getTotal());
        assertEquals("1/4 de pollo", resultado.getItems().get(0).getNombre());
    }

    @Test
    @DisplayName("Debe actualizar la cantidad de un producto existente")
    void testActualizarCantidad() {
        ItemCarrito item = ItemCarrito.builder()
                .id(1L)
                .carrito(carritoPrueba)
                .productoId("pollo-02")
                .nombre("1/4 de pollo")
                .precioUnitario(new BigDecimal("18.90"))
                .cantidad(2)
                .build();
        carritoPrueba.getItems().add(item);

        when(carritoRepositorio.findById("carrito-test-123")).thenReturn(Optional.of(carritoPrueba));
        when(carritoRepositorio.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CarritoDTO resultado = carritoServicio.actualizarCantidad("carrito-test-123", "pollo-02", 3);

        assertNotNull(resultado);
        assertEquals(3, resultado.getCantidadTotal());
        assertEquals(new BigDecimal("56.70"), resultado.getTotal());
    }

    @Test
    @DisplayName("Debe eliminar un producto individual del carrito")
    void testEliminarItem() {
        ItemCarrito item = ItemCarrito.builder()
                .id(1L)
                .carrito(carritoPrueba)
                .productoId("pollo-02")
                .nombre("1/4 de pollo")
                .precioUnitario(new BigDecimal("18.90"))
                .cantidad(1)
                .build();
        carritoPrueba.getItems().add(item);

        when(carritoRepositorio.findById("carrito-test-123")).thenReturn(Optional.of(carritoPrueba));
        when(carritoRepositorio.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CarritoDTO resultado = carritoServicio.eliminarItem("carrito-test-123", "pollo-02");

        assertNotNull(resultado);
        assertEquals(0, resultado.getItems().size());
        assertEquals(0, resultado.getCantidadTotal());
        assertEquals(BigDecimal.ZERO, resultado.getTotal());
    }

    @Test
    @DisplayName("Debe vaciar el carrito completamente")
    void testVaciarCarrito() {
        ItemCarrito item = ItemCarrito.builder()
                .id(1L)
                .carrito(carritoPrueba)
                .productoId("pollo-02")
                .nombre("1/4 de pollo")
                .precioUnitario(new BigDecimal("18.90"))
                .cantidad(2)
                .build();
        carritoPrueba.getItems().add(item);

        when(carritoRepositorio.findById("carrito-test-123")).thenReturn(Optional.of(carritoPrueba));
        when(carritoRepositorio.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CarritoDTO resultado = carritoServicio.vaciarCarrito("carrito-test-123");

        assertNotNull(resultado);
        assertTrue(resultado.getItems().isEmpty());
        assertEquals(0, resultado.getCantidadTotal());
        assertEquals(BigDecimal.ZERO, resultado.getTotal());
    }
}
