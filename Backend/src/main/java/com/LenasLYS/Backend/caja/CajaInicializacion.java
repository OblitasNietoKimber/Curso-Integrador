package com.LenasLYS.Backend.caja;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;

@Configuration
public class CajaInicializacion {
  @Bean
  ApplicationRunner controlCaja(ControlCajaRepositorio control) {
    return args -> {
      if (!control.existsById(1L)) control.saveAndFlush(new ControlCaja());
    };
  }
}
