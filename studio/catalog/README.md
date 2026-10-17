# Component catalog - one still per studio component

Rendered in the cloud from `jobs/studio-catalog/shots.json` (stills.yml, `"to": "catalog"`), so every still shows the
component exactly as a video uses it. A new set / prop / lyric kind / transition gets a shot there and a still here.

| still | component (code) | what it is for |
|---|---|---|
| set_aquarium__lyrics_glass | `three/sets/Aquarium.tsx`, Words3D `glass` | the Star Exhibit tank + hall; words written on the glass |
| set_cardtable__lyrics_card | `three/sets/CardTable.tsx`, `three/cards.tsx`, Words3D `card` | the giant card table; words dealt as cards |
| set_weather__lyrics_ticker | `three/sets/Weather.tsx`, Words3D `ticker` | the TV weather studio; words on a ticker band |
| raymi_in_space__crown__lyrics_sign | `three/Puppet3D.tsx`, `three/props.tsx` BottleCap, Words3D `sign` | Raymi standing in the set (floor, shadows), the bottle-cap crown, words on a sign |
| lyrics_float | Words3D `float` | words rising like air bubbles |
| lyrics_stamp | Words3D `stamp` | the key word slammed in |
| raymi_glow__weather_flood | Puppet3D `glow`, Weather `flood` / `power` | her own light in the dark (灯闇), the studio flooded |
| transition_whip / bubbles / ink / pass / flash | `film/Transitions.tsx` | cuts through things, at full cover |
