package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromocionRepositorio extends JpaRepository<Promocion, String> {

    List<Promocion> findByActivaTrueOrderByPopularidadDesc();

    List<Promocion> findTop3ByActivaTrueOrderByPopularidadDesc();

    @Query("SELECT p FROM Promocion p WHERE p.activa = true " +
           "AND (:categoria IS NULL OR :categoria = '' OR :categoria = 'todas' OR LOWER(p.filtros) LIKE LOWER(CONCAT('%', :categoria, '%'))) " +
           "AND (:busqueda IS NULL OR :busqueda = '' OR " +
           "     LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
           "     LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')))")
    List<Promocion> filtrarPromociones(
            @Param("categoria") String categoria,
            @Param("busqueda") String busqueda
    );
}
