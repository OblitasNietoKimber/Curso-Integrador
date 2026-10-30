package com.LenasLYS.Backend.controlador;
import com.LenasLYS.Backend.caja.*;
import com.LenasLYS.Backend.repositorio.ClienteRepositorio;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api/admin/pedidos")
public class AdminPedidosControlador {
 private final PedidoCajaRepositorio pedidos;private final ClienteRepositorio clientes;
 public AdminPedidosControlador(PedidoCajaRepositorio pedidos,ClienteRepositorio clientes){this.pedidos=pedidos;this.clientes=clientes;}
 public record Asociacion(UUID clienteId){}
 @PutMapping("/{id}/cliente") @Transactional public PedidoCaja asociar(@PathVariable String id,@RequestBody Asociacion r){
 var pedido=pedidos.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido inexistente."));
 pedido.setPerfilCliente(r.clienteId()==null?null:clientes.findById(r.clienteId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente inexistente.")));
 return pedidos.save(pedido);}
}
