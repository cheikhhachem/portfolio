import { derived, writable } from 'svelte/store';

export type Corner = '' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type Phase = 'idle' | 'turning' | 'opening' | 'open' | 'closing' | 'returning';
type NavigationState = { corner: Corner; panel: Corner; target: Corner; phase: Phase };

let current: NavigationState = { corner: '', panel: '', target: '', phase: 'idle' };
const state = writable(current);
export const navigation = { subscribe: state.subscribe };
export const visibleCorner = derived(state, value => value.panel);
const faceCorner = derived(state, value => value.corner);

function update(next: NavigationState) {
  current = next;
  state.set(next);
}

function advance() {
  if (current.phase === 'idle' && current.target) {
    update({ ...current, corner: current.target, phase: 'turning' });
  } else if (current.phase === 'open' && current.target !== current.corner) {
    update({ ...current, panel: '', phase: 'closing' });
  }
}

function request(target: Corner) {
  update({ ...current, target });
  advance();
}

export const activeCorner = {
  subscribe: faceCorner.subscribe,
  open: request,
  close: () => request(''),
  toggle: (corner: Exclude<Corner, ''>) => request(current.target === corner ? '' : corner),
  faceFinished: (corner: Corner) => {
    if (corner !== current.corner) return;
    if (current.phase === 'turning') {
      update(current.target === corner
        ? { ...current, panel: corner, phase: 'opening' }
        : { ...current, corner: '', phase: 'returning' });
    } else if (current.phase === 'returning') {
      update({ ...current, phase: 'idle' });
      advance();
    }
  },
  panelFinished: (corner: Corner) => {
    if (current.phase === 'opening' && current.panel === corner) {
      update({ ...current, phase: 'open' });
      advance();
    } else if (current.phase === 'closing' && current.corner === corner) {
      update({ ...current, corner: '', phase: 'returning' });
    }
  }
};
