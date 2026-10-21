package com.LenasLYS.Backend.dto;

import jakarta.validation.constraints.*;

public final class AutenticacionDTO {
  private AutenticacionDTO() {}

  public record Registro(
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Email @Size(max = 254) String email,
      @NotBlank @Pattern(regexp = "\\+[1-9][0-9]{6,14}") String phone,
      @NotBlank @Size(min = 8, max = 72) String password,
      @AssertTrue boolean termsAccepted) {}

  public record Login(
      @NotBlank @Email @Size(max = 254) String email,
      @NotBlank @Size(max = 72) String password,
      boolean remember) {}

  public record Correo(@NotBlank @Email @Size(max = 254) String email) {}

  public record Restablecer(
      @NotBlank @Size(max = 100) String token,
      @NotBlank @Size(min = 8, max = 72) String password) {}

  public record CambiarClave(
      @NotBlank @Size(max = 72) String previous, @NotBlank @Size(min = 8, max = 72) String next) {}

  public record Sesion(String id, String name, String email, String phone, String role) {}
}
