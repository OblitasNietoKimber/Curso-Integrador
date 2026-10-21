package com.LenasLYS.Backend.repositorio;
import com.LenasLYS.Backend.modelo.Recuperacion;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface RecuperacionRepositorio extends JpaRepository<Recuperacion, UUID> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) Optional<Recuperacion> findByTokenHash(String hash);
 void deleteByUsuarioId(UUID usuarioId);
}
