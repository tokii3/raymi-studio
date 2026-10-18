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

## Status - what toki said about each part (`status.json`)
Every component has a status with her words and the date: **toki-liked** (she praised it), **approved** (in a video
she approved / uploaded), **open** (she named a fault - fix before reuse), **new** (she has not seen it). A new
package reuses toki-liked / approved parts FIRST (4_SCRIPT "Reuse first") and gives each one something new in that
video - never the last video's look again. After every verdict of hers, update status.json (a test keeps it valid).

| part | status (2026-10-19) |
|---|---|
| transitions, puppet animation, effects, camera, grade per act | toki-liked |
| aquarium, card table + story props, Short hook / CTA, guards | approved (critics' notes in status.json) |
| crown (worn hero), lyrics v1 | open - her faults named, the hero guard / lyrics v2 answer them |
| lyrics v2 + Raymi-Heavy, grades warm / clean, weather set | new |

Grade library (the look step): `studio/src/film/grade.ts` - day, closing, night, own, warm, clean; shots.json `acts`
picks one per act. Lyrics v2: `studio/src/film/lyricLayout.ts` + Words3D style v2 (style frames:
`jobs/2026-10-19_lyrics-v2`, not rendered yet).
