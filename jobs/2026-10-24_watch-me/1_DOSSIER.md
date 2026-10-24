# DOSSIER - Watch Me (K/DA)

Knowledge to open: `knowledge/CASEBOOK.md`, `knowledge/craft/07_Ton_und_Musik.md`, `knowledge/craft/10_*`,
`knowledge/studies/mv_study_12_videos.md`. Done when every open marker in this file is filled.

toki's brief (verbatim in toki.md, 2026-10-24) restated - her core, not her example: ONE place, Raymi at its centre the
whole film; a 3-minute "TikTok": a new angle / scene every few seconds, built by camera transitions and things flying in
and away around her (the magazine cover is her example: push in, the cover assembles around her, 2-3 poses on the beat,
the pieces fly off, the camera turns to the next). Permanent self-staging: she flirts, poses, presents herself to the
camera = the viewer. Not one long dance: catwalk for the wides, poses, gestures - her motion supports the picture.
Unusual camera angles and moves. The bar is the finished picture, not green code (QC v2, 2026-10-24).

## 1. Facts
- Official upload: K/DA - Topic, https://www.youtube.com/watch?v=VOCEZQSO3t4 (official audio, found by the mashup
  session); toki's link vjehGOVmBQE is a fan lyric upload of the same song. Upload date / views: weiss ich nicht sicher
  (not looked up - no vidIQ credits spent for it).
- Credits: K/DA (Riot Games). Singers / writers: weiss ich nicht sicher - take them from the official description for
  upload.md (credits must be complete there).
- Length, tempo (measured, song_map.json): 182.5 s, 117.5 BPM, 102 hits, 9 stops. Key: not measured.
- Audio file in the job: song.webm (the official audio from the mashup job, 2.9 MB); vocal stem vocals.ogg.
- Rights: K/DA is NOT creator-safe (CLAUDE.md). Expected: a Content ID claim, revenue to Riot / the label, possibly
  blocked in some countries - reach, no income. toki 2026-10-24: "ansonsten los" -> accepted.

## 2. What the song says
Story in 5 sentences: The singer knows the cameras are on her and turns being watched into her stage. Everyone sees
the same picture of her ("the same mosaic"), so she flips it and shows the version she chooses. She dances circles
around everyone who tries to keep up, breaks hearts and makes the news while doing it. There is "only one way to know"
if you will like her: watch. It ends where it began - the command "watch me", now as a victory, not a request.

Official text: NOT in the job yet. lyrics_heard.txt is what the recogniser heard (stand-in, has errors). Before the
script step the official text goes into lyrics.txt (toki pastes it from the official description - I do not copy lyric
sites) and `python -m raymi lyrics <job>` re-aligns locally. Only short fragments are quoted here.

| # | line (fragment) | what it MEANS / subtext | weight (1-3) |
|---|---|---|---|
| 1 | "camera on, camera off" (8.1 s) | the premise: being watched is a switch she controls - the cold open | 3 |
| 2 | "the same mosaic ... flipped" | everybody sees the same picture of her; she rearranges it (the pieces that fly in) | 3 |
| 3 | "only one way to know" (pre-chorus, 27-32 s / 134-139 s) | the dare to the viewer: keep watching | 2 |
| 4 | "watch me move" (chorus, 32.2 / 83.5 / 143.1 s) | the hook and the title - the camera may never look away from her here | 3 |
| 5 | "run circles around these dudes" | literal camera move: an orbit around her | 2 |
| 6 | "breaking hearts, breaking news / loose" | two stagings: the heart-breaker and the headline | 3 |
| 7 | the brand / money lines (verse 2, 66-83 s) | flex: fashion, money - the fashion-shoot tableau | 2 |
| 8 | "watch me" alone (break 118-127 s, outro 177-182 s) | the bare command in the sparse break - the strongest single image | 3 |

Risky lines: verse 2 has brand names and a crude line (heard: "pants are droppin'") - keep brands off screen as logos
(no real brand marks, CLAUDE / canon), stage that line as an action gag, never literally.

