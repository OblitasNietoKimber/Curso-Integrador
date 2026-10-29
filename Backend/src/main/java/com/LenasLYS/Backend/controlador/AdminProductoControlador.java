package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.AdminProductoDTO;
import com.LenasLYS.Backend.dto.AdminProductoRequest;
import com.LenasLYS.Backend.servicio.AdminProductoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/productos")
@RequiredArgsConstructor
public class AdminProductoControlador {

    private final AdminProductoServicio servicio;

    @GetMapping
    public ResponseEntity<List<AdminProductoDTO>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @PostMapping
    public ResponseEntity<AdminProductoDTO> crear(@RequestBody AdminProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminProductoDTO> actualizar(@PathVariable String id, @RequestBody AdminProductoRequest request) {
        return ResponseEntity.ok(servicio.actualizar(id, request));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<AdminProductoDTO> cambiarActivo(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(servicio.cambiarActivo(id, Boolean.TRUE.equals(body.get("activo"))));
    }
}