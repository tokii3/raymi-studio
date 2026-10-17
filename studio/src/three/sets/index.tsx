// Set registry: name in shots.json -> built set component. Add a set = add a component here + its marks in sets.json
// + a still in studio/catalog/.
import React from 'react';
import {Aquarium} from './Aquarium';

export type SetProps = {f: number; fps: number; opts: Record<string, unknown>; hits: number[]; beats: number[]};

export const SETS: Record<string, React.FC<SetProps>> = {
  aquarium: Aquarium,
};
