package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.Recuperacion;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface RecuperacionRepositorio extends JpaRepository<Recuperacion, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<Recuperacion> findByTokenHash(String hash);

  void deleteByUsuarioId(UUID usuarioId);
}
