// Set registry: name in shots.json -> built set component. Add a set = add a component here + its marks in sets.json
// + a still in studio/catalog/.
import React from 'react';
import {Aquarium} from './Aquarium';
import {CardTable} from './CardTable';
import {Weather} from './Weather';

export type SetProps = {f: number; fps: number; opts: Record<string, unknown>; hits: number[]; beats: number[];
  camPos?: [number, number, number]};   // the lens: a set keeps the cameraman's space clear (no crowd in front of it)

export const SETS: Record<string, React.FC<SetProps>> = {
  aquarium: Aquarium,
  cardtable: CardTable,
  weather: Weather,
};
