package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.modelo.ConfiguracionNegocio;
import com.LenasLYS.Backend.repositorio.ConfiguracionNegocioRepositorio;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api/admin/configuracion")
public class AdminConfiguracionControlador {
 private final ConfiguracionNegocioRepositorio repo;
 public AdminConfiguracionControlador(ConfiguracionNegocioRepositorio repo){this.repo=repo;}
 @GetMapping public ConfiguracionNegocio obtener(){return repo.findById(1).orElseGet(ConfiguracionNegocio::new);}
 @PutMapping public ConfiguracionNegocio guardar(@RequestBody ConfiguracionNegocio r){
 if(r.getNombre()==null||r.getNombre().isBlank()||r.getNombre().length()>120||r.getDireccion()==null||r.getDireccion().length()>255||r.getTelefono()==null||r.getTelefono().length()>25||r.getEmail()==null||r.getEmail().length()>254||!r.getEmail().contains("@")||r.getRuc()==null||!r.getRuc().matches("([0-9]{11})?")||r.getHorario()==null||r.getHorario().length()>100)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revisa los datos del negocio y el RUC (11 dígitos).");
 r.setId(1);return repo.save(r);}
}
