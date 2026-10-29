package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.modelo.Promocion;
import com.LenasLYS.Backend.repositorio.PromocionRepositorio;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
@RestController
@RequestMapping("/api/admin/promociones")
public class AdminPromocionControlador {
 private final PromocionRepositorio repo;
 public AdminPromocionControlador(PromocionRepositorio repo){this.repo=repo;}
 @GetMapping public List<Promocion> listar(){return repo.findAll();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
 public Promocion crear(@RequestBody Promocion p){p.setId(UUID.randomUUID().toString());return guardar(p);}
 @PutMapping("/{id}") @Transactional public Promocion editar(@PathVariable String id,@RequestBody Promocion p){if(!repo.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Promoción inexistente");p.setId(id);return guardar(p);}
 private Promocion guardar(Promocion p){
 if(p.getNombre()==null||p.getNombre().isBlank()||p.getNombre().length()>150||p.getPrecio()==null||p.getPrecio().signum()<=0||p.getActiva()==null||p.getPrecioOriginal()!=null&&p.getPrecioOriginal().compareTo(p.getPrecio())<0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revisa el nombre, precio y precio original.");
 if(p.getImagen()!=null&&(p.getImagen().length()>255||!p.getImagen().isBlank()&&!p.getImagen().startsWith("/images/")&&!p.getImagen().startsWith("https://")&&!p.getImagen().startsWith("/api/imagenes/")))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Usa una ruta /images/ o URL HTTPS.");
 if(p.getPrecio().scale()>2||p.getPrecio().precision()-p.getPrecio().scale()>8||p.getPrecioOriginal()!=null&&(p.getPrecioOriginal().scale()>2||p.getPrecioOriginal().precision()-p.getPrecioOriginal().scale()>8)||p.getDescripcion()!=null&&p.getDescripcion().length()>500||p.getFiltros()!=null&&p.getFiltros().length()>200||p.getInsignia()!=null&&p.getInsignia().length()>50||p.getIconoInsignia()!=null&&p.getIconoInsignia().length()>50||p.getTonoInsignia()!=null&&p.getTonoInsignia().length()>50||p.getTamano()!=null&&p.getTamano().length()>50)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Los valores exceden los límites permitidos.");
 p.setNombre(p.getNombre().trim());return repo.save(p);}
}
