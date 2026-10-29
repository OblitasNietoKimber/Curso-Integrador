package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.modelo.*;
import com.LenasLYS.Backend.repositorio.*;
import java.util.*;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api/admin/usuarios")
public class AdminUsuariosControlador {
 private final UsuarioRepositorio usuarios;private final RolRepositorio roles;private final PasswordEncoder encoder;
 public AdminUsuariosControlador(UsuarioRepositorio u,RolRepositorio r,PasswordEncoder e){usuarios=u;roles=r;encoder=e;}
 public record Vista(UUID id,String nombre,String email,String rol,boolean activo){}
 public record Cambio(String nombre,String email,String rol,boolean activo,String password){}
 private Vista dto(Usuario u){return new Vista(u.getId(),u.getNombre(),u.getEmail(),u.getRol().name(),u.isActivo());}
 @GetMapping public List<Vista> listar(){return usuarios.findAll().stream().map(this::dto).toList();}
 @PostMapping @Transactional @ResponseStatus(HttpStatus.CREATED) public Vista crear(@RequestBody Cambio r){
 validar(r);if(r.password()==null||r.password().length()<8||r.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La contraseña debe tener al menos 8 caracteres y ocupar hasta 72 bytes UTF-8.");
 if(usuarios.existsByEmail(r.email().trim().toLowerCase(Locale.ROOT)))throw new ResponseStatusException(HttpStatus.CONFLICT,"Ese correo ya está registrado.");
 var u=new Usuario();u.setPasswordHash(encoder.encode(r.password()));aplicar(u,r);return dto(usuarios.save(u));}
 @PutMapping("/{id}") @Transactional public Vista editar(@PathVariable UUID id,@RequestBody Cambio r,Principal principal){
 validar(r);var u=usuarios.bloquearPorId(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
 if(id.toString().equals(principal.getName())&&(!r.activo()||!r.rol().equals("ADMINISTRADOR")))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No puedes quitarte el acceso de administrador.");
 if(!u.getEmail().equalsIgnoreCase(r.email().trim()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El correo de acceso no se modifica desde este panel.");
 if(u.getRol()==Usuario.Rol.CLIENTE)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Gestiona este perfil en Clientes.");
 if(u.isActivo()!=r.activo()||!u.getRol().name().equals(r.rol()))u.setVersionSesion(u.getVersionSesion()+1);
 aplicar(u,r);return dto(usuarios.save(u));}
 private void validar(Cambio r){if(r.nombre()==null||r.nombre().isBlank()||r.nombre().length()>120||r.email()==null||r.email().length()>254||!r.email().matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")||r.rol()==null||!Set.of("ADMINISTRADOR","CAJA","COCINA","DELIVERY").contains(r.rol()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revisa nombre, correo y rol del personal.");}
 private void aplicar(Usuario u,Cambio r){u.setNombre(r.nombre().trim());u.setEmail(r.email().trim().toLowerCase(Locale.ROOT));u.setActivo(r.activo());u.setRolAsignado(roles.findByNombre(r.rol()).orElseThrow());}
}
