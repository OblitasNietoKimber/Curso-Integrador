import assert from 'node:assert/strict';
import test from 'node:test';
import { destinoTrasLogin } from '../src/services/destinoSesion.ts';

test('administración conserva sus accesos explícitos a Cocina y Caja', () => {
  for (const [requested, path] of [[null, '/'], ['admin', '/admin'], ['cocina', '/cocina'], ['caja', '/caja']])
    assert.equal(destinoTrasLogin({role: 'administrador'}, requested), path);
});

test('cada rol vuelve a su panel sin tomar permisos del destino solicitado', () => {
  for (const role of ['cliente', 'administrador', 'cocina', 'caja'])
    assert.equal(destinoTrasLogin({role}, null), '/');
  assert.equal(destinoTrasLogin({role: 'cocina'}, null), '/');
  assert.equal(destinoTrasLogin({role: 'caja'}, null), '/');
  assert.equal(destinoTrasLogin({role: 'cliente'}, 'admin'), '/');
  assert.equal(destinoTrasLogin({role: 'cocina'}, 'admin'), '/');
  assert.equal(destinoTrasLogin(null, 'cocina'), '/iniciar-sesion');
});
