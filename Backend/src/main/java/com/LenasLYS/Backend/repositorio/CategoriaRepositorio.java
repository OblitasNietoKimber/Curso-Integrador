package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepositorio extends JpaRepository<Categoria, String> {

    List<Categoria> findByActivaTrueOrderByOrdenAsc();
}
