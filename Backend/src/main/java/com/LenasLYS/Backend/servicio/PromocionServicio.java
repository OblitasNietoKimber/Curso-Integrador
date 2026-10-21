package com.LenasLYS.Backend.servicio;

import com.LenasLYS.Backend.dto.PromocionDTO;
import com.LenasLYS.Backend.modelo.Promocion;
import com.LenasLYS.Backend.repositorio.PromocionRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromocionServicio {

    private final PromocionRepositorio promocionRepositorio;

    @Transactional(readOnly = true)
    public List<PromocionDTO> listarTodas() {
        return promocionRepositorio.findByActivaTrueOrderByPopularidadDesc()
                .stream()
                .map(PromocionDTO::desdeEntidad)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PromocionDTO> listarDestacadas() {
        return promocionRepositorio.findTop3ByActivaTrueOrderByPopularidadDesc()
                .stream()
                .map(PromocionDTO::desdeEntidad)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<PromocionDTO> obtenerPorId(String id) {
        return promocionRepositorio.findById(id)
                .filter(Promocion::getActiva)
                .map(PromocionDTO::desdeEntidad);
    }

    @Transactional(readOnly = true)
    public List<PromocionDTO> filtrar(String categoria, String busqueda) {
        return promocionRepositorio.filtrarPromociones(categoria, busqueda)
                .stream()
                .map(PromocionDTO::desdeEntidad)
                .toList();
    }
}
