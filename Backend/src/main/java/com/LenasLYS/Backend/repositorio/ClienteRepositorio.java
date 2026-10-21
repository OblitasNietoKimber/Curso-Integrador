package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Cliente;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepositorio extends JpaRepository<Cliente, UUID> {
  Optional<Cliente> findByUsuarioId(UUID usuarioId);
}
