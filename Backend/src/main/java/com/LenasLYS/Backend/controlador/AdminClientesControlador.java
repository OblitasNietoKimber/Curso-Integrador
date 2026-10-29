package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.modelo.Cliente;
import com.LenasLYS.Backend.repositorio.ClienteRepositorio;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api/admin/clientes")
public class AdminClientesControlador {
 private final ClienteRepositorio repo;
 public AdminClientesControlador(ClienteRepositorio repo){this.repo=repo;}
 public record Perfil(UUID id,String nombre,String email,String telefono,String tipoDocumento,String documento,String notas){}
 public record Cambio(String nombre,String telefono,String tipoDocumento,String documento,String notas){}
 private Perfil dto(Cliente c){return new Perfil(c.getId(),c.getNombre(),c.getUsuario()==null?"":c.getUsuario().getEmail(),c.getTelefono(),c.getTipoDocumento(),c.getDocumento(),c.getNotas());}
 @GetMapping @Transactional(readOnly=true) public List<Perfil> listar(){return repo.findAll().stream().map(this::dto).toList();}
 @PutMapping("/{id}") @Transactional public Perfil editar(@PathVariable UUID id,@RequestBody Cambio r){
 if(r.nombre()==null||r.nombre().isBlank()||r.nombre().length()>120||r.telefono()==null||r.telefono().length()>25||r.documento()==null||r.documento().length()>20||r.tipoDocumento()==null||!Set.of("DNI","CE","Pasaporte").contains(r.tipoDocumento())||r.notas()==null||r.notas().length()>500)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revisa los datos del cliente.");
 var c=repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));c.setNombre(r.nombre().trim());c.setTelefono(r.telefono());c.setTipoDocumento(r.tipoDocumento());c.setDocumento(r.documento());c.setNotas(r.notas());if(c.getUsuario()!=null)c.getUsuario().setNombre(c.getNombre());return dto(repo.save(c));}
}