## 3. What exists already (derive, never copy)
- Original: official audio only (K/DA - Topic). Per toki there is only a lyric visualizer for this song so far -> a
  real animated MV fills the gap. (Not verified on YouTube - weiss ich nicht sicher, toki's word.)
- K/DA's own MVs (mv_study_12_videos.md: MORE): every member has her own colour world, fast cuts, pop-idol posing - we
  take the self-presentation energy, not their look or characters.
- The gap: an animated MV where the CAMERA is the viewer and the whole film is one performer posing for it in one
  place that keeps rebuilding itself - nobody has that for this song.

## 4. Who loves this song and why
K/DA fans (League of Legends, K-pop, VTuber overlap), dance / edit TikTok culture - the song is made for "watch me"
edits and fancams. What they expect: confident posing, fashion, idol energy, fast cuts on the beat, a fancam feel.
Comment quotes: not collected (no vidIQ spent) - weiss ich nicht sicher.

## 5. Song map (MEASURED, never guessed)
song_map.json sections are coarse (part "A" everywhere); the edges below are its measured stops / energy turns and
the line times from the vocal stem (lyrics_timed.json: 296 of 317 words snapped to vocal onsets, 7 measured, 14
interpolated).

| time | section | energy | what happens in the music |
|---|---|---|---|
| 0.0-7.5 | intro | dance | vocal chops over the beat (sung 59 %); hard STOP 7.5-7.9 (31 dB deep) = the cold-open cut |
| 8.1-25.5 | verse 1 | dance | "camera on, camera off" at 8.13; stop 8.1-8.5 |
| 25.5-32.3 | pre-chorus | calm | quieter (-8.7 dB), "only one way to know"; stop 32.3-32.7 = the drop into the hook |
| 32.2-66.3 | chorus 1 | dance (high) | "watch me move" 32.19; 34 s long - needs 8-10 stagings |
| 66.3-83.4 | verse 2 | dance + stops | STOPS at 66.3, 69.5, 73.2, 73.8 = pose hits (magazine poses on the stops) |
| 83.4-117.6 | chorus 2 | dance (high) | stop 83.4-84.4 (11 dB) before it; "watch me" 83.55 |
| 117.6-127.7 | break | sparse (sung 43 %) | stop 117.6; "watch me" alone 118.5 - the single strongest image |
| 127.7-142.9 | bridge / pre-chorus 2 | calm | -6.3 dB, "only one way" again 134-139 |
| 142.9-177.3 | final chorus | dance (high) | "watch me move" 143.14 |
| 177.3-182.5 | outro | peak | "watch me" 179.3-181.1 - the end card |

Lyric line times: from the vocal stem (vocals.ogg, lyrics_timed.json). Voices: song_map "voices" labels every line
with a guessed singer name from an old table - ignore the names, the per-line split is still usable.

## 6. Where Raymi meets this song
1. 灯闇 lamp in the dark: "camera off" = the studio light dies and SHE is the light (her glowing dots) - the cold open.
2. Her glowing dots as camera flashes / LED bulbs around a mirror - the paparazzi tableau lights itself.
3. Flat ray shape: she is printed flat onto a magazine cover, a trading card, a billboard - then pops back into 3D.
4. The tail: a catwalk "train" for the wides; a whip of the tail = a whip-pan transition.
5. "Same mosaic, flipped": her picture assembles out of tiles (a mosaic of fan photos) and flips.
6. "Run circles": the camera orbits her while things (fish, pieces of set) circle her the other way.
7. "Breaking news": rain-prediction lore -> she is the weather-and-headlines anchor for 3 s (ticker as lyric object).
8. Salmon (best friend) as her one cameraman / paparazzo - the only other creature, a running gag (callback to MORE).
9. Sumi ink: the magazine print / the photocard ink drawn in her style.
10. Tako ears read as a style accessory in the fashion tableau (never as horns - light them from the front).
11. Burying in sand (lore): hiding from the camera -> the reveal on the hook ("watch me").
12. The viewer as the camera: she winks, points, blows a kiss into the lens; on "only one way to know" she leans toward it.

The ONE place: decided in 2_IDEAS (3 versions as image boards, toki picks), e.g. a photo studio cyclorama that
rebuilds itself, her own stage on the sea floor, a glass display case where she is the exhibit.

## 7. Short windows (12-20 s, start and end on phrase edges)
- A: 7.9 -> 25.5 (17.6 s): the stop, "camera on, camera off", verse 1 to the pre-chorus edge - the premise as the hook.
- B: 32.19 -> 49.3 (17.1 s): the first chorus "watch me move" to a line end - the dance / pose energy.
- C: 117.6 -> 134.2 (16.6 s): the stop, "watch me" alone, into the bridge - the strongest single image, loops on "watch".
The pick follows the script (which window holds the best stagings).
