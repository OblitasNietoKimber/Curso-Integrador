package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Usuario;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<Usuario, UUID> {
  Optional<Usuario> findByEmail(String email);

  boolean existsByEmail(String email);
}
