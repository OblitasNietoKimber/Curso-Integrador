package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.PromocionDTO;
import com.LenasLYS.Backend.servicio.PromocionServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionControlador {

    private final PromocionServicio promocionServicio;

    @GetMapping
    public ResponseEntity<List<PromocionDTO>> listarPromociones(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String buscar
    ) {
        if (categoria == null && buscar == null) {
            return ResponseEntity.ok(promocionServicio.listarTodas());
        }
        return ResponseEntity.ok(promocionServicio.filtrar(categoria, buscar));
    }

    @GetMapping("/destacadas")
    public ResponseEntity<List<PromocionDTO>> listarDestacadas() {
        return ResponseEntity.ok(promocionServicio.listarDestacadas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromocionDTO> obtenerPorId(@PathVariable String id) {
        return promocionServicio.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
