# DOSSIER - FIRESTARTER (K/DA)

Knowledge to open: `knowledge/CASEBOOK.md`, `knowledge/craft/07_Ton_und_Musik.md`, `knowledge/craft/10_*`,
`knowledge/studies/mv_study_12_videos.md`. Done when every open marker in this file is filled.
Researched 2026-10-19, release day of the song (session: Firestarter package, fast track - toki 2026-10-19 "schnelle
Spur": rule update, dossier, idea boards). Sources at the end.

## 0. toki's brief (her words, 2026-10-19) and its core
"es ist wichtig, dass das video eine hohe qualität hat, dynamisch ist, und vor allem bereits am anfang stark
anfängt. das letzte paket zu riot songs war stark und hat viel traffic über suche ergeben, konnte die zuschauer aber
via thumbnail und am anfang des videos nicht catchen ... das short muss lust aufs video machen. die visuals sollen
clean und professionell wirken." + Raymi is never forced into the frame; lyrics may fly over her.
**Core (restated):** search will bring people (release day, empty fan-animation space) - the job of THIS package is
to keep them: a thumbnail that promises one strong picture, the first 3 s paying it off, a Short that is a teaser
for the MV (not a standalone ending), and a clean, professional look (calm colour masses, few loud accents).
Evidence (canon/10, 2026-10-16): Know My Name MV - 38.7 % of views from search, but only 69 % still watching after
3 s (channel median 89 %) and 29 % average viewed; its Short 2,795 views, 53.6 % search.

## 1. Facts
- Official upload: https://www.youtube.com/watch?v=Mmw-PpWhKFg - channel League of Legends, uploaded 2026-10-19
  (today), 5.03 M views and 356 k likes within hours. "Video created in partnership with Fortiche", choreography
  Sean Bankhead. EP "FIRESTARTER" out 2026-10-21.
- Credits: vocals MIYEON + SOYEON of i-dle (Ahri, Akali), Sophie Powers (Evelynn, new), Mimi Webb (Kai'Sa, new);
  written by David Dahlquist, Ashley Fulton, Georgia Ku, Aejin Kwon, Sebastien Najand, James Norton; produced by Kill
  Dave + Sebastien Najand; P/C Riot Games 2026. First K/DA song in six years (after MORE / ALL OUT, 2020).
- Length 3:26.5 (206.48 s, measured with ffprobe). Tempo / key: measured by the cloud run (section 5).
- Audio in the job: `song.webm` = the official upload's audio stream (opus, format 251, 3.0 MB, yt-dlp + node EJS,
  2026-10-19). Loudness is normalised by the render (two-pass loudnorm to -14 LUFS / -1 dBTP).
- Lyrics: `lyrics.txt` = the official lyrics from the upload's description, verbatim. English with Korean verses
  (MIYEON / SOYEON) - the studio's song tools now read Hangul (one word per run, Revised Romanisation to match the
  recogniser by sound; `raymi/song.py`, tested).
- Rights: P/C Riot Games; CLAUDE.md lists K/DA as NOT creator-safe. The channel already uploaded MORE (2026-10-09) and
  Know My Name (2026-10-10) without a problem we know of (weiss ich nicht sicher what Content ID did to them). Treat as
  reach, not income; toki decided for this song (2026-10-19, her brief).

## 2. What the song says
Story of the song in 5 sentences: Four performers come back from a long darkness and announce that they are the
spark - they start the fire, they like the drama, call the fire fighter. No wind blows them out; their flame rises and
bursts like a festival over a cold world that turns red. Everyone is jealous, every day of the week, and still the
fuel never runs out - from 0 to 100, into your unconscious. Then they lose control on purpose: beat drop, let's play.
The fire takes the night sky, they are ready, and if you cannot take the heat, get out of the sauna.

The meaning in one line: **a comeback as arson - the one who was gone lights up the dark again, and everyone has to
watch.** (It IS a comeback song: six years away, the long darkness is their absence.)

