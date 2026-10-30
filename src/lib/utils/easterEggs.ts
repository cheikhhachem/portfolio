import type { TranslationKey } from './translations';

// The trigger matcher and cheat sheet share this list so their codes stay in sync.
export const easterEggs = [
  { id: 'snake', code: '4265', face: true, label: 'snakeTitle' },
  { id: 'life', code: '3737', face: true, label: 'lifeTitle' },
  { id: 'cheats', code: '1854', face: true, label: 'cheatTitle' },
  { id: 'Swyniye', code: '212121', face: false, label: null },
  { id: 'Tox', code: '515151', face: false, label: null },
  { id: 'Ely', code: '414141', face: false, label: null },
  { id: 'ey9ani , A58ar mahu assfar (❤️)', code: '27243243', face: true, label: null }
] as const satisfies readonly { id: string; code: string; face: boolean; label: TranslationKey | null }[];

const maxCodeLength = Math.max(...easterEggs.map(egg => egg.code.length));

export function appendCube(history: string, number: number): string {
  return (history + number).slice(-maxCodeLength);
}

export type EasterEgg = typeof easterEggs[number]['id'];

export function matchEasterEgg(history: string, face: boolean): EasterEgg | null {
  return easterEggs.find(egg => egg.face === face && history.endsWith(egg.code))?.id ?? null;
}
