package db.migration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.*;
import java.util.UUID;
import org.flywaydb.core.api.migration.*;

/** Conserva identidades y seguridad; traslada el perfil comercial a clientes. */
public class V4__roles_y_clientes extends BaseJavaMigration {
  @Override
  public void migrate(Context context) throws Exception {
    Connection db = context.getConnection();
    try (Statement sql = db.createStatement()) {
      sql.execute(
          "CREATE TABLE roles (id_rol INTEGER PRIMARY KEY, nombre VARCHAR(20) NOT NULL UNIQUE)");
      sql.execute(
          "INSERT INTO roles (id_rol,nombre) VALUES"
              + " (1,'CLIENTE'),(2,'ADMINISTRADOR'),(3,'CAJA'),(4,'COCINA'),(5,'DELIVERY')");
      sql.execute("ALTER TABLE usuarios ADD COLUMN id_rol INTEGER");
      sql.execute(
          "UPDATE usuarios SET id_rol = (SELECT id_rol FROM roles WHERE nombre = usuarios.rol)");
      sql.execute("ALTER TABLE usuarios ALTER COLUMN id_rol SET NOT NULL");
      sql.execute(
          "ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_fk FOREIGN KEY (id_rol) REFERENCES"
              + " roles(id_rol)");
      sql.execute(
          "CREATE TABLE clientes (id UUID PRIMARY KEY, id_usuario UUID UNIQUE REFERENCES"
              + " usuarios(id) ON DELETE SET NULL, nombre VARCHAR(120) NOT NULL, telefono"
              + " VARCHAR(25) NOT NULL DEFAULT '', foto TEXT, tipo_documento VARCHAR(20) NOT NULL"
              + " DEFAULT 'DNI', documento VARCHAR(20) NOT NULL DEFAULT '', fecha_nacimiento"
              + " VARCHAR(10) NOT NULL DEFAULT '', genero VARCHAR(40) NOT NULL DEFAULT '', notas"
              + " VARCHAR(500) NOT NULL DEFAULT '', cuenta TEXT NOT NULL DEFAULT '{}')");
    }
    ObjectMapper json = new ObjectMapper();
    try (Statement sql = db.createStatement();
        ResultSet rows =
            sql.executeQuery("SELECT id,nombre,telefono,cuenta FROM usuarios WHERE rol='CLIENTE'");
        PreparedStatement insert =
            db.prepareStatement(
                "INSERT INTO clientes"
                    + " (id,id_usuario,nombre,telefono,foto,tipo_documento,documento,fecha_nacimiento,genero,notas,cuenta)"
                    + " VALUES (?,?,?,?,?,?,?,?,?,?,?)")) {
      while (rows.next()) {
        var data = json.readTree(rows.getString("cuenta"));
        var p = data.path("profile");
        insert.setObject(1, UUID.randomUUID());
        insert.setObject(2, rows.getObject("id"));
        insert.setString(3, rows.getString("nombre"));
        insert.setString(4, rows.getString("telefono"));
        insert.setString(5, p.path("photo").isTextual() ? p.path("photo").asText() : null);
        insert.setString(6, p.path("documentType").asText("DNI"));
        insert.setString(7, p.path("document").asText(""));
        insert.setString(8, p.path("birthday").asText(""));
        insert.setString(9, p.path("gender").asText(""));
        insert.setString(10, p.path("notes").asText(""));
        ((com.fasterxml.jackson.databind.node.ObjectNode) data).remove("profile");
        insert.setString(11, json.writeValueAsString(data));
        insert.executeUpdate();
      }
    }
    try (Statement sql = db.createStatement()) {
      sql.execute("ALTER TABLE usuarios DROP COLUMN telefono");
      sql.execute("ALTER TABLE usuarios DROP COLUMN cuenta");
      sql.execute("ALTER TABLE usuarios DROP COLUMN rol");
    }
  }
}
