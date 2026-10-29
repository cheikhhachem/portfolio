import assert from 'node:assert/strict';
import test from 'node:test';
import { easterEggs, matchEasterEgg } from '../src/lib/utils/easterEggs.ts';

test('all cheat sheet codes unlock exactly the listed egg at the correct trigger', () => {
  assert.equal(new Set(easterEggs.map(egg => egg.code)).size, easterEggs.length);
  for (const egg of easterEggs) {
    assert.match(egg.code, /^[1-8]+$/);
    assert.equal(matchEasterEgg(egg.code, egg.face), egg.id);
    assert.equal(matchEasterEgg(egg.code, !egg.face), null);
    assert.equal(matchEasterEgg('88' + egg.code, egg.face), egg.id);
    assert.equal(matchEasterEgg(egg.code.slice(0, -1), egg.face), null);
  }
  assert.equal(matchEasterEgg('1854', true), 'cheats');
  assert.equal(matchEasterEgg('3737', true), 'life');
  assert.equal(matchEasterEgg('4265', true), 'snake');
  assert.equal(matchEasterEgg('18541', true), null);
});
