package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.RolSistema;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepositorio extends JpaRepository<RolSistema, Integer> {
  Optional<RolSistema> findByNombre(String nombre);
}
