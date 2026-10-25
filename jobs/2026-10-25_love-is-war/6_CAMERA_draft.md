# CAMERA - Love is War (supercell / ryo, Mwk Remix), the whole film, from TREATMENT v3 (camera-director draft)

Contract = 0_BRIEF.md visible proof: C1 immersive (inside her space from 0-3 s, lens close, through things, no fixed
distance streak), C2 aggressive/raw (hard cuts, shake ONLY on the six blows, extreme angles, she attacks the lens),
C3 on beat (every measured hit changes the picture), C4 melody (camera makes room for the ink line / pillar), C5 five
peaks, strongest LAST (177.2), C6 composed stills. toki: "kamera soll nie still", "Raymi groesser im Bild", "sie spielt
mit der Kamera".
Refs: `python -m raymi refs find` does not run here (PATH Python 3.7, repo needs 3.9+). Ref ids come from the treatment's
frame-sheet readings and from knowledge/references/segments.json (read directly): kda-firestarter#004/#012/#020/#026/
#030/#031, kda-popstars#001/#011, kda-drum-go-dum#003/#010, kda-villain#010, kda-more#001; oners feist-1234,
okgo-this-too-shall-pass, billie-party-over for the ride. Pair with stills before the build (not done).

## Set coordinates (the contract for the script; metres, y up, fov = vertical degrees)
- **Convention** (as boards3): she faces +z, the lens is at +z of her looking -z unless a row says otherwise; the
  lighthouse and the cable sit BEHIND her. "Pitch" = degrees the lens looks up (+) or down (-). "d" = distance to her
  face / chest (or the named subject). Frame height at d = 2 d tan(fov/2).
- **Sea (nightsea)**: surface y = 0. She swims chest-deep: eyes y +0.55, chest ~+0.3, feet ~-0.87. She stands at S = (0, 0).
  Lens heights are absolute y. **Skirt rule is measured above her feet**: lens < 0.70 m above her feet (sea: y < -0.17)
  stays >= 2.6 m away when she stands; I also keep it for kneeling, treading and lifted poses. Each low row says "skirt ok".
- **Lighthouse (lighthouse.tsx opts)**: pos L = (-8, -30) (31 m from S, 15 deg left of the lens axis), height 12,
  yaw keyed (not a constant spin, see beam cue list), len 90. Rock around L (radius ~4, top ~y 2.0). R = the landing
  ledge at (-5.5, -27), y 2.0. Sea-facing normal n = (0.26, 0.97) (from L toward S); the ladder runs up the tower face
  at n. **Gallery floor y = 12.38** (12 + 0.38). BUILD REQUEST: the painted lantern room must be scaled to her (code
  size 1.1 m is smaller than she is): gallery radius 2.6, lantern radius 1.6, glass y 12.9-15.3, turning base top y 12.9,
  brass frame y 13.4, lamp / beam origin y 13.7 (code default H+0.6). Everything below uses these.
- **Deep (set deep)**: cable along z at x 0, y 0.1 from z -70 toward the lens. She glides TOWARD +z (toward the lens,
  cable converging behind her into -70) and rises: her eye y 0.75 at 1 s -> ~30 at 31.7. BUILD REQUEST: water 40 m deep,
  the painted surface ceiling at y 40 carrying the beam (needed for 3.0, 56.8-style looks and the map shots).
  Deep heights are above the cable/floor.
- **Shake (the only six)**: 9.36, 62.6, 87.05, 120.4, 146.33, 177.2, 3-5 frames. Every other hit gets a bump / snap /
  push / whip / flash with NO shake.
- **Camera is never still**: holds drift >= 4 cm/s or breathe on a wave (+-2 deg roll). Only 62.2-62.6 is locked on
  purpose (stillness is the statement, 0.4 s).

## Beam cue list (for the script: the lens flash = the beam crossing the lens)
Keyed yaw, not a constant spin. Crossings of S / lens: 3.0 (surface, far), 37.5 (lens flash), 44.3 (her face), 47.1
(lens flash), 49.4 (leaving), 59.03 (above, seen from below), 73.7+0.9 = 74.6 (both of us), 110.5 (her), 128.3 (inches
over her head), 146.33 (lens), 148.7+0.9 (lens, closer), 169.78 / 172.52 / 174.43 / 176.29 (lens-side offsets 16 / 8 /
3.5 / 0.9 m), 177.238 (stops on the lens, overshoot 1.5 deg, settles 177.5).

## Camera table
| # | time | music | lens (height m, distance m, fov) | angle | move (start -> end, on which beat) | what SHE does to the lens | ref id(s) | why this, here |
|---|---|---|---|---|---|---|---|---|
