package com.LenasLYS.Backend.servicio;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** RFC 6238: SHA-1, seis dígitos y periodos de 30 segundos. */
public final class Totp {
  private Totp() {}

  public static String nuevaClave() {
    byte[] bytes = new byte[20];
    new SecureRandom().nextBytes(bytes);
    StringBuilder out = new StringBuilder();
    int buffer = 0, bits = 0;
    for (byte b : bytes) {
      buffer = (buffer << 8) | (b & 255);
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        out.append("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".charAt((buffer >> bits) & 31));
      }
    }
    return out.toString();
  }

  public static String codigo(String clave, long contador) {
    try {
      byte[] secret = new byte[clave.length() * 5 / 8];
      int buffer = 0, bits = 0, pos = 0;
      for (char c : clave.toCharArray()) {
        int value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);
        if (value < 0) throw new IllegalArgumentException("Base32 inválido");
        buffer = (buffer << 5) | value;
        bits += 5;
        if (bits >= 8) {
          bits -= 8;
          secret[pos++] = (byte) (buffer >> bits);
        }
      }
      Mac mac = Mac.getInstance("HmacSHA1");
      mac.init(new SecretKeySpec(secret, "HmacSHA1"));
      byte[] hash = mac.doFinal(ByteBuffer.allocate(8).putLong(contador).array());
      int o = hash[19] & 15;
      int value =
          ((hash[o] & 127) << 24)
              | ((hash[o + 1] & 255) << 16)
              | ((hash[o + 2] & 255) << 8)
              | (hash[o + 3] & 255);
      return String.format(java.util.Locale.ROOT, "%06d", value % 1000000);
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  public static long verificar(String secret, String code, long ultimo, long segundos) {
    if (code == null || !code.matches("[0-9]{6}")) return -1;
    long actual = segundos / 30;
    for (long i = actual - 1; i <= actual + 1; i++)
      if (i > ultimo
          && MessageDigest.isEqual(
              codigo(secret, i).getBytes(StandardCharsets.US_ASCII),
              code.getBytes(StandardCharsets.US_ASCII))) return i;
    return -1;
  }
}
