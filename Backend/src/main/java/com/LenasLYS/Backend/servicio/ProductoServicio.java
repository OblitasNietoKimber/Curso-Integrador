package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.ProductoDTO;
import com.LenasLYS.Backend.modelo.Producto;
import com.LenasLYS.Backend.repositorio.ProductoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoServicio {

    private final ProductoRepositorio productoRepositorio;

    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodos() {
        return productoRepositorio.findByActivoTrue()
                .stream()
                .map(ProductoDTO::desdeEntidad)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listarDestacados() {
        return productoRepositorio.findTop6ByActivoTrueOrderByPopularidadDesc()
                .stream()
                .map(ProductoDTO::desdeEntidad)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listarPorCategoria(String categoriaId) {
        return productoRepositorio.findByCategoria_IdAndActivoTrue(categoriaId)
                .stream()
                .map(ProductoDTO::desdeEntidad)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ProductoDTO> obtenerPorId(String id) {
        return productoRepositorio.findById(id)
                .filter(Producto::getActivo)
                .map(ProductoDTO::desdeEntidad);
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> filtrar(String categoriaId, String tamano, String busqueda, String orden) {
        List<Producto> productos = productoRepositorio.filtrarProductos(categoriaId, tamano, busqueda);

        Comparator<Producto> comparador;
        if ("price_asc".equalsIgnoreCase(orden) || "precio_asc".equalsIgnoreCase(orden) || "price".equalsIgnoreCase(orden)) {
            comparador = Comparator.comparing(Producto::getPrecio);
        } else if ("price_desc".equalsIgnoreCase(orden) || "precio_desc".equalsIgnoreCase(orden)) {
            comparador = Comparator.comparing(Producto::getPrecio).reversed();
        } else if ("new".equalsIgnoreCase(orden) || "nuevo".equalsIgnoreCase(orden)) {
            comparador = Comparator.comparing(Producto::getEsNuevo).reversed()
                    .thenComparing(Producto::getPopularidad, Comparator.reverseOrder());
        } else {
            // Predeterminado por popularidad
            comparador = Comparator.comparing(Producto::getPopularidad, Comparator.nullsLast(Comparator.reverseOrder()));
        }

        return productos.stream()
                .sorted(comparador)
                .map(ProductoDTO::desdeEntidad)
                .toList();
    }
}
