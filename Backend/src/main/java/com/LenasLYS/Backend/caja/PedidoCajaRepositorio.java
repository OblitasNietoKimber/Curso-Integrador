package com.LenasLYS.Backend.caja;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoCajaRepositorio extends JpaRepository<PedidoCaja, String> {
  java.util.List<PedidoCaja> findByPerfilClienteId(java.util.UUID id);}
