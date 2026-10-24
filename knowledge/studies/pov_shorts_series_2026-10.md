# POV Shorts week (2026-10-26 .. 11-01) - series dossier

toki 2026-10-23: "7 shorts ... raymi lore / persoenlichkeits orientiert so wie die frueheren shorts ... animations
technisch nicht so aufwaendig ... raymi muss im mittelpunkt stehen um neue follower an zu locken. raymi 3d soll mit der
kamera interagieren wenn moeglich, als waere sie direkt vor einem und die kamera repraesentiert den zuschauer. eine
starke hook und call to action sind essentiell ... leute an zu ziehen die aktiv sind und kommentieren ... bekannte sounds
/ bgm ... aktuelle trends / trend formate". Plan OK 2026-10-23: ideas 1-7, Kevin MacLeod beds.

## Her core, restated
New people find Raymi in the Shorts feed (67 % of traffic) and must meet HER in one second: her face, big, talking
TO them. The lens is the viewer: she addresses it, the viewer's "moves" are camera moves (sit down, step closer, tap,
open a door, get grabbed). Every Short ends on a question that is easy, fun and a little competitive to answer, so the
people who come are the ones who comment.

## What the channel data says (canon/10_kanal_puls_snapshot_2026-10-16.md)
- Lore Shorts bring the most subscribers per view (0.63 / 100); hook type personal_fact > callout > ranking.
- Strongest openings ever: "why is best friend salmon" (98 % after 3 s), "The Worst Singer..." (100 %): her, at once,
  with an absurd personal claim. Weak openings: a slow first picture ("I Rate Every Fish..." 61 %).
- Shorts <= 20 s are watched to a higher share (tendency, n=5 vs 21) -> every Short here is 15-19 s and loops.
- Comments are the scarce thing (4 in the last 7 days): the CTA must be a question with an obvious, low-effort,
  arguable answer (pick one, count, bet), not "what do you think?".
- One Short per day at a fixed time; several on one day compete.
- Lore that already works: the salmon best friend, rain predictions (counter 3 of 10), food opinions, competitiveness.

## Format decisions shared by all seven
- **Camera = you.** Eye height of a seated / standing person, a light handheld breath (shake ~0.15) so it feels like
  eyes, never a tripod. She looks into the lens whenever she talks to you; she looks away only to make your next
  move possible (red light / green light, the tunnel, the salmon).
- **Frame 0 = her face, big, mid-action.** No establishing shot. The hook is her first spoken line AND the hook stamp
  (<= 8 words, her font) - it reads with sound off.
- **A visual event every 2-3 s** (a cut, a camera move of "yours", an icon, a prop event) - fits the 15-19 s length.
- **3D Raymi on her real Mixamo clips** (memory: never a held pose for more than a beat), lip sync from her spoken
  words (raymi/voice_lines.py), expressions per beat.
- **Built places only** from the studio (train, weather studio, bedroom, aquarium, beach) - places viewers of the MVs
  recognise; new props are reusable studio parts.
- **Sound:** her fixed voice (edge-tts AnaNeural +17 % -7 Hz, line by line), a Kevin MacLeod bed (CC BY 4.0, well
  known from thousands of Shorts) ducked under her voice, synthesised SFX (assets/sfx, our own). Credit line in
  every description (assets/music/CREDITS.md).
- **CTA:** spoken + stamped, on screen >= 2.5 s before the end; the last picture loops into the first.
- **Trend formats used** (forms that live on Shorts, not a dying meme sound): POV storytime (1, 4), on-air
  presenter bit (2), red light / green light creep (3), "pause and pick" interactive (6), costume reveal (7, Halloween
  week), "count the taps" interactive (5).

## Schedule (one per day)
| day | job | why this day |
|---|---|---|
| Mon 10-26 | pov-seat | the broadest relatable opener (seat wars) |
| Tue 10-27 | pov-rain-eleven | bet "rain in Tokyo tomorrow" - resolved Wed 10-28 (pinned comment + counter) |
| Wed 10-28 | pov-ears | |
| Thu 10-29 | pov-sashimi | salmon lore after the rain payoff |
| Fri 10-30 | pov-rps | weekend interactive |
| Sat 10-31 | pov-costume | Halloween |
| Sun 11-01 | pov-glass | count-the-taps closes the week |
