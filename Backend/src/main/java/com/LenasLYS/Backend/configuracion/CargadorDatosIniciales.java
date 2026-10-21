package com.LenasLYS.Backend.configuracion;

import com.LenasLYS.Backend.modelo.Categoria;
import com.LenasLYS.Backend.modelo.Producto;
import com.LenasLYS.Backend.modelo.Promocion;
import com.LenasLYS.Backend.repositorio.CategoriaRepositorio;
import com.LenasLYS.Backend.repositorio.ProductoRepositorio;
import com.LenasLYS.Backend.repositorio.PromocionRepositorio;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CargadorDatosIniciales implements CommandLineRunner {

    private final CategoriaRepositorio categoriaRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final PromocionRepositorio promocionRepositorio;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            cargarCategoriasYProductos();
            cargarPromociones();
        } catch (Exception e) {
            log.error("Error al cargar datos iniciales del catálogo: {}", e.getMessage(), e);
        }
    }

    private void cargarCategoriasYProductos() throws Exception {
        if (categoriaRepositorio.count() > 0 && productoRepositorio.count() > 0) {
            log.info("Las categorías y productos ya se encuentran cargados en la base de datos.");
            return;
        }

        ClassPathResource recurso = new ClassPathResource("datos/catalog.json");
        if (!recurso.exists()) {
            log.warn("No se encontró el archivo datos/catalog.json para la carga inicial.");
            return;
        }

        try (InputStream is = recurso.getInputStream()) {
            JsonNode raiz = objectMapper.readTree(is);

            // 1. Cargar Categorías
            JsonNode nodoCategorias = raiz.path("categories");
            Map<String, Categoria> mapaCategorias = new HashMap<>();
            int ordenCat = 1;
            for (JsonNode nodoCat : nodoCategorias) {
                String id = nodoCat.path("id").asText();
                String nombre = nodoCat.path("nombre").isMissingNode() ? nodoCat.path("name").asText() : nodoCat.path("nombre").asText();
                String icono = nodoCat.path("icon").asText();

                Categoria categoria = Categoria.builder()
                        .id(id)
                        .nombre(nombre)
                        .icono(icono)
                        .orden(ordenCat++)
                        .activa(true)
                        .build();

                categoria = categoriaRepositorio.save(categoria);
                mapaCategorias.put(id, categoria);
            }
            log.info("Se cargaron {} categorías iniciales.", mapaCategorias.size());

            // 2. Cargar Productos
            JsonNode nodoProductos = raiz.path("products");
            List<Producto> listaProductos = new ArrayList<>();
            for (JsonNode nodoProd : nodoProductos) {
                String id = nodoProd.path("id").asText();
                String catId = nodoProd.path("category").asText();
                Categoria categoria = mapaCategorias.get(catId);
                if (categoria == null) {
                    categoria = categoriaRepositorio.findById(catId).orElse(null);
                }
                if (categoria == null) continue;

                String nombre = nodoProd.path("name").asText();
                String descripcion = nodoProd.path("description").asText();
                BigDecimal precio = BigDecimal.valueOf(nodoProd.path("price").asDouble());
                String tamano = nodoProd.path("size").asText("individual");
                int popular = nodoProd.path("popular").asInt(0);
                boolean esNuevo = nodoProd.path("isNew").asBoolean(false);
                boolean esPromo = nodoProd.path("promo").asBoolean(false);
                String imagen = nodoProd.path("image").asText();

                Producto producto = Producto.builder()
                        .id(id)
                        .categoria(categoria)
                        .nombre(nombre)
                        .descripcion(descripcion)
                        .precio(precio)
                        .tamano(tamano)
                        .popularidad(popular)
                        .esNuevo(esNuevo)
                        .esPromocion(esPromo)
                        .imagen(imagen)
                        .stock(100)
                        .activo(true)
                        .build();

                listaProductos.add(producto);
            }

            productoRepositorio.saveAll(listaProductos);
            log.info("Se cargaron {} productos iniciales.", listaProductos.size());
        }
    }

    private void cargarPromociones() {
        if (promocionRepositorio.count() > 0) {
            log.info("Las promociones ya se encuentran cargadas en la base de datos.");
            return;
        }

        List<Promocion> promociones = List.of(
            Promocion.builder()
                .id("promo-terror-familiar")
                .nombre("Combo Familiar del Terror")
                .descripcion("1 pollo a la brasa + papas grandes + ensalada familiar + 1 Coca-Cola de 1.5 L + salsas de la casa")
                .precio(new BigDecimal("64.90"))
                .precioOriginal(new BigDecimal("89.90"))
                .insignia("EDICIÓN HALLOWEEN")
                .iconoInsignia("pumpkin")
                .tonoInsignia("orange")
                .tamano("familiar")
                .filtros("combos,familiares")
                .imagen("/images/promotions/familiar.webp")
                .popularidad(3)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-parrilla-embrujada")
                .nombre("Combo Parrilla Embrujada")
                .descripcion("1/2 pollo a la brasa + anticuchos + chorizo + papas grandes + ensalada + salsas de la casa")
                .precio(new BigDecimal("49.90"))
                .precioOriginal(new BigDecimal("69.90"))
                .insignia("LA MÁS PEDIDA")
                .iconoInsignia("flame")
                .tonoInsignia("red")
                .tamano("compartir")
                .filtros("combos,familiares")
                .imagen("/images/promotions/parrilla.webp")
                .popularidad(2)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-terror-duo")
                .nombre("Terror Dúo")
                .descripcion("2 cuartos de pollo a la brasa + papas medianas + ensalada + 2 Coca-Cola personales + salsas de la casa")
                .precio(new BigDecimal("34.90"))
                .precioOriginal(new BigDecimal("52.90"))
                .insignia("SOLO POR TEMPORADA")
                .iconoInsignia("clock")
                .tonoInsignia("orange")
                .tamano("compartir")
                .filtros("combos")
                .imagen("/images/promotions/duo.webp")
                .popularidad(1)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-combos-08")
                .nombre("Doble Brasa de Medianoche")
                .descripcion("2 pollos a la brasa + 2 porciones de papas familiares + 2 ensaladas familiares + 2 gaseosas de 1.5 L")
                .precio(new BigDecimal("99.90"))
                .precioOriginal(new BigDecimal("129.90"))
                .insignia("SOLO POR TEMPORADA")
                .iconoInsignia("clock")
                .tonoInsignia("orange")
                .tamano("familiar")
                .filtros("combos,familiares")
                .imagen("/images/carta/products/combos-08.webp")
                .popularidad(8)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-combos-12")
                .nombre("Banquete de la Noche")
                .descripcion("1 pollo entero + 1 porción de anticuchos + 1 chorizo parrillero + papas grandes + ensalada")
                .precio(new BigDecimal("74.90"))
                .precioOriginal(new BigDecimal("94.90"))
                .insignia("LA MÁS PEDIDA")
                .iconoInsignia("flame")
                .tonoInsignia("red")
                .tamano("familiar")
                .filtros("combos,familiares")
                .imagen("/images/carta/products/combos-12.webp")
                .popularidad(7)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-combos-04")
                .nombre("Combo Brasa y Chaufa Encantado")
                .descripcion("1/4 de pollo a la brasa + porción generosa de arroz chaufa + papas fritas y cremas")
                .precio(new BigDecimal("22.90"))
                .precioOriginal(new BigDecimal("29.90"))
                .insignia("EDICIÓN HALLOWEEN")
                .iconoInsignia("pumpkin")
                .tonoInsignia("orange")
                .tamano("individual")
                .filtros("combos,individuales")
                .imagen("/images/carta/products/combos-04.webp")
                .popularidad(6)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-pollo-02")
                .nombre("Cuarto de Brasa del Terror")
                .descripcion("1/4 de pollo a la brasa con papas fritas, ensalada clásica y salsas peruanas")
                .precio(new BigDecimal("14.90"))
                .precioOriginal(new BigDecimal("18.90"))
                .insignia("SOLO POR TEMPORADA")
                .iconoInsignia("clock")
                .tonoInsignia("orange")
                .tamano("individual")
                .filtros("individuales")
                .imagen("/images/carta/products/pollo-02.webp")
                .popularidad(5)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-bebidas-02")
                .nombre("Inca Kola para Compartir 1.5 L")
                .descripcion("Gaseosa Inca Kola 1.5 L helada, el sabor de la peruanidad")
                .precio(new BigDecimal("8.90"))
                .precioOriginal(new BigDecimal("12.90"))
                .insignia("LA MÁS PEDIDA")
                .iconoInsignia("flame")
                .tonoInsignia("red")
                .tamano("compartir")
                .filtros("bebidas")
                .imagen("/images/carta/products/bebidas-02.webp")
                .popularidad(4)
                .activa(true)
                .build(),
            Promocion.builder()
                .id("promo-acompanamientos-11")
                .nombre("Salchipapas del Terror")
                .descripcion("Papas fritas crujientes con salchicha Frankfurt premium y variedad de cremas")
                .precio(new BigDecimal("21.90"))
                .precioOriginal(new BigDecimal("29.90"))
                .insignia("EDICIÓN HALLOWEEN")
                .iconoInsignia("pumpkin")
                .tonoInsignia("orange")
                .tamano("compartir")
                .filtros("acompanamientos")
                .imagen("/images/carta/products/acompanamientos-11.webp")
                .popularidad(3)
                .activa(true)
                .build()
        );

        promocionRepositorio.saveAll(promociones);
        log.info("Se cargaron {} promociones iniciales.", promociones.size());
    }
}
