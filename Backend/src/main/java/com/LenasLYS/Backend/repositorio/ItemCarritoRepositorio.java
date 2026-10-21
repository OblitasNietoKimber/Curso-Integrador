package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.ItemCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemCarritoRepositorio extends JpaRepository<ItemCarrito, Long> {

    Optional<ItemCarrito> findByCarrito_IdAndProductoId(String carritoId, String productoId);

    void deleteByCarrito_IdAndProductoId(String carritoId, String productoId);
}
