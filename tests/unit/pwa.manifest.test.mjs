// Testes da PWA (etapa 8): manifest completo, ícones reais e regras do service worker.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('manifest.webmanifest: campos essenciais preenchidos (RF09/CA-06)', () => {
  const caminho = path.join(raiz, 'src', 'frontend', 'pwa', 'manifest.webmanifest');
  const m = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  assert.equal(m.name, 'CEPK Eventos');
  assert.equal(m.short_name, 'CEPK');
  assert.equal(m.start_url, '/');
  assert.equal(m.scope, '/');
  assert.equal(m.display, 'standalone');
  assert.equal(m.lang, 'pt-BR');
});

test('manifest declara ícones 192, 512 e maskable', () => {
  const caminho = path.join(raiz, 'src', 'frontend', 'pwa', 'manifest.webmanifest');
  const m = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  const tamanhos = m.icons.map((i) => i.sizes);
  assert.ok(tamanhos.includes('192x192'), 'falta ícone 192');
  assert.ok(tamanhos.includes('512x512'), 'falta ícone 512');
  assert.ok(m.icons.some((i) => (i.purpose || '').includes('maskable')), 'falta maskable');
});

test('arquivos de ícone existem e são PNG de verdade (cabeçalho assinado)', () => {
  for (const nome of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
    const bytes = fs.readFileSync(path.join(raiz, 'src', 'frontend', 'pwa', 'icons', nome));
    assert.equal(bytes[0], 0x89, `${nome}: primeiro byte PNG`);
    assert.equal(String.fromCharCode(bytes[1], bytes[2], bytes[3]), 'PNG', `${nome}: assinatura PNG`);
    assert.ok(bytes.length > 1000, `${nome}: muito pequeno para ser válido`);
  }
});

test('service worker: nunca cacheia /api e nunca intercepta escrita (RN08/RNF07)', () => {
  const sw = fs.readFileSync(path.join(raiz, 'src', 'frontend', 'pwa', 'service-worker.js'), 'utf8');
  assert.match(sw, /startsWith\('\/api\/'\)/, 'regra de bloqueio /api/ ausente');
  assert.match(sw, /method !== 'GET'/, 'bloqueio de métodos de escrita ausente');
  assert.doesNotMatch(sw, /senha|password|token|Authorization/i, 'palavra suspeita no SW');
});
