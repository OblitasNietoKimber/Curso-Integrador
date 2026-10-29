package com.LenasLYS.Backend.caja;

import com.LenasLYS.Backend.modelo.Usuario;
import com.LenasLYS.Backend.repositorio.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("caja-local")
public class CajaCuentaLocal {
  @Bean
  ApplicationRunner cuentaCajaLocal(
      UsuarioRepositorio usuarios, RolRepositorio roles, PasswordEncoder encoder) {
    return args -> {
      String email = "caja.local@lys.test";
      if (usuarios.findByEmail(email).isPresent()) return;
      Usuario u = new Usuario();
      u.setNombre("Caja local");
      u.setEmail(email);
      u.setPasswordHash(encoder.encode("CajaLocal2026!"));
      u.setRolAsignado(roles.findByNombre("CAJA").orElseThrow());
      usuarios.save(u);
    };
  }
}
