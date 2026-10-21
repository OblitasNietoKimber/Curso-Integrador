package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.ProductoDTO;
import com.LenasLYS.Backend.modelo.Categoria;
import com.LenasLYS.Backend.modelo.Producto;
import com.LenasLYS.Backend.repositorio.ProductoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServicioTest {

    @Mock
    private ProductoRepositorio productoRepositorio;

    @InjectMocks
    private ProductoServicio productoServicio;

    private Producto productoPollo;
    private Categoria categoriaPollo;

    @BeforeEach
    void inicializar() {
        categoriaPollo = Categoria.builder()
                .id("pollo")
                .nombre("Pollo a la brasa")
                .icono("chicken")
                .orden(1)
                .activa(true)
                .build();

        productoPollo = Producto.builder()
                .id("pollo-01")
                .categoria(categoriaPollo)
                .nombre("Pollo entero")
                .descripcion("Un pollo entero con papas")
                .precio(new BigDecimal("62.90"))
                .tamano("familiar")
                .popularidad(200)
                .esNuevo(false)
                .esPromocion(false)
                .imagen("/images/carta/products/pollo-01.webp")
                .stock(50)
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Debe listar todos los productos activos")
    void testListarTodos() {
        when(productoRepositorio.findByActivoTrue()).thenReturn(List.of(productoPollo));

        List<ProductoDTO> resultado = productoServicio.listarTodos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("pollo-01", resultado.get(0).getId());
        assertEquals(new BigDecimal("62.90"), resultado.get(0).getPrecio());
        verify(productoRepositorio, times(1)).findByActivoTrue();
    }

    @Test
    @DisplayName("Debe obtener un producto por su identificador")
    void testObtenerPorId() {
        when(productoRepositorio.findById("pollo-01")).thenReturn(Optional.of(productoPollo));

        Optional<ProductoDTO> resultado = productoServicio.obtenerPorId("pollo-01");

        assertTrue(resultado.isPresent());
        assertEquals("Pollo entero", resultado.get().getNombre());
        assertEquals("pollo", resultado.get().getCategoriaId());
    }

    @Test
    @DisplayName("Debe filtrar productos por criterio")
    void testFiltrarProductos() {
        when(productoRepositorio.filtrarProductos("pollo", "familiar", "entero"))
                .thenReturn(List.of(productoPollo));

        List<ProductoDTO> resultado = productoServicio.filtrar("pollo", "familiar", "entero", "popular");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("pollo-01", resultado.get(0).getId());
    }
}
