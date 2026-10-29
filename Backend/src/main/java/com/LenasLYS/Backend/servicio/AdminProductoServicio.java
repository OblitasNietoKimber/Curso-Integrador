package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.AdminProductoDTO;
import com.LenasLYS.Backend.dto.AdminProductoRequest;
import com.LenasLYS.Backend.modelo.Categoria;
import com.LenasLYS.Backend.modelo.Producto;
import com.LenasLYS.Backend.repositorio.CategoriaRepositorio;
import com.LenasLYS.Backend.repositorio.ProductoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminProductoServicio {

    private final ProductoRepositorio productoRepositorio;
    private final CategoriaRepositorio categoriaRepositorio;

    @Transactional(readOnly = true)
    public List<AdminProductoDTO> listar() {
        return productoRepositorio.findAll(Sort.by("nombre")).stream()
                .map(AdminProductoDTO::desdeEntidad)
                .toList();
    }

    @Transactional
    public AdminProductoDTO crear(AdminProductoRequest r) {
        validar(r);
        Producto p = Producto.builder()
                .id("prod-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
        aplicar(p, r);
        return AdminProductoDTO.desdeEntidad(productoRepositorio.save(p));
    }

    @Transactional
    public AdminProductoDTO actualizar(String id, AdminProductoRequest r) {
        validar(r);
        Producto p = buscar(id);
        aplicar(p, r);
        return AdminProductoDTO.desdeEntidad(productoRepositorio.save(p));
    }

    @Transactional
    public AdminProductoDTO cambiarActivo(String id, boolean activo) {
        Producto p = buscar(id);
        p.setActivo(activo);
        return AdminProductoDTO.desdeEntidad(productoRepositorio.save(p));
    }

    private Producto buscar(String id) {
        return productoRepositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void aplicar(Producto p, AdminProductoRequest r) {
        Categoria categoria = categoriaRepositorio.findById(r.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoría no existe"));
        p.setCategoria(categoria);
        p.setNombre(r.nombre().trim());
        p.setDescripcion(r.descripcion() == null || r.descripcion().isBlank() ? null : r.descripcion().trim());
        p.setPrecio(r.precio());
        p.setTamano(r.tamano() == null || r.tamano().isBlank() ? null : r.tamano().trim());
        p.setEsNuevo(Boolean.TRUE.equals(r.esNuevo()));
        p.setEsPromocion(Boolean.TRUE.equals(r.esPromocion()));
        p.setImagen(r.imagen() == null || r.imagen().isBlank() ? null : r.imagen().trim());
        p.setStock(r.stock() == null ? 0 : r.stock());
    }

    private void validar(AdminProductoRequest r) {
        if (r == null) error("Datos del producto requeridos");
        if (r.categoriaId() == null || r.categoriaId().isBlank()) error("La categoría es obligatoria");
        if (r.nombre() == null || r.nombre().isBlank()) error("El nombre es obligatorio");
        if (r.nombre().trim().length() > 150) error("El nombre no puede superar 150 caracteres");
        if (r.precio() == null || r.precio().compareTo(BigDecimal.ZERO) <= 0) error("El precio debe ser mayor a 0");
        if (r.precio().scale() > 2 || r.precio().precision() - r.precio().scale() > 8) error("Precio fuera de rango");
        if (r.stock() != null && r.stock() < 0) error("El stock no puede ser negativo");
        if (r.descripcion() != null && r.descripcion().length() > 500) error("La descripción no puede superar 500 caracteres");
        if (r.tamano() != null && r.tamano().length() > 50) error("El tamaño no puede superar 50 caracteres");
        if (r.imagen() != null && r.imagen().length() > 255) error("La ruta de la imagen no puede superar 255 caracteres");
    }

    private void error(String mensaje) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }
}