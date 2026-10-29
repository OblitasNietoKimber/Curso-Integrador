import { useCallback, useEffect, useState } from 'react';
export { Icon } from '../../components/caja/OperationsVisuals';
export { Panel, Stats, Badge, Empty, LineChart, Bars, Donut } from '../../components/caja/OperationsUI';
export { OperationsDialog as Dialog } from '../../components/caja/OperationsDialog';
export { OperationsTable as Table } from '../../components/caja/OperationsTable';
export { money } from '../../services/operationsStore';
export { downloadExcel } from '../../services/operationsFiles';
export const messageOf=(e:unknown)=>e instanceof Error?e.message:'No se pudo completar la operación.';
export function useResource<T>(loader:()=>Promise<T>){
 const [data,setData]=useState<T>(); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
 const reload=useCallback(async()=>{setLoading(true);setError('');try{const value=await loader();setData(value);return value;}catch(e){setError(messageOf(e));throw e;}finally{setLoading(false);}},[loader]);
 useEffect(()=>{void reload().catch(()=>{});},[reload]); return {data,error,loading,reload};
}
export function ResourceState({loading,error,retry}:{loading:boolean;error:string;retry:()=>unknown}){return <>{loading&&<p role="status">Cargando datos…</p>}{error&&<div role="alert"><p>{error}</p><button onClick={()=>{void Promise.resolve(retry()).catch(()=>{});}}>Reintentar</button></div>}</>;}
export function Pagination({count,page,onPage,size=10}:{count:number;page:number;onPage:(page:number)=>void;size?:number}){const max=Math.max(1,Math.ceil(count/size));return <div className="ops-pagination"><span>{count?((page-1)*size+1):0}–{Math.min(page*size,count)} de {count} registros</span><button disabled={page<=1} onClick={()=>onPage(page-1)}>Anterior</button><span aria-current="page">{page} / {max}</span><button disabled={page>=max} onClick={()=>onPage(page+1)}>Siguiente</button></div>;}
export const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
