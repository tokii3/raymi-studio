# 10_FX_boards3 - effects of the 9 key frames (idea boards round 3), Love is War

Written by fx-designer 2026-10-25. Scope: only these 9 mid-hit frames. Brief: "nahe, harte Bilder mitten im Treffer" +
"starke on beat / melodie effekte, einen umhauen, aber auch schoen". Rounds 1-2 failed: hit not visible, props thin/flat.
Rules for every frame: ONE big shape (>= 25 % of the frame area or >= 60 % of width/height), value contrast >= 70 points,
nothing thin (no line under 1.2 % of frame height), she stays the sharpest and palest thing, face never covered.
Frame counts at 30 fps (scale if the job differs). Face zone = centred ellipse 30 % w x 38 % h, a bit high.

Palette (from the looks, no new colours):
- Night sea (A): sky/sea #070914 to #12142b, her UV #9b5cff, lightning #e8f0ff, lamp #fff0cd, red rim #b3263a.
- Paper (B): paper #ece6da, ink #0b0a10, one red #d1223a, her UV #9b5cff only in her dots.
- Cables (C): abyss #05070d, cable #15161f, signal cyan #5ef2ff, her UV #9b5cff.

## Which frame shows the MELODY: B2 (62.6 s)
Measured (song_map melody.vocal, chorus 1): after the STOP a rising stair of sung notes: 62.75 midi 62, 63.1 = 66,
63.45 = 69, 63.9 = 71, 64.45 = 73, then falling 71, 69, 66 at 65.3-66.2. One clear rising run = one visible shape.
How: the ink explosion of B2 also WRITES the pitch. A thick ink brush line (the "melody stroke") enters from the left edge
at the hit and climbs in steps: each sung note adds a short bold stroke 5 % of frame height thick, ending in a round blob
head (10 % diameter) that pops on the note onset (+30 % scale for 3 frames, then settles). Height of a note:
y = 88 % - (midi - 59) x 2.6 % of frame height (midi 62 = 80 %, 66 = 70 %, 69 = 62 %, 71 = 57 %, 73 = 52 %); x advances
about 12 % of frame width per note. It runs behind her, outside the face zone, never across the face. After 73 it falls with
the notes. Colour ink #0b0a10, red #d1223a rim on the head blobs only. Test still: 63.5 s (4 steps visible) in addition to
the hit still at 62.6 s.
BUILD: melody_line 2D layer (reads melody.vocal notes from song_map.json, draws the stepped stroke + head blobs; reusable).
Ref: hsr-hope-feathers@104.25 (rising light shape carrying the line), ado-usseewa@63.25 (graphic shape bursting on the vocal).

## BUILD spec: the 2D ink slash layer (B1; reusable for cuts)
Screen-space overlay in Fx2D (new kind slash), drawn from a path, NOT a 3D plane (3D failed twice, read as a leaf).
- Shape: a tapered brush cut, not a leaf. Length 150 % of frame width, so it leaves the frame on both sides and no petal
  end is ever visible in the hold. Belly thickness 13 % of frame height at 35 % of the length, tapering to a sharp point
  (< 1 %) at the tail; the start is chopped, flat, slightly ragged (the brush landing).
- Angle: 14 degrees descending left to right (shallow reads as a cut and stays below her chin). Centre line at 70 % of frame
  height in the middle (62 % at the left edge, 78 % at the right), face zone (22-60 %) stays free.
- Edges: top edge clean and hard (1 px anti-alias). Lower edge dry-brush: 14-18 parallel bristle gaps, each 0.4-1 % of frame
  height, running along the stroke and ragged over the last 25 % of its length. Around it 35-50 splatter droplets 0.3-1.6 %
  of frame height thrown along the stroke direction, mostly below it, plus 3 long ink stringers 8 % long. Fill #0b0a10 solid,
  hard, no gradient, no transparency.
- Frames (hit = f0): f0-1 impact frame (picture inverted); f2-4 the stroke is drawn by a head travelling left to right,
  full length in 3 frames (ease-out: flies in, stops hard); f5 splatter appears in ONE frame (does not grow); f5-14 hold
  with 2 px shake on twos; f6-12 the RIP: the picture is cut along the centre line and the two halves slide apart
  perpendicular by 3 % of frame height (upper half up-left, lower half down-right), so the black stroke IS the gap, paper
  edges 0.5 % white slivers; f13-20 halves slide back (ease-out); the stroke cuts out with the shot.
