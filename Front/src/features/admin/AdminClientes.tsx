import { useRef, useState } from 'react';
import { AdminEditor, type Field, type RecordData } from './AdminEditor';
import { apiRequest } from '../../services/api';
import { dinero, fecha, type Pedido } from '../../services/cajaApi';
import { Dialog, messageOf } from './AdminShared';
const fields:Field[]=[{key:'nombre',label:'Nombre',required:true,max:120},{key:'email',label:'Correo de cuenta',type:'email',readOnly:true},{key:'telefono',label:'Teléfono',max:25},{key:'tipoDocumento',label:'Tipo de documento',options:['DNI','CE','Pasaporte']},{key:'documento',label:'Documento',max:20},{key:'notas',label:'Notas',max:500}];
export function AdminClientes(){
 const request=useRef(0);
 const [selected,setSelected]=useState<RecordData>();const [orders,setOrders]=useState<Pedido[]>([]);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 async function history(row:RecordData){const current=++request.current;setSelected(row);setLoading(true);setError('');setOrders([]);try{const result=await apiRequest<Pedido[]>('/admin/clientes/'+encodeURIComponent(row.id)+'/pedidos');if(current===request.current)setOrders(result);}catch(e){if(current===request.current)setError(messageOf(e));}finally{if(current===request.current)setLoading(false);}}

 return <><AdminEditor title="Clientes" path="/admin/clientes" fields={fields} defaults={{id:'',nombre:'',email:'',telefono:'',tipoDocumento:'DNI',documento:'',notas:''}} readOnlyKeys={['email']} extraActions={row=><button onClick={()=>void history(row)}>Historial</button>}/>{selected&&<Dialog title={'Historial de '+selected.nombre} onClose={()=>{request.current++;setSelected(undefined);}}>{loading&&<p role="status">Cargando pedidos…</p>}{error&&<p role="alert">{error}</p>}{!loading&&!error&&!orders.length&&<p>No hay pedidos vinculados a este cliente.</p>}{orders.map(p=><div className="admin-recent" key={p.id}><span>#{p.id} · {p.creado?fecha(p.creado):'—'}</span><span>{p.canal}</span><strong>{dinero(p.total)}</strong><span>{p.pagado?'Pagado':'Pendiente'}</span></div>)}</Dialog>}</>;
}
