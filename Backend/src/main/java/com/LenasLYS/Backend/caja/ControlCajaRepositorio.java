package com.LenasLYS.Backend.caja;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;

public interface ControlCajaRepositorio extends JpaRepository<ControlCaja, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select c from ControlCaja c where c.id=1")
  ControlCaja bloquear();
}
