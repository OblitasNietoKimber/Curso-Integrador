package com.LenasLYS.Backend;

import static org.junit.jupiter.api.Assertions.*;

import java.sql.*;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

class MigracionClientesTest {
  @Test
  void migraDatosAnterioresSinPerderCuentaNiSeguridad() throws Exception {
    String url =
        "jdbc:h2:mem:migracion_" + UUID.randomUUID() + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1";
    try (var source = new com.zaxxer.hikari.HikariDataSource()) {
      source.setJdbcUrl(url);
      source.setUsername("sa");
      source.setPassword("");
      Flyway.configure().dataSource(source).target("3").load().migrate();
      UUID cliente = UUID.randomUUID(), admin = UUID.randomUUID();
      String perfil =
          "{\"profile\":{\"documentType\":\"CE\",\"document\":\"123456789\",\"photo\":\"data:image/png;base64,AA==\",\"birthday\":\"2000-01-02\",\"gender\":\"Otro\",\"notes\":\"Nota"
              + " anterior\"},\"addresses\":[{\"id\":\"casa\"}],\"cards\":[{\"last4\":\"1234\"}],\"preferredPayment\":\"cash\",\"preferences\":{\"email\":true},\"readNotifications\":[\"n1\"]}";
      try (Connection db = source.getConnection();
          PreparedStatement insert =
              db.prepareStatement(
                  "INSERT INTO"
                      + " usuarios(id,nombre,email,telefono,password_hash,rol,cuenta,creado,google_sub,totp_secret,totp_counter,totp_recovery,version_sesion)"
                      + " VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?,?,?)")) {
        insert.setObject(1, cliente);
        insert.setString(2, "Cliente anterior");
        insert.setString(3, "cliente@example.com");
        insert.setString(4, "+51987654321");
        insert.setString(5, "hash-cliente");
        insert.setString(6, "CLIENTE");
        insert.setString(7, perfil);
        insert.setString(8, "sub-google");
        insert.setString(9, "secreto-cifrado");
        insert.setLong(10, 123);
        insert.setString(11, "hash-recuperacion");
        insert.setLong(12, 7);
        insert.executeUpdate();
        insert.setObject(1, admin);
        insert.setString(2, "Administrador");
        insert.setString(3, "admin@example.com");
        insert.setString(4, "");
        insert.setString(5, "hash-admin");
        insert.setString(6, "ADMINISTRADOR");
        insert.setString(7, "{}");
        insert.setString(8, null);
        insert.setString(9, null);
        insert.setObject(10, null);
        insert.setString(11, null);
        insert.setLong(12, 0);
        insert.executeUpdate();
      }
      assertEquals(2, Flyway.configure().dataSource(source).load().migrate().migrationsExecuted);
      try (Connection db = source.getConnection();
          Statement sql = db.createStatement()) {
        try (ResultSet rows =
            sql.executeQuery(
                "SELECT"
                    + " c.*,u.password_hash,u.google_sub,u.totp_secret,u.totp_counter,u.totp_recovery,u.version_sesion,r.nombre"
                    + " AS rol_nombre FROM clientes c JOIN usuarios u ON c.id_usuario=u.id JOIN"
                    + " roles r ON u.id_rol=r.id_rol")) {
          assertTrue(rows.next());
          assertEquals(cliente, rows.getObject("id_usuario"));
          assertEquals("Cliente anterior", rows.getString("nombre"));
          assertEquals("+51987654321", rows.getString("telefono"));
          assertEquals("CE", rows.getString("tipo_documento"));
          assertEquals("123456789", rows.getString("documento"));
          assertEquals("2000-01-02", rows.getString("fecha_nacimiento"));
          assertEquals("Nota anterior", rows.getString("notas"));
          assertEquals("data:image/png;base64,AA==", rows.getString("foto"));
          assertEquals("hash-cliente", rows.getString("password_hash"));
          assertEquals("sub-google", rows.getString("google_sub"));
          assertEquals("secreto-cifrado", rows.getString("totp_secret"));
          assertEquals(123, rows.getLong("totp_counter"));
          assertEquals("hash-recuperacion", rows.getString("totp_recovery"));
          assertEquals(7, rows.getLong("version_sesion"));
          assertEquals("CLIENTE", rows.getString("rol_nombre"));
          assertTrue(rows.getString("cuenta").contains("addresses"));
          assertFalse(rows.getString("cuenta").contains("profile"));
          assertFalse(rows.next());
        }
        try (ResultSet rows =
            sql.executeQuery("SELECT id_rol FROM usuarios WHERE email='admin@example.com'")) {
          assertTrue(rows.next());
          assertEquals(2, rows.getInt(1));
        }
        assertThrows(
            SQLException.class,
            () ->
                sql.execute(
                    "INSERT INTO clientes (id,id_usuario,nombre) SELECT"
                        + " RANDOM_UUID(),id,'Duplicado' FROM usuarios WHERE"
                        + " email='cliente@example.com'"));
        sql.execute("DELETE FROM usuarios WHERE email='cliente@example.com'");
        try (ResultSet rows = sql.executeQuery("SELECT id_usuario FROM clientes")) {
          assertTrue(rows.next());
          assertNull(rows.getObject(1));
        }
        assertThrows(SQLException.class, () -> sql.execute("UPDATE usuarios SET id_rol=99"));
      }
      assertEquals(0, Flyway.configure().dataSource(source).load().migrate().migrationsExecuted);
    }
  }
}
