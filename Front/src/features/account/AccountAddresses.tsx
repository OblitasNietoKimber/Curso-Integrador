import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/Icon';
import { AccountDialog, AccountEmpty } from './AccountShared';
import { useAccount, updateAccount, type AccountAddress } from './accountStore';
const empty = (): AccountAddress => ({ id: crypto.randomUUID(), label: 'Casa', street: '', district: '', reference: '', primary: false });
export function AccountAddresses() {
  const account = useAccount();
  const [draft, setDraft] = useState<AccountAddress | null>(null);
  const [removing, setRemoving] = useState<AccountAddress | null>(null);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!draft) return;
    const item = { ...draft, street: draft.street.trim(), district: draft.district.trim(), label: draft.label.trim(), primary: draft.primary || !account.addresses.length };
    if (!item.street || !item.district || !item.label) return;
    updateAccount({ addresses: [...account.addresses.filter(a => a.id !== item.id).map(a => item.primary ? { ...a, primary: false } : a), item] }); setDraft(null);
  }
  return <>
    <div className="account-row-heading"><h2>Direcciones de entrega</h2><button className="info-button" onClick={() => setDraft(empty())}><Icon name="pin" />Agregar dirección</button></div>
    {!account.addresses.length ? <AccountEmpty title="Aún no tienes direcciones" description="Agrega una dirección para tenerla lista en tus próximos pedidos." /> : <div className="preview-addresses">{account.addresses.map(a => <article className="info-card preview-address" key={a.id}>
      <h3><Icon name="pin" />{a.label} {a.primary && <small>Predeterminada</small>}</h3><p>{a.street}</p><p>{a.district}</p>{a.reference && <p>{a.reference}</p>}
      <div className="account-dialog-actions"><button className="info-button" onClick={() => setDraft({ ...a })}>Editar</button><button className="info-button danger" onClick={() => setRemoving(a)}>Eliminar</button>{!a.primary && <button className="info-button" onClick={() => updateAccount({ addresses: account.addresses.map(item => ({ ...item, primary: item.id === a.id })) })}>Predeterminada</button>}</div>
    </article>)}</div>}
    {draft && <AccountDialog title={account.addresses.some(a => a.id === draft.id) ? 'Editar dirección' : 'Agregar dirección'} onClose={() => setDraft(null)}><form className="account-form" onSubmit={save}>
      <label>Nombre de la dirección<input required maxLength={40} value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Casa o trabajo" /></label>
      <label>Dirección<input required maxLength={160} value={draft.street} onChange={e => setDraft({ ...draft, street: e.target.value })} placeholder="Avenida, número y departamento" autoComplete="street-address" /></label>
      <label>Distrito<input required maxLength={80} value={draft.district} onChange={e => setDraft({ ...draft, district: e.target.value })} autoComplete="address-level2" /></label>
      <label>Referencia<textarea maxLength={200} value={draft.reference} onChange={e => setDraft({ ...draft, reference: e.target.value })} /></label>
      <label className="preview-checkbox"><input type="checkbox" checked={draft.primary} onChange={e => setDraft({ ...draft, primary: e.target.checked })} />Usar como predeterminada</label>
      <div className="account-dialog-actions"><button type="button" className="info-button" onClick={() => setDraft(null)}>Cancelar</button><button className="primary-button" type="submit">Guardar dirección</button></div>
    </form></AccountDialog>}
    {removing && <AccountDialog title="Eliminar dirección" onClose={() => setRemoving(null)}><p>¿Eliminar la dirección {removing.label}?</p><div className="account-dialog-actions"><button className="info-button" onClick={() => setRemoving(null)}>Cancelar</button><button className="primary-button" onClick={() => { const addresses = account.addresses.filter(a => a.id !== removing.id); if (removing.primary && addresses[0]) addresses[0] = { ...addresses[0], primary: true }; updateAccount({ addresses }); setRemoving(null); }}>Eliminar</button></div></AccountDialog>}
  </>;
}