- BUILD: slash Fx2D kind {from, to, angle, y, thickness, seed, rip}: procedural brush path (noise on the lower edge) + two
  clip-path copies of the rendered frame for the rip.
- Ref: ado-usseewa@98.25 (hard graphic shape slicing the frame), edgerunners-this-fffire@75.25 (cut-frame shape on the hit).

## A - Night sea + lighthouse

### A1 - 9.36 s, lightning hits as she surges out of the storm sea
- Effects: T01 (dots flare on the same frame), T08, lightning + 2D impact. Meaning: the sky answers the first note; she is not struck, she is why it strikes.
- Look: the bolt is not a thin line. Forked bolt 5-7 % of frame width at the trunk, from the top edge (x 62 %) down to the
  sea at her right (x 70 %, y 62 %): core #ffffff, hot edge #e8f0ff, outer glow 18 % wide #9b5cff at 40 %; 3 hard branches
  1.5-3 % wide, jagged (7-9 kinks, 6-10 % long each). Whole sky blown to #e8f0ff for f0-1, then a 4-frame fade with a violet
  afterimage. The lighthouse becomes a pure black cut-out against the flash (max contrast). She is rim-lit white from
  behind; spray 8-14 % of frame height thrown up around her; sea around her blown to white foam. Layers: bolt + flash 3D
  (lighthouse.tsx, thickened), 2D impact negative on f0 (1 frame), 2D speed radial white f1-12 (opacity 0.5) centred on
  her chest. Lasts: flash 2 frames, bolt 6, afterglow 10.
- BUILD: bolt_fat option (trunk width, branches, violet glow) and flash_silhouette on lighthouse.tsx; rain streaks go white in the flash.
- Ref: edgerunners-this-fffire@74.25 (flash + hard silhouette on the hit), hsr-hope-feathers@85.25 (bloom bursting around the figure).
- Test still: 9.36 s and 9.36 s + 3 frames, close shot at her chest height.

### A2 - 62.6 s, war cry into the lens, her ping ring bursts at the lens
- Effects: T03 (her shout made visible), T01. Meaning: the megaphone reinvented: the ring IS the shout and it leaves the picture through the lens.
- Look: ring seen head-on, starting at her mouth (y 58 %). Outer radius 70 % of frame height at the test frame, band 6 %
  thick (a thick band): #9b5cff core, #e8f0ff inner edge 1.2 %; second echo ring 45 % radius, 2 % thick, 40 % opacity. It
  runs behind her face, in front of the sea, never across the eyes. At the screen edge it breaks into 8-12 jagged glass
  shards (hard white triangles 8-15 % long) flying to the corners; 6-9 hard water drops (3-6 % diameter) sit on the lens,
  refracting. Background goes duo (#070914 to #9b5cff, 3 levels) for 8 frames so the ring pops. Wide-open mouth; lens
  push scale 1.0 to 1.12 in 4 frames. Lasts: ring expands 10 frames, shards 6, drops 24.
- BUILD: shout_ring (screen-space thick ring anchored to the mouth with shard burst at the frame edge; the NightSea floor rings are too thin/flat for this) and lens_drops if no lens-drop overlay exists.
- Ref: edgerunners-this-fffire@85.25 (scream with a hard shape thrown at the camera), ado-usseewa@63.25.
- Test still: 62.6 s + 5 frames, close on the face, mouth open.

### A3 - ~155 s, the lighthouse beam lands on the lens (the strongest frame)
- Effects: beam blaze + T01. Meaning: the light that never stopped looking at her finally finds her; it blinds the viewer, not her.
- Look: a hard white-gold wedge covering about 65 % of the frame area, opening from the lamp at x 80 %, y 40 %: core #ffffff,
  body #fff0cd, hard edge band 3 % in warm amber. The edge sweeps across the frame in 6 frames (the turn), stops hard on
  her. The lamp is a star: 8-point flare, spike length 40 % of frame width, spike thickness 1.5 % tapering, plus a 25 %
  bloom. She stands at the beam edge, rim-lit gold on one side and UV #9b5cff on the other (light only; her skin stays
  pale). Face outside the white core: beam core at x 55-95 %, face at x 35-50 %. 120 dust/rain points 0.4-1.2 % in the
  beam. Lens flare streak horizontal, 120 % of width, 0.8 % high. Layers: beam 3D (cone made hard and large) + flare/bloom
  2D + 2-frame white impact at f0. Lasts: sweep 6 frames, hold 24 with a +6 % pulse on the beat.
