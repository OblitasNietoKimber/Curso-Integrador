package com.LenasLYS.Backend.configuracion;

import com.LenasLYS.Backend.repositorio.UsuarioRepositorio;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.*;

@Configuration
public class ConfiguracionSeguridad {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  UserDetailsService usuariosAutenticables(UsuarioRepositorio repo) {
    return email -> {
      var u =
          repo.findByEmail(email.trim().toLowerCase(java.util.Locale.ROOT))
              .orElseThrow(() -> new UsernameNotFoundException("Credenciales incorrectas"));
      if (u.getPasswordHash() == null) throw new UsernameNotFoundException("La cuenta usa Google");
      return User.withUsername(u.getId().toString())
          .password(u.getPasswordHash())
          .roles(u.getRol().name())
          .disabled(!u.isActivo())
          .build();
    };
  }

  @Bean
  AuthenticationManager authenticationManager(UserDetailsService users, PasswordEncoder encoder) {
    var provider = new DaoAuthenticationProvider(users);
    provider.setPasswordEncoder(encoder);
    return new ProviderManager(provider);
  }

  @Bean
  SecurityContextRepository contextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  SecurityFilterChain cadenaDeSeguridad(
      HttpSecurity http,
      SecurityContextRepository repository,
      UsuarioRepositorio usuarios,
      org.springframework.beans.factory.ObjectProvider<GoogleOAuthConfiguracion> google)
      throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(Customizer.withDefaults())
        .securityContext(c -> c.securityContextRepository(repository))
        .formLogin(c -> c.disable())
        .httpBasic(c -> c.disable())
        .logout(c -> c.disable())
        .requestCache(c -> c.disable())
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/error",
                        "/api/auth/google",
                        "/oauth2/authorization/google",
                        "/login/oauth2/code/google",
                        "/api/auth/csrf",
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/productos/**",
                        "/api/categorias/**",
                        "/api/promociones/**")
                    .permitAll()
                    .requestMatchers("/api/carrito/**")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers("/api/**")
                    .authenticated()
                    .anyRequest()
                    .denyAll())
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint(
                        (req, res, ex) -> {
                          res.setStatus(401);
                          res.setContentType("application/json;charset=UTF-8");
                          res.getWriter().write("{\"message\":\"Inicia sesión para continuar.\"}");
                        })
                    .accessDeniedHandler(
                        (req, res, ex) -> {
                          res.setStatus(403);
                          res.setContentType("application/json;charset=UTF-8");
                          res.getWriter()
                              .write(
                                  "{\"message\":\"Solicitud no autorizada. Actualiza la página e"
                                      + " inténtalo de nuevo.\"}");
                        }))
        .addFilterBefore(new SesionVigenteFiltro(usuarios), AnonymousAuthenticationFilter.class)
        .addFilterBefore(
            new IntentosAutenticacionFiltro(),
            org.springframework.security.web.csrf.CsrfFilter.class);
    if (google.getIfAvailable() != null) google.getObject().configurar(http);
    return http.build();
  }
}
