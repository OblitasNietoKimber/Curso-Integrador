import {useEffect,useState} from 'react';
import {CashShiftPanel} from './CashShiftPanel';
import {useOperations} from '../../services/operationsStore';
type Mode='apertura'|'cierre';
export function CashRegisterPanel({notify,navigate,onModeChange}:{notify:(task:()=>void|Promise<void>)=>void;navigate:(path:string)=>void;onModeChange:(mode:Mode)=>void}){
 const data=useOperations();
 const [mode,setMode]=useState<Mode>(()=>location.pathname.endsWith('/apertura')?'apertura':location.pathname.endsWith('/cierre')?'cierre':data.shifts.some(s=>!s.closed)?'cierre':'apertura');
 useEffect(()=>{onModeChange(mode)},[mode,onModeChange]);
 return <><div className="ops-tabs caja-turno-tabs" role="tablist" aria-label="Operaciones del turno de caja">{(['apertura','cierre'] as const).map(m=><button key={m} id={'turno-tab-'+m} className={mode===m?'active':''} role="tab" aria-selected={mode===m} aria-controls="turno-panel" tabIndex={mode===m?0:-1} onClick={()=>setMode(m)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=mode==='apertura'?'cierre':'apertura';setMode(next);document.getElementById('turno-tab-'+next)?.focus()}}}>{m==='apertura'?'Apertura de caja':'Cierre de caja'}</button>)}</div><section id="turno-panel" role="tabpanel" aria-labelledby={'turno-tab-'+mode}><CashShiftPanel key={mode} closing={mode==='cierre'} notify={notify} navigate={navigate}/></section></>;
}
