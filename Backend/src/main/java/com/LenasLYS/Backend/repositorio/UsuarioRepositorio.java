package com.LenasLYS.Backend.repositorio;
import com.LenasLYS.Backend.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UsuarioRepositorio extends JpaRepository<Usuario, UUID> {
 Optional<Usuario> findByEmail(String email);
 boolean existsByEmail(String email);
}
