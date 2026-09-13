import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const demo = require('../assets/product-parity-demo.js');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../assets/product-parity-demo.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../assets/product-parity-demo.css', import.meta.url), 'utf8');
const manifest = fs.readFileSync(new URL('../site.webmanifest', import.meta.url), 'utf8');
const active = `${html}\n${js}\n${manifest}`;

for (const exact of [
  'Morrow Table Group','Morrow House','Mara Quinn','Eli Mercer','Nico Vale','Sana Hart','Tariq Moss',
  'Can you check whether Friday dinner is ready and tell me what still needs me?',
  'Nico Vale break','16:30–17:00','Tariq Moss · Host','23:30–00:30',
  'Private Dining from 19:00–21:00','Awaiting manager confirmation','Confirm manager decision',
  'Sample review complete','Yberium Hub — fixed-sample state preview',
  'Interactive demo · fixed synthetic sample · no live staff data · no real business change',
  'Design preview · no live ChatGPT/Yberium tool call',
  'Design preview · no live Hub persistence claimed',
  'Discuss design-partner access'
]) assert.match(html, new RegExp(exact.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

assert.doesNotMatch(active, /Yberium Pulse|Pulse Control|Add rota|AI proposal|Request early access/i);
assert.doesNotMatch(js, /fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|supabase|method\s*:\s*['\"]POST['\"]/i);
assert.doesNotMatch(active, /Harbour House|Leo|Amira|Sofia|Ravi|Noah/i);
assert.match(css, /2px solid #27766F/i);
assert.match(css, /min-height:44px/i);
assert.match(css, /prefers-reduced-motion/);
assert.match(html, /assets\/yberium-pulse-fonts\.css/);
assert.match(html, /id="post-demo" hidden/);
assert.equal(JSON.parse(manifest).name, 'Yberium Interactive Demo');

const initial = demo.initialState();
assert.equal(initial.selectedOwner, 'Mara Quinn');
assert.equal(initial.confirmed, false);
assert.equal(initial.status, 'Awaiting manager confirmation');
const selectedEli = demo.selectOwner(initial, 'Eli Mercer');
assert.equal(selectedEli.confirmed, false, 'selection must not approve or execute');
assert.equal(selectedEli.status, 'Awaiting manager confirmation');
const confirmedEli = demo.confirmDecision(selectedEli);
assert.equal(confirmedEli.confirmed, true);
assert.equal(confirmedEli.selectedOwner, 'Eli Mercer');
const canonical = demo.confirmDecision(initial);
assert.equal(canonical.confirmed, true);
assert.equal(canonical.selectedOwner, 'Mara Quinn');
assert.equal(canonical.status, 'Sample review complete');
assert.throws(() => demo.selectOwner(initial, 'Leo'), /INVALID_SAMPLE_OWNER/);
assert.deepEqual(demo.VALID_OWNERS, ['Mara Quinn','Eli Mercer']);
assert.equal(demo.CANONICAL_OWNER, 'Mara Quinn');

console.log('PX-4 Demo V2 recovery contract checks passed.');

assert.match(html, /https:\/\/yberium\.com\/early-access\.html#pilot-form/);
assert.doesNotMatch(html, /yberium\.github\.io\/venuebrief-landing/i);
