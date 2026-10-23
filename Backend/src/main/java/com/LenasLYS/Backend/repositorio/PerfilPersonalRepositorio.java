package com.LenasLYS.Backend.repositorio;

import com.LenasLYS.Backend.modelo.PerfilPersonal;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PerfilPersonalRepositorio extends JpaRepository<PerfilPersonal, UUID> {}