Line by line (unique lines; repeats keep their meaning; English lines are already English, Korean lines get our own
safe translation; evidence: my reading of the official text, D):
| # | line (cue) | romanised (KO) | literal EN (own) | what it MEANS / subtext | weight |
|---|---|---|---|---|---|
| 1 | I'm a fire starter / Work a lil harder | | | the hook: I am the spark - and you have to work harder to keep up | 3 |
| 2 | Got me fired up / Imma burn it down like | | | provoked into it; "like" hangs - the beat finishes the sentence | 3 |
| 3 | Crazy out of order | | | out of control and out of the queue (cut the line) | 2 |
| 4 | Imma start a fire / Oh I like a little drama | | | the chorus: she starts it on purpose, she enjoys the chaos | 3 |
| 5 | Call the fire fighter / Call me crazy, call it Karma | | | dare: call for help, call me names, it is deserved | 3 |
| 6 | got you burning so hot / you'll be begging for water | | | you burn for it - and will beg for WATER (for Raymi: the ocean is her home) | 3 |
| 7 | 긴 어둠 끝 불을 밝혀 | gin eodum kkeut bureul balkyeo | at the end of a long darkness, light the fire | the comeback after six years - literally Raymi's name 灯闇, a lamp in the dark | 3 |
| 8 | 바람 불어도 (후후) I'm the lighter | baram bureodo (huhu) | even if the wind blows (whoo whoo) - I'm the lighter | others try to blow her out, she does not go out | 3 |
| 9 | 꺾이지 않는 desire | kkeokkiji anneun | a desire that does not break | | 2 |
| 10 | 올라가 펑펑 터져 마치 축제 같지 | ollaga peongpeong teojyeo machi chukje gatji | it goes up, bang bang it bursts, like a festival | fireworks - the flame becomes a party | 3 |
| 11 | I can be sweet / but I got gold venom on my teeth | | | sweet on the surface, a poison bite (Raymi: a stingray's venomous barb!) | 3 |
| 12 | I'm only showing up for a fee / You're only showing up for the tea | | | she performs for pay, you come for the gossip - both know it | 1 |
| 13 | I'm insane / Yeah I know you like it that way / Chaos running wild in my veins | | | the pre-chorus: chaos as charm | 2 |
| 14 | 느껴봐 차갑던 이 세상을 / 붉게 물들일 이 순간 | neukkyeobwa chagapdeon i sesangeul / bulge muldeuril i sungan | feel it - this cold world / the moment I dye it red | the build into the chorus: cold -> red (the colour turn of the video) | 3 |
| 15 | I'm a I'm a I'm a fire starter! | | | the stutter hit, end of chorus 2 | 3 |
| 16 | 멈추지 않아 / 월화수목금토일 | meomchuji ana / wolhwasumokgeumtoil | it doesn't stop / Mon Tue Wed Thu Fri Sat Sun | the rap: every single day | 2 |
| 17 | 나를 jealous / 근데 영 고갈이 안돼 / Dreamers | nareul / geunde yeong gogari andwae | (they're) jealous of me / but it never runs dry | the fuel never runs out | 2 |
| 18 | 0부터 100까지 / 너의 무의식까지 / 단숨에 다 퍼져 퍼져 | 0buteo 100kkaji / neoui muuisikkkaji / dansume da peojyeo | from 0 to 100 / into your unconscious / it spreads in one breath | the spread: wildfire | 2 |
| 19 | Let's go 삐걱 삐-삐걱 어느새 lose control | ppigeok ppi-ppigeok eoneusae | let's go, creak, cr-creak, suddenly lose control | the machine creaks - the break before the drop | 3 |
| 20 | 자 beat drop beat-beat drop / 놀아보자 얼쑤 (얼쑤!) | ja / noraboja eolssu | now - beat drop / let's play, eolssu! | eolssu = the traditional Korean "chuimsae" cheer (pansori / samulnori) - a festival shout | 3 |
| 21 | Ooh ooh 불을 지펴라 / 까마디 까만 이 밤하늘을 달려 | bureul jipyeora / kkamadi kkaman i bamhaneureul dallyeo | light the fire / run across this pitch-black night sky | the bridge: the flame runs across the dark | 3 |
| 22 | 준비됐어 난 / Sit back relax / Gonna take it | junbidwaesseo nan | I'm ready | calm before the last rise | 2 |
| 23 | When I start the fire / Better be ready for when I take it higher | | | the last build | 3 |
| 24 | If you can't take the heat / then get out of the sauna | | | the final chorus twist - a joke line (sauna!) | 3 |

Risky lines: none for brand safety (no violence, no sexual content). "burn it down" stays playful - nothing real
burns down, no house fire, no victims. Fire underwater must read as MAGIC / light, never as a disaster.
Korean lines get romanisation + English under them (PRINCIPLES 11 says "a Japanese line"; the same need holds for
Korean - the studio's v2 lyrics have the `lyrics_en.json` slot for it).

## 3. What exists already (derive, never copy)
- **Original MV** (Fortiche, 2026-10-19): the four K/DA members in Fortiche's painterly 3D (the Arcane / POP/STARS
  look), fire as the motif. Scene details: weiss ich nicht sicher - no breakdown is published yet and I cannot watch
  the video; I will not guess its shots. -> We do NOT imitate the four idols, their choreography or Fortiche's look.
- **What exists on YouTube on release day** (yt-dlp search, 2026-10-19, ~40 results): reactions (Joey Nato 93 k,
  Erick Dota 81 k, LKTV 58 k, VTuber reactions LadyOka 34 k, TaehoongieVT 9 k), colour-coded lyric videos
  (ShadowByYoongi 153 k, Jaeguchi 49 k - big search demand for the LYRICS), a 1-hour loop, a skins reveal.
  **No fan animation, no animated cover, no VTuber MV exists yet.**
- Older K/DA fan work that still pulls: POP/STARS SFM re-creation 10 M, male-version fan animation 2.9 M, mashups 3 M.
  The K/DA audience watches fan animation.
- **The gap:** the first animated fan MV of FIRESTARTER, with lyrics on screen (lyric demand is proven), told as a
  story - and the contradiction nobody else has: **a fire starter who lives at the bottom of the ocean.**

## 4. Who loves this song and why
- League of Legends players (Worlds season - the channel's Know My Name Short found them via search), K-pop fans
  (i-dle's MIYEON + SOYEON), K/DA fans who waited six years (reaction titles: "INSANE COMEBACK", "BEST COMEBACK OF
  ALL TIME", "after 6 years"), VTuber fans (VTubers already react to it).
- What they will look for: the hook "I'm a fire starter", the chorus "Imma start a fire / call the fire fighter",
  the "eolssu!" shout, the beat drop, the "get out of the sauna" line. Heatmap: not available on release day
  (re-check before the treatment).
- Search: "kda firestarter", "firestarter lyrics", "kda firestarter fan animation", "firestarter kda vtuber".

## 5. Song map (MEASURED)
Filled from the cloud run (`analyze.yml`, 2026-10-19): see below once `song_map.json` + `lyrics_timed.json` land.
TODO

## 6. Where Raymi meets this song
The contradiction is the idea engine: **fire cannot burn underwater - and she does it anyway.**
1. **灯闇 = a lamp in the dark.** "긴 어둠 끝 불을 밝혀" (at the end of a long darkness, light the fire) is literally her
   name. Her glowing dots are the first spark; she IS the light in the deep.
2. **Bioluminescence = underwater fire.** The deep sea's own "fire": glowing plankton, jellyfish, anglerfish lures.
   Fire in her world is LIGHT, not flame - cold-blue to hot-violet to red.
3. **Hydrothermal vents / black smokers** - the only real "fire" on the ocean floor: 400 °C water, glowing cracks,
   lava pillow rocks. A real place where the sea floor burns.
4. **"you'll be begging for water" / "call the fire fighter"** - she is surrounded by water and still burning: the
   gag of the video. Salmon as the panicking fire fighter with a bucket (of water, underwater).
5. **"gold venom on my teeth"** - her stingray barb IS venom. The tail flick as the "match strike".
6. **Bubbles** - fire underwater makes steam bubbles; the festival fireworks ("펑펑 터져") become exploding bubble
   bursts rising to the surface.
7. **Her ultraviolet** - the video's colour turn from cold deep-sea blue to her violet to fire red ("dye this cold
   world red").
8. **The comeback** - six years away = her rising from the dark sea floor; buried in sand (rays bury themselves),
   then the eyes open and glow.
9. **Rhythm games** (hobby) - "beat drop beat-beat drop" as notes she hits; "0 to 100" as a gauge.
10. **Karaoke** (bad, but confident) - she sings into a lighter-microphone; "I'm the lighter" = she holds up the
    lighter like at a concert (concert lighters = fan lightsticks; MORE used jellyfish lightsticks - so NOT again).
11. **Sumi** (UV-glowing mascot) - his curled glowing tail tip is a little flame: the sidekick who catches the spark.
12. **Rain predictions** - "call the fire fighter" -> she predicts rain to put it out, wrong as always.
13. **Sauna** - the last joke line: the hot vent becomes a sauna, the fish in towels.
Never: devil / demon / hell framing (fire + horns is the classic trap - her tako ears must never read as horns, no
hellfire), real destruction, burning creatures.

## 7. Short windows (12-20 s, start and end on phrase edges)
TODO after the measured map. Candidates by the text: the opening hook ("I'm a fire starter" x2 -> chorus), the
"eolssu" beat drop, the final "get out of the sauna" chorus. The Short must END on a cliffhanger that the MV pays off.

## Sources
- Official video + description (credits, lyrics): https://www.youtube.com/watch?v=Mmw-PpWhKFg (yt-dlp, 2026-10-19)
- https://www.upi.com/Entertainment_News/2026/10/19/kda-firestarter-league-of-legends/1371792414309 (release, cast)
- https://www.allkpop.com/article/2026/10/k-da-returns-with-firestarter-after-six-years-with-i-dles-miyeon-and-soyeon-back-as-ahri-and-akali (search snippet: six years, cast roles)
- YouTube search via yt-dlp 2026-10-19 ("kda firestarter", "firestarter kda animation fan")
- canon/10_kanal_puls_snapshot_2026-10-16.md (Know My Name retention + search share)
