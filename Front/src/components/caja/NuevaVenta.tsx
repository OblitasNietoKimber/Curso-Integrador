import {CatalogoCaja} from './CatalogoCaja';
import {createCajaOrder,useOperations} from '../../services/operationsStore';
import '../../styles/caja-catalogo.css';
export function NuevaVenta({busy,notify,onComplete}:{busy:boolean;notify:(task:()=>void|Promise<void>)=>void;onComplete:()=>void}){
 const data=useOperations();
 return <section className="caja-catalogo-dialog" aria-label="Nueva venta del catálogo"><CatalogoCaja turnoAbierto={data.shifts.some(t=>!t.closed)} ocupado={busy} onGuardar={venta=>new Promise<boolean>(resolve=>{notify(async()=>{try{await createCajaOrder(venta);resolve(true);onComplete()}catch(error){resolve(false);throw error}})})}/></section>;
}
