package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Usuario;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<Usuario, UUID> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select u from Usuario u where u.id = :id")
  Optional<Usuario> bloquearPorId(@org.springframework.data.repository.query.Param("id") UUID id);

  Optional<Usuario> findByGoogleSub(String googleSub);

  Optional<Usuario> findByEmail(String email);

  boolean existsByEmail(String email);
}
