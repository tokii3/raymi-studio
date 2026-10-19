# PRINCIPLES - what makes a Raymi video good (think with these, not with rule lists)

Distilled 2026-10-18 from the old engine's RULES.md (everything toki taught 2026-09-29 .. 10-17, weighted by how often
she had to say it), the 12-video study (`studies/mv_study_12_videos.md`) and the Star Guardian study. These are
principles, not proxies: a number that "passes" proves nothing (craft module 00 §1). A rule may be broken by a
stronger effect with a written reason; real faults (section C) never.

## A. The idea (decided in the writers' room, before any pixel)

1. **One world from the song, with a change and a payoff.** The song's meaning picks ONE world the whole video lives
   in (Renai = the desk, Let's Get Weird = the dark with two lights, POP IN 2 = a day with your acrylic-stand oshi).
   It changes from start to end and the end pays off what the start set up. Derived anew per song, never a reused look.
2. **A story of actions.** Who wants what, what she does, what goes wrong, the payoff. Test: mute it and do not read
   the lyrics - is it still understood? (Star Guardian: icons and actions replace every word.)
3. **Raymi is the reason.** The idea must only work because it is HER: her name (灯闇 = a lamp in the dark), her body
   (tail + tako ears, glowing dots, flat ray shape, burying in sand), her lore (Salmon, Sumi, the spoon, rain
   predictions), her voice. Anti-slop test: could any other VTuber do this video with the name changed? Then no.
4. **Fuse the song's medium with her ocean.** Take the genre's own convention (comic icons, lightsticks, a title card,
   game UI, a phone) and reinvent it in her world (speech bubbles -> real air bubbles; fans -> jellyfish whose
   tentacles are lightsticks). Every element gets this chain: meaning -> idea -> perfect version -> connections ->
   what exists -> reinvented in her world.
5. **Five planned wow moments** spread over the video, the strongest at the end. The ending is never weaker than the
   start (toki said this 5x).

## B. The picture (decided in the shooting script, checked in screening)

6. **The first second promises the world.** Start inside it with something happening; a calm intro is not a hook.
   Shorts: what a swiping viewer perceives in 0.5-1 s (her face big and readable, bright, one promise).
   MVs too (Know My Name 2026-10-10: found by search, but only 69 % still there after 3 s against a channel median of
   89 %, and 29 % average viewed. toki 2026-10-19: "der anfang muss stark und spannend sein und den zuschauer direkt
   fesseln"): no slow intro. A COLD OPEN shows the strongest picture of the video (or its question) in the first
   0-3 s and then cuts back. The thumbnail promises exactly that picture, so the click is paid off at once. The Short
   is a teaser that leaves the payoff to the MV.
7. **The camera goes everywhere** and travels in 3D: inside things, top-down, upside-down, macro, worm's eye, tiny in
   a wide. Shot size changes on every cut. A centred Raymi bust in front of a background never carries a moment.
   Stills with a 2D zoom cut every 2-3 s = slideshow (MORE v1), even if every still is pretty.
8. **Raymi acts in every shot she is in.** Holds, throws, hides, dashes, sulks, celebrates: squash and stretch, smears on fast
   moves, held key poses, reaction icons as her language. She is never FORCED into the frame (toki 2026-10-19: "raymi
   muss nicht immer ins bild forciert werden"): a shot of her world, of the main element, of a huge lyric, of what
   she sees or of what she caused can carry a moment on its own, and her absence makes her return land harder. The
   story stays hers (her action causes it, or her reaction follows it). Base rhythm: a wide action + a cut-in reaction close-up.
   She stands IN the place (on the floor, with a shadow), never a sticker in front of wallpaper.
9. **Frames are objects of the world** (porthole, CCTV, camcorder, polaroid, phone, TV) with a reason, never a generic
   box or circle around her again and again.
10. **One piece.** One style decision for the whole video, depth in every picture (foreground / subject / background,
    light, atmosphere), colour planned per section and unified inside it, shading coloured never grey, big colour
    masses calm and accents loud (Queencard: "grell, uebersaturiert"). 3D is stylised and matte next to her painting.
    Her skin stays pale grey-blue under any light.
11. **Type is part of the picture.** One family (her font; its heavy weight for lyrics); variety from size hierarchy
    (one key word huge, fillers small), one material or accent per key word, angle following the pose, colour from
    the scene's light - or the medium's own type (UI, chalkboard, neon, tape). Lyrics move with the voice word by word
    and BELONG to the picture: lit by the scene, a shadow in it, lying on a surface in perspective. They read at a
    glance on a phone - heavy and big, never thin or tiny (toki 2026-10-19: "oft zu klein, zu dünn oder wirken
    aufgesetzt"). A Japanese line always shows its romaji and English under it (toki 2026-10-19). Never one subtitle
    band slapped on top. Lyrics MAY fly over her, pass across her or hide her for a moment when the moment calls for big
    type (toki 2026-10-19: "auch wenn lyrics sie mal überdecken ist das nicht all zu schlimm ... solange raymi nicht
    dauerhaft abgeschnitten wird"). A fault is only text parked on her face or burying her for a whole line; never
    shrink or push the lyrics away just to keep her clear.
12. **The picture DOES what the line means** through her body and her world. Order, never reversed: line -> meaning
    -> picture -> asset / technique. Never pick an asset because it exists and invent the reason afterwards.
13. **Power, contrast, rhythm.** Off-centre, diagonal, too big for the frame; dense next to empty; a pause before the
    drop; holds next to 3-6-frame accents. Most loud beats change the picture (by a cut OR an event inside the shot).
    Cuts go through things and land one frame BEFORE the syllable. No strobe.
14. **One anchor returns and grows** (a set, an object). Repetition is a motif only with a change; a lazily reused
    effect is not.
15. **Places have love and make sense.** Lived-in details with reasons, nothing floats or stands where it cannot
    (a hut on land, not in the water). Never an empty stage.
16. **The main element reads.** Every video hangs on one to three things (an object she wears or holds, her face, a
    key word) - the treatment names them. Wherever they matter they are big enough and separated by value from what is
    behind them at phone size; scale them for the screen, not for realism (toki 2026-10-19: "fehler wie schlecht
    erkennbare krone müssen selber erkannt werden, das ist das main element"). The studio measures it; a written
    reason may keep one small on purpose.

## C. Real faults - always hard (code checks where possible)
- Brand font only (a missing glyph is an error); spoken text clean (no kaomoji / digits / symbols to TTS).
- No visible cut sprite edge; no broken sprite (extra tails, holes, green fringe) - only catalogued sprites.
- Text readable inside the frame and outside the Shorts UI bands; a comment question (CTA) readable >= 2.5 s before
  the end of a Short.
- Lyrics timed from the measured vocal, never from a bar grid or an unverified LRC offset.
- -14 LUFS, <= -1 dBTP; the video ends with the music (no silence, no end card).
- Only Raymi is AI-generated; places, props and creatures are built (identical between videos).
- Never call Raymi AI; upload texts in her voice; titles search-first; credits complete.

## D. How toki talks (read her like this)
- Her example is the INTENT, never the spec. Restate her core before building.
- Repeated feedback = the process failed: fix the step that let it through, not the instance.
- Never swing to the opposite extreme after a correction; compare with the last two liked videos.
- She watches finished videos herself: never show her anything below the bar, no routine frame reports.
- Principles, not hard rules (toki 2026-10-19): a number in the studio (a minimum size, a contrast) is the default of a
  principle; a shot may break it with a written reason. And the studio serves EVERY video: never copy the last
  package's look - reuse its proven parts and give them something new.
