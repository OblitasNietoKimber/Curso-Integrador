import { useState, type FormEvent } from 'react';
import { AuthField } from './AuthField';
import { apiRequest } from '../../services/api';
export function ResetPasswordCard({ onLogin }: { onLogin: () => void }) {
 const [pending,setPending]=useState(false); const [error,setError]=useState(''); const [done,setDone]=useState(false);
 const token=new URLSearchParams(location.search).get('token') || '';
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const values=new FormData(event.currentTarget);const password=String(values.get('password'));const confirmation=String(values.get('confirmation'));
  if(password!==confirmation){setError('Las contraseñas no coinciden.');return;}
  setPending(true);setError('');try{await apiRequest('/auth/reset-password',{method:'POST',body:JSON.stringify({token,password})});setDone(true);}catch(error){setError(error instanceof Error?error.message:'No se pudo restablecer la contraseña.');}finally{setPending(false);}
 }
 return <section className="sign-in-card compact-auth-card recovery-card" aria-labelledby="reset-title"><header className="auth-heading"><h2 id="reset-title">Nueva contraseña</h2><p className="auth-description">Elige una contraseña para tu cuenta.</p></header>{done?<><p className="auth-message success" role="status">Contraseña actualizada. Ya puedes iniciar sesión.</p><button className="primary-button" onClick={onLogin}>Iniciar sesión</button></>:!token?<p role="alert">Falta el enlace de recuperación. Solicita uno nuevo.</p>:<form onSubmit={submit}>
  <AuthField id="reset-password" name="password" label="Nueva contraseña" icon="lock" type="password" minLength={8} maxLength={72} required autoComplete="new-password" disabled={pending}/>
  <AuthField id="reset-confirmation" name="confirmation" label="Confirmar contraseña" icon="lock" type="password" minLength={8} maxLength={72} required autoComplete="new-password" disabled={pending}/>
  {error&&<p className="field-error" role="alert">{error}</p>}<button className="primary-button" disabled={pending}>{pending?'Guardando…':'Guardar contraseña'}</button></form>}</section>;
}
