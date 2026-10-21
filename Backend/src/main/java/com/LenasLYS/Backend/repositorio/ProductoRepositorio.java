package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepositorio extends JpaRepository<Producto, String> {

    List<Producto> findByActivoTrue();

    List<Producto> findByCategoria_IdAndActivoTrue(String categoriaId);

    List<Producto> findTop6ByActivoTrueOrderByPopularidadDesc();

    @Query("SELECT p FROM Producto p WHERE p.activo = true " +
           "AND (:categoriaId IS NULL OR :categoriaId = '' OR :categoriaId = 'todos' OR p.categoria.id = :categoriaId) " +
           "AND (:tamano IS NULL OR :tamano = '' OR :tamano = 'todos' OR p.tamano = :tamano) " +
           "AND (:busqueda IS NULL OR :busqueda = '' OR " +
           "     LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
           "     LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')))")
    List<Producto> filtrarProductos(
            @Param("categoriaId") String categoriaId,
            @Param("tamano") String tamano,
            @Param("busqueda") String busqueda
    );
}
