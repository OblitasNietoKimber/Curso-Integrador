package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.CategoriaDTO;
import com.LenasLYS.Backend.modelo.Categoria;
import com.LenasLYS.Backend.repositorio.CategoriaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoriaServicio {

    private final CategoriaRepositorio categoriaRepositorio;

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listarActivas() {
        return categoriaRepositorio.findByActivaTrueOrderByOrdenAsc()
                .stream()
                .map(CategoriaDTO::desdeEntidad)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CategoriaDTO> obtenerPorId(String id) {
        return categoriaRepositorio.findById(id)
                .map(CategoriaDTO::desdeEntidad);
    }
}
