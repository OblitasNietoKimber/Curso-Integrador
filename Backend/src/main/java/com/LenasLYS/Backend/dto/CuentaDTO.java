package com.LenasLYS.Backend.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
public record CuentaDTO(@NotNull @Valid Perfil profile, @NotNull @Size(max=20) List<@Valid Direccion> addresses,
 @NotNull @Size(max=10) List<@Valid Tarjeta> cards, @NotNull @Pattern(regexp="|cash|yape|plin") String preferredPayment,
 @NotNull @Size(max=5) Map<@Pattern(regexp="email|orders|promotions|favorites|account") String, @NotNull Boolean> preferences,
 @NotNull @Size(max=200) List<@NotBlank @Size(max=100) String> readNotifications) {
 public record Perfil(@Size(max=500000) @Pattern(regexp="data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+") String photo,
  @NotBlank @Size(max=120) String name, @NotBlank @Email @Size(max=254) String email,
  @NotBlank @Pattern(regexp="(?:9[0-9]{8}|\\+[1-9][0-9]{6,14})") String phone,
  @NotNull @Pattern(regexp="DNI|CE|Pasaporte|RUC") String documentType,
  @NotNull @Size(max=20) String document, @NotNull @Pattern(regexp="|[0-9]{4}-[0-9]{2}-[0-9]{2}") String birthday,
  @NotNull @Size(max=40) String gender, @NotNull @Size(max=500) String notes) {}
 public record Direccion(@NotBlank @Size(max=100) String id, @NotBlank @Size(max=40) String label,
  @NotBlank @Size(max=160) String street, @NotBlank @Size(max=80) String district,
  @NotNull @Size(max=200) String reference, boolean primary) {}
 public record Tarjeta(@NotBlank @Size(max=100) String id, @NotNull @Pattern(regexp="Visa|Mastercard|Otra") String brand,
  @NotNull @Pattern(regexp="[0-9]{4}") String last4, @NotBlank @Size(max=100) String holder,
  @NotNull @Pattern(regexp="(0[1-9]|1[0-2])/[0-9]{2}") String expiry, boolean primary) {}
}
