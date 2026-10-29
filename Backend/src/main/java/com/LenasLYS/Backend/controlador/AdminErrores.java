package com.LenasLYS.Backend.controlador;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice(assignableTypes={AdminPedidosControlador.class,AdminPromocionControlador.class,AdminClientesControlador.class,AdminUsuariosControlador.class,AdminConfiguracionControlador.class,AdminImagenControlador.class,AdminProductoControlador.class})
public class AdminErrores {
 @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<?> estado(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"No se pudo completar la operación.":e.getReason()));}
 @ExceptionHandler(DataIntegrityViolationException.class) public ResponseEntity<?> conflicto(){return ResponseEntity.status(409).body(Map.of("message","El registro está duplicado o contiene un valor fuera de rango."));}
 @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class) public ResponseEntity<?> json(){return ResponseEntity.badRequest().body(Map.of("message","Revisa el formato de los datos enviados."));}
}
