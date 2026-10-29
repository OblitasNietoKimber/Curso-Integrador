package com.LenasLYS.Backend.controlador;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
@RestController
public class AdminImagenControlador {
 private final Path directory;
 public AdminImagenControlador(@Value("${app.imagenes.directorio:uploads/catalogo}") String path){directory=Path.of(path).toAbsolutePath().normalize();}
 @PostMapping("/api/admin/imagenes") public Map<String,String> subir(@RequestParam("archivo") MultipartFile archivo) throws IOException {
 if(archivo.isEmpty()||archivo.getSize()>5*1024*1024)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecciona una imagen de hasta 5 MB.");
 // Leer dimensiones antes de decodificar para limitar el uso de memoria.
 try(var input=ImageIO.createImageInputStream(archivo.getInputStream())){
 var readers=ImageIO.getImageReaders(input);if(!readers.hasNext())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Usa una imagen PNG o JPG válida.");var reader=readers.next();
 try{reader.setInput(input);String format=reader.getFormatName();if(!Set.of("png","jpeg","jpg").contains(format.toLowerCase(Locale.ROOT))||(long)reader.getWidth(0)*reader.getHeight(0)>16000000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Usa PNG o JPG de hasta 16 megapíxeles.");
 var image=reader.read(0);Files.createDirectories(directory);String name=UUID.randomUUID()+".png";ImageIO.write(image,"png",directory.resolve(name).toFile());return Map.of("url","/api/imagenes/"+name);
 }finally{reader.dispose();}}
 }
 @GetMapping("/api/imagenes/{name}") public ResponseEntity<Resource> leer(@PathVariable String name){
 if(!name.matches("[a-f0-9-]{36}\\.png"))throw new ResponseStatusException(HttpStatus.NOT_FOUND);
 var file=directory.resolve(name);if(!Files.isRegularFile(file))throw new ResponseStatusException(HttpStatus.NOT_FOUND);
 return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).header("X-Content-Type-Options","nosniff").cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(30))).body(new FileSystemResource(file));
 }
}