- BUILD: beam_blaze (wide, hard beam when it faces the lens; lighthouse.tsx only blazes the lamp), star_flare (8-point 2D star). The lamp must be in frame.
- Ref: hsr-hope-feathers@104.25 (gold-white light rim-lighting the figure), hsr-hope-feathers@112.75 (big bright bloom), csm-op@33.25 (hard white shape and silhouette).
- Test still: the frame the beam edge reaches her + 10 frames, close.

## B - Paper / ink world

### B1 - 9.36 s, ink slash rips the frame on the hit
- Effects: T09 as a blade, the 2D slash layer (spec above), 2D impact. Meaning: the war starts as a cut through the calm page; the picture itself is hurt.
- Look: slash spec exactly: #0b0a10 on #ece6da, belly 13 %, 150 % wide, 14 degrees, centre y 70 %, rip offset 3 % on f6-12, plus the impact negative on f0-1 (paper black, ink white). No red yet.
- Ref: ado-usseewa@98.25, edgerunners-this-fffire@75.25, csm-op@33.25 (hard black on white).
- Test still: f7 (rip open, slash drawn) and f2 (stroke head in flight) as a pair.

### B2 - 62.6 s, declaration, ink explodes, two-tone (the MELODY frame)
- Effects: T09 + 2D duo (#ece6da to #0b0a10, 2 levels) + the melody stroke (above) + T04 barb flick at 63.8. Meaning: the cry detonates as ink; the sung pitch becomes its shape.
- Look: one huge blot 55 % of frame height in diameter at her chest height: a black star with 18-24 spikes (10-45 % of height, pointed), a ring of 60+ droplets 0.4-2.5 %. Her dots glow #9b5cff; the blot has a clean paper-white hole of 36 % width around the face zone. f0 1-frame negative; f1-3 scale 0.4 to 1.0 (overshoot 1.1); f4-30 hold, droplets drift outward 0.2 % per frame. Everything except her UV dots and the red head blobs is ink or paper.
- BUILD: ink_burst_2d Fx2D (spiky blot with face hole) + melody_line; duo exists.
- Ref: ado-usseewa@63.25 (two-tone burst), csm-op@33.25, edgerunners-this-fffire@85.25 (scream with a black shape).
- Test still: 62.6 s + 3 frames (blot full) and 63.5 s (melody 4 steps).

### B3 - ~165 s, page black, her dots become stars
- Effects: T01 + T16 + T09 (the ink has won). Meaning: after the war only her light is left; her dots are the stars; quiet and beautiful.
- Look: #09080f page. Her UV dots rise off her body as 60-90 stars: 0.6-2.5 % of frame height, 6 large ones (4-5 %) with 4-point cross flares 14 % long, core #ffffff, halo #9b5cff. The large ones form a rising arc from her chest to the upper right (diagonal, 40 % of the frame). Soft UV rim light only on the top of her body (skin not washed out). Stars launch 1 per 2 frames over 20 frames, hold 40, twinkle +/-20 %. Black ink drops fall slowly (0.1 % per frame), invisible on black except where stars light them.
- BUILD: dots_to_stars (spawn from her dot positions, staggered rise, cross flare). Paper black + stars exists but its stars are static.
- Ref: hsr-hope-feathers@108.25 (particles rising from the figure, calm), hsr-hope-feathers@85.25.
- Test still: 12 frames after the launch starts (about 8 stars airborne, arc visible).

## C - Sea-floor cables (T02)

### C1 - 9.36 s, first pulse explodes along the cables
- Effects: T02 + T01. Meaning: the first sound is a signal; the floor lights from one point and she feels it first.
- Look: low wide-lens view from the floor, 3-5 cables as thick tubes 3.5-5 % of frame height at the near end, from the lower edge to a vanishing point. Cable #15161f; the pulse is a bright front 18 % of frame width long, #ffffff centre, #5ef2ff body, 6 % glow, sharp head and long tail, 40 m/s. At the node by her mark it explodes: a floor ring 30 % of frame diameter, 12-16 light shards (triangles 10-20 % long) shot upward, lifted dust in cyan. 2D speed radial cyan 8 frames. The rest #05070d. She is lit from below in cyan + UV. Lasts: pulse 8, explosion 6, residual glow 20 frames.
- BUILD: cable_burst (ring + shards + dust at pulse arrival); raise cable radius 0.11 m to 0.2 m and add cable_halo (wide soft halo).
- Ref: edgerunners-this-fffire@74.25 (hard bright burst in dark), hsr-hope-feathers@85.25.
- Test still: 9.36 s + 4 frames.

### C2 - 120.4 s, the current runs through her when she joins the cable
- Effects: T02 + T01 + 2D impact on f0. Meaning: she takes the signal into her body; she is the conductor of her own war.
- Look: she lies on a cable (close). The cyan-white front arrives from the right, runs through the cable and THROUGH her: rim light #5ef2ff 1.5 % thick around the whole body, 6-8 branching vein lines 0.8-1.2 % thick over the fins, dots flaring #9b5cff to white, 5-7 jagged arcs from cable to fins (12-25 % long, 1.2 % thick, white core). Face clean, eyes lit from below; skin stays pale (cyan only on rim and veins). f0 inverted flash 1 frame, then 4 frames chromatic split (R/B offset 1.2 %). Front passes in 6 frames, current stays 18, fades 12.
- BUILD: body_current (rim + veins + arcs; if the VRM cannot do an outline, a 2D mask layer from the alpha of her render: alpha edge as rim, blurred glow) and an arc generator.
- Ref: edgerunners-this-fffire@75.25 (hard electric light on the body), hsr-hope-feathers@112.75 (energy flowing on the figure).
- Test still: 120.4 s + 6 frames.

### C3 - ~165 s, the whole network lit, she at the centre
- Effects: T02 + T01. Meaning: she has connected the whole sea; the signal of the war is now a web of light.
- Look: high wide view, map-like: 7-9 cables 3-4 % thick converging on her mark, all #5ef2ff at cable_glow 1.0, an outward wave from her every 8 frames (beat); nodes along the lines as round discs 3-5 %; a soft UV ring #9b5cff, 2 % thick, 60 % of the frame width around her. Abyss #05070d so the lit web covers 20-30 % of the frame, symmetric and readable at phone size. She is the brightest, palest thing at the centre. Hold 40 frames, ring breathes +/-8 %.
- BUILD: cable_web (cables arranged radially from her mark, nodes, outward wave; existing cables are random and do not converge).
- Ref: hsr-hope-feathers@85.25 and @112.75 (radial light structure around the figure), edgerunners-this-fffire@85.25.
- Test still: 165 s, wide top-down.

## The 3 effect moments a viewer will remember
1. A3: the lighthouse beam landing on the lens (strongest, near the end): hard white-gold wedge, 8-point star, she at its edge.
2. B2: the ink detonation at the war cry with the sung pitch drawn as a climbing ink stroke (melody), two-tone paper/ink.
3. The 9.36 hit: the fat white bolt with the black lighthouse silhouette (A1) or the black slash that RIPS the picture in two (B1), whichever idea wins.

## BUILD list
1. slash Fx2D kind (procedural brush cut + rip) - ado-usseewa@98.25
2. melody_line 2D layer (stepped ink stroke from melody.vocal) - hsr-hope-feathers@104.25
3. ink_burst_2d (spiky blot with a face hole) - ado-usseewa@63.25
4. bolt_fat + flash_silhouette (lighthouse.tsx) - edgerunners-this-fffire@74.25
5. shout_ring (+ lens_drops) - edgerunners-this-fffire@85.25
6. beam_blaze + star_flare - hsr-hope-feathers@104.25
7. dots_to_stars - hsr-hope-feathers@108.25
8. cable_burst, thicker cables + cable_halo, cable_web - edgerunners-this-fffire@74.25 / hsr-hope-feathers@112.75
9. body_current (rim + veins + arcs) - edgerunners-this-fffire@75.25
Note: I did not view the reference stills; the seconds are the ones given in the task. Verify them on the first test stills.
