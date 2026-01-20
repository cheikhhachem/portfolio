import { writable } from 'svelte/store';

export type Corner = '' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const createNavigationStore = () => {
  const { subscribe, set } = writable<Corner>('');

  return {
    subscribe,
    open: (corner: Corner) => set(corner),
    close: () => set(''),
    toggle: (corner: Exclude<Corner, ''>) => {
      subscribe(current => {
        set(current === corner ? '' : corner);
        return () => {};
      })();
    }
  };
};

export const activeCorner = createNavigationStore();
