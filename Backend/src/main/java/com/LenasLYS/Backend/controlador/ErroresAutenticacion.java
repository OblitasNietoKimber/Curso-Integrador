package com.LenasLYS.Backend.controlador;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.util.Map;
@RestControllerAdvice(assignableTypes={AutenticacionControlador.class,CuentaControlador.class})
public class ErroresAutenticacion {
 @ExceptionHandler(AuthenticationException.class) ResponseEntity<?> credenciales(){return ResponseEntity.status(401).body(Map.of("message","Correo o contraseña incorrectos."));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validacion(MethodArgumentNotValidException ex){return ResponseEntity.badRequest().body(Map.of("message","Revisa los datos ingresados.","fields",ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()).distinct().toList()));}
 @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<?> json(){return ResponseEntity.badRequest().body(Map.of("message","El contenido de la solicitud no es válido."));}
 @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> estado(ResponseStatusException ex){return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message",ex.getReason()==null?"No se pudo completar la solicitud.":ex.getReason()));}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> duplicado(){return ResponseEntity.status(409).body(Map.of("message","Ya existe una cuenta con ese correo."));}
}
