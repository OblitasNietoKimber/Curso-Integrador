package com.LenasLYS.Backend.configuracion;

import com.LenasLYS.Backend.servicio.GoogleUsuarioServicio;
import jakarta.servlet.http.*;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

@Configuration
@ConditionalOnProperty(name = "app.auth.google-enabled", havingValue = "true")
@RequiredArgsConstructor
public class GoogleOAuthConfiguracion {
  private final GoogleUsuarioServicio usuarios;
  private final SecurityContextRepository contexts;

  @Value("${app.auth.google-client-id}")
  private String clientId;

  @Value("${app.auth.google-client-secret}")
  private String clientSecret;

  @Value("${app.auth.google-redirect-uri}")
  private String redirectUri;

  @Value("${app.auth.frontend-url}")
  private String frontend;

  @Bean
  ClientRegistrationRepository googleClients() {
    if (clientId.isBlank() || clientSecret.isBlank())
      throw new IllegalStateException(
          "Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET antes de activar Google.");
    validarUrl(frontend);
    validarUrl(redirectUri);
    var google =
        ClientRegistration.withRegistrationId("google")
            .clientId(clientId)
            .clientSecret(clientSecret)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri(redirectUri)
            .scope("openid", "email", "profile")
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
            .tokenUri("https://oauth2.googleapis.com/token")
            .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
            .issuerUri("https://accounts.google.com")
            .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
            .userNameAttributeName("sub")
            .clientName("Google")
            .build();
    return new InMemoryClientRegistrationRepository(google);
  }

  private void validarUrl(String value) {
    var uri = URI.create(value);
    if (!List.of("http", "https").contains(uri.getScheme())
        || uri.getHost() == null
        || uri.getRawQuery() != null
        || uri.getRawFragment() != null
        || uri.getUserInfo() != null)
      throw new IllegalStateException("La URL de Google o del frontend no es válida.");
  }

  public void configurar(HttpSecurity http) throws Exception {
    http.oauth2Login(
        oauth ->
            oauth
                .loginPage("/iniciar-sesion")
                .successHandler(accesoGoogle())
                .failureHandler((req, res, error) -> fallo(req, res, "cancelled_or_failed")));
  }

  public AuthenticationSuccessHandler accesoGoogle() {
    return (req, res, authentication) -> {
      try {
        if (!(authentication.getPrincipal() instanceof OidcUser identidad))
          throw GoogleUsuarioServicio.error("identity_invalid");
        var pending = req.getSession().getAttribute("googleLink");
        req.getSession().removeAttribute("googleLink");
        var link =
            pending
                    instanceof
                    com.LenasLYS.Backend.controlador.AutenticacionControlador.GoogleVinculacion v
                ? v
                : null;
        if (link != null && !link.vence().isAfter(java.time.Instant.now()))
          throw GoogleUsuarioServicio.error("identity_invalid");
        var u =
            usuarios.obtenerOCrear(
                identidad,
                link == null ? null : link.usuario(),
                link == null ? null : link.version());
        var session = req.getSession();
        session.setMaxInactiveInterval(1800);
        session.setAttribute("authVersion", u.getVersionSesion());
        var auth =
            UsernamePasswordAuthenticationToken.authenticated(
                u.getId().toString(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRol().name())));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context, req, res);
        new HttpSessionCsrfTokenRepository().saveToken(null, req, res);
        res.sendRedirect(frontend.replaceAll("/$", "") + "/mi-cuenta");
      } catch (OAuth2AuthenticationException ex) {
        String code = ex.getError().getErrorCode();
        fallo(
            req,
            res,
            List.of("account_exists", "account_disabled", "identity_invalid", "identity_mismatch")
                    .contains(code)
                ? code
                : "cancelled_or_failed");
      } catch (org.springframework.dao.DataIntegrityViolationException ex) {
        fallo(req, res, "account_exists");
      }
    };
  }

  private void fallo(HttpServletRequest req, HttpServletResponse res, String code)
      throws java.io.IOException {
    var session = req.getSession(false);
    if (session != null) session.invalidate();
    SecurityContextHolder.clearContext();
    res.sendRedirect(frontend.replaceAll("/$", "") + "/iniciar-sesion?google_error=" + code);
  }
}
