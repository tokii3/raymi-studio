# Component catalog - one still per studio component

Rendered in the cloud from `jobs/studio-catalog/shots.json` and `jobs/studio-catalog-fire/shots.json` (the FIRESTARTER
build; stills.yml, `"to": "catalog"`), so every still shows the component exactly as a video uses it. A new set / prop / lyric kind / transition gets a shot there and a still here.

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
| deep_zones_giant_column_cliff / deep_current_bend / deep_tint_wave / deep_rise_column_school | `three/sets/Deep.tsx` | the abyss: four zones, the 7th giant vent, the cold current, the red wave, the cliff, the heat column |
| fire_palm_anchor / fire_strike_whip_sparks | `three/fire.tsx`, Film anchored fires, Puppet3D `WhipSmear` | a flame in her palm, a strike: whip smear + spark burst + ember |
| creatures_salmon_bucket_fish / creatures_sauna_extinguisher | `three/creatures.tsx` | glowing deep-sea fish, Salmon the fire fighter (bucket, extinguisher), the sauna |
| nightsea_pool_moon_cloud / nightsea_rain_path_fireworks / nightsea_split_waterline | `three/sets/NightSea.tsx`, grade `ember` | the sea at night lit from below, rain rings, fireworks from under the water, the split waterline |
| Firestarter VRM look + motion test | `three/VrmPuppet.tsx`, `three/vrmLipSync.ts`, `VrmClip.tsx`, grade `vrm_fire` | Raymi's VRM hair / skin / clothing materials, spring-bone motion, aligned lyric-to-vowel mouth shapes, and a keyed camera |
| lyrics_firework / lyrics_burn_crack | Words3D `firework`, `reveal: burn` | words written by fireworks in the sky; words burned into the floor by a crack |
| transition_rewind | `film/Transitions.tsx` | time running backwards |

## Status - what toki said about each part (`status.json`)
Every component has a status with her words and the date: **toki-liked** (she praised it), **approved** (in a video
she approved / uploaded), **open** (she named a fault - fix before reuse), **new** (she has not seen it). A new
package reuses toki-liked / approved parts FIRST (4_SCRIPT "Reuse first") and gives each one something new in that
video - never the last video's look again. After every verdict of hers, update status.json (a test keeps it valid).

| part | status (2026-10-19) |
|---|---|
| transitions, puppet animation, effects, camera, grade per act | toki-liked |
| aquarium, card table + story props, Short hook / CTA, guards | approved (critics' notes in status.json) |
| crown (worn hero) | open - the hero guard measures it |
| lyrics v2 + Raymi-Heavy | approved 2026-10-19 = the default (v1 superseded) |
| grades warm / clean, weather set, Firestarter VRM look / motion | new |

Grade library (the look step): `studio/src/film/grade.ts` - day, closing, night, own, warm, clean, ember, vrm_fire; shots.json `acts`
picks one per act. Lyrics v2 (the default): `studio/src/film/lyricLayout.ts` + Words3D style v2 (style frames:
`jobs/2026-10-19_lyrics-v2/boards`).
