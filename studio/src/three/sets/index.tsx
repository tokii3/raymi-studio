// Set registry: name in shots.json -> built set component. Add a set = add a component here + its marks in sets.json
// + a still in studio/catalog/.
import React from 'react';
import {Aquarium} from './Aquarium';
import {Beach} from './Beach';
import {Bedroom} from './Bedroom';
import {CardTable} from './CardTable';
import {Corner} from './Corner';
import {Deep} from './Deep';
import {Dream} from './Dream';
import {Exhibit} from './Exhibit';
import {Globe} from './Globe';
import {NightSea} from './NightSea';
import {Office} from './Office';
import {Shoot} from './Shoot';
import {Train} from './Train';
import {Weather} from './Weather';

export type SetProps = {f: number; fps: number; opts: Record<string, unknown>; hits: number[]; beats: number[];
  camPos?: [number, number, number]};   // the lens: a set keeps the cameraman's space clear (no crowd in front of it)

export const SETS: Record<string, React.FC<SetProps>> = {
  aquarium: Aquarium,
  beach: Beach,
  bedroom: Bedroom,
  cardtable: CardTable,
  corner: Corner,
  deep: Deep,
  dream: Dream,
  exhibit: Exhibit,
  globe: Globe,
  nightsea: NightSea,
  office: Office,
  shoot: Shoot,
  train: Train,
  weather: Weather,
};
