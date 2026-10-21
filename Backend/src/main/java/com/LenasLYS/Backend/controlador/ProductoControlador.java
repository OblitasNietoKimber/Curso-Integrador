package com.LenasLYS.Backend.controlador;

import com.LenasLYS.Backend.dto.ProductoDTO;
import com.LenasLYS.Backend.servicio.ProductoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoControlador {

    private final ProductoServicio productoServicio;

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarProductos(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String tamano,
            @RequestParam(required = false) String buscar,
            @RequestParam(required = false, defaultValue = "popular") String orden
    ) {
        if (categoria == null && tamano == null && buscar == null && (orden == null || orden.equals("popular"))) {
            return ResponseEntity.ok(productoServicio.listarTodos());
        }
        return ResponseEntity.ok(productoServicio.filtrar(categoria, tamano, buscar, orden));
    }

    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoDTO>> listarDestacados() {
        return ResponseEntity.ok(productoServicio.listarDestacados());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable String id) {
        return productoServicio.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
