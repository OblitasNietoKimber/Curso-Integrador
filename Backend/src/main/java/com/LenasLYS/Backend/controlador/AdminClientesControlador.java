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
 private final com.LenasLYS.Backend.caja.PedidoCajaRepositorio pedidos;
 public AdminClientesControlador(ClienteRepositorio repo,com.LenasLYS.Backend.caja.PedidoCajaRepositorio pedidos){this.repo=repo;this.pedidos=pedidos;}
 public record Perfil(UUID id,String nombre,String email,String telefono,String tipoDocumento,String documento,String notas){}
 public record Cambio(String nombre,String telefono,String tipoDocumento,String documento,String notas){}
 private Perfil dto(Cliente c){return new Perfil(c.getId(),c.getNombre(),c.getUsuario()==null?"":c.getUsuario().getEmail(),c.getTelefono(),c.getTipoDocumento(),c.getDocumento(),c.getNotas());}
 @GetMapping @Transactional(readOnly=true) public List<Perfil> listar(){return repo.findAll().stream().map(this::dto).toList();}
 @GetMapping("/{id}/pedidos") @Transactional(readOnly=true) public java.util.List<com.LenasLYS.Backend.caja.PedidoCaja> historial(@PathVariable UUID id){if(!repo.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND);return pedidos.findByPerfilClienteId(id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional public Perfil crear(@RequestBody Cambio r){validar(r);var c=new Cliente();aplicar(c,r);return dto(repo.save(c));}
 private void validar(Cambio r){if(r.nombre()==null||r.nombre().isBlank()||r.nombre().length()>120||r.telefono()==null||r.telefono().length()>25||r.documento()==null||r.documento().length()>20||r.tipoDocumento()==null||!Set.of("DNI","CE","Pasaporte").contains(r.tipoDocumento())||r.notas()==null||r.notas().length()>500)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revisa los datos del cliente.");}
 private void aplicar(Cliente c,Cambio r){c.setNombre(r.nombre().trim());c.setTelefono(r.telefono());c.setTipoDocumento(r.tipoDocumento());c.setDocumento(r.documento());c.setNotas(r.notas());if(c.getUsuario()!=null)c.getUsuario().setNombre(c.getNombre());}
 @PutMapping("/{id}") @Transactional public Perfil editar(@PathVariable UUID id,@RequestBody Cambio r){
 validar(r);var c=repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));aplicar(c,r);return dto(repo.save(c));}
}
