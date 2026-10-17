# Titel, Beschreibung, Tags - wie echte Videos es machen (Stand 2026-10-04)

Anlass: toki zu den Mesmerizer-Texten: "sie wirken total komisch, niemand wuerde 'stingray vtuber' so in den Titel
schreiben, SEO-maessig laesst sich bestimmt einiges rausholen." Mein Fehler: ich habe Titel aus unseren eigenen
Regeln gebaut (Rollen-Tag, Kanal-Begriffe) statt aus dem, was erfolgreiche Videos zum selben Song machen und was Leute
wirklich tippen. Ab jetzt immer zuerst die Daten, dann schreiben. Ergaenzt brain/09 (Suchbegriffe) - bei Titeln gilt
diese Datei.

## 0. Vorgehen (kostenlos, vor jedem Upload-Text)
1. YouTube-Autovervollstaendigung zum Song (Song, "Song ", "Song a"..."Song v", JP-Titel): das ist, was Leute tippen.
   Werkzeug: `engine/tools/yt_research.py suggest "<song>" "<song> a" ...`
2. Top-Ergebnisse zum Song + "<song> animation" + "<song> lyrics" + "<song> vtuber": Titel, Kanal, Views.
   `engine/tools/yt_research.py search ...`; Beschreibung + Tags der besten 3-5: `... describe <videoId>`.
3. Offizielles Original finden (meistviewte Video des Artist-Kanals) -> Link + Credits genau so uebernehmen.
4. Erst dann Titel / Beschreibung / Tags schreiben. Ergebnis + Begruendung in upload_*.md festhalten.
(vidIQ kostet 5 Credits pro Abfrage - nur, wenn Guthaben da ist; toki fragen, bevor etwas Geld kostet.)

## 1. Titel - Befunde (Mesmerizer, 2026-10-04)
- Das Original heisst "Mesmerizer / Hatsune Miku＆Kasane Teto" (225 Mio). Songname vorne, dann die Saenger.
  Der Produzent (32ki / サツキ) steht fast nie im Titel und wird kaum gesucht (nicht in der Autovervollstaendigung).
- Gesucht wird: "mesmerizer miku and teto", "mesmerizer animation", "mesmerizer lyrics", "mesmerizer english",
  "mesmerizer meaning / lore / translation", JP: "メズマライザー 歌ってみた".
- Erfolgreiche Fan-Animationen: "【TADC】MESMERIZER - メズマライザ | Ft. Ribbit & Jax" (414k), "★[FORSAKEN] Mesmerizer /
  Ft. Elliot & Chance" (1,2 Mio), "\"Mesmerizer\" Fan-Animation [100M Views Celebration]" (3,9 Mio).
  Muster: [Welt/Fandom] + Songname + "Ft." die eigenen Figuren, oder "Fan-Animation".
- Neugier-Format mit hohen Views: "Mesmerizer but it's Breakcore" (440k), "YOASOBI / IDOL BUT ITS LEAGUE OF LEGENDS"
  (589k). Songname + "but it's" + die eigene Wendung.
- VTuber-Covers (Gesang): "MESMERIZER / メズマライザー【歌ってみた】feat. ..." - nur wenn Raymi wirklich singt (tut sie
  nicht: Original-Audio, also NIE 歌ってみた / cover).
- Lyric-Videos: "[ENG/ROM/KAN] Mesmerizer ft. Hatsune Miku and Kasane Teto".
- Niemand schreibt "stingray VTuber" oder Kanal-Jargon in den Titel.

## 2. Titel - Regeln
1. Songname genau wie im Original zuerst (lateinische Schreibweise, so wie gesucht), optional JP-Titel dahinter.
2. Dann die Saenger / der Artist in der gesuchten Form ("Hatsune Miku & Kasane Teto", "YOASOBI", "Kana Hanazawa").
3. Dann, was UNSER Video ist, in der Sprache der Szene: "Fan Animation", "but it's <unsere Wendung>", "(rom/eng lyrics)".
4. Kein "stingray VTuber", kein "Raymi" am Anfang. Raymi hoechstens als "ft. Raymi" am Ende (wie Fan-Animationen ihre
   Figuren nennen) - Markenaufbau ueber den Kanal, nicht ueber Titel-Suchwoerter.
5. <= 60 Zeichen sichtbar wichtig; Emojis/Kaomoji nicht im Titel.
6. Shorts: dieselbe Logik, Neugier vorne ("Mesmerizer but ..."), kein #shorts noetig.

## 3. Beschreibung - Befunde und Regeln
- Erfolgreiche Fan-Animatoren schreiben 1-2 kurze, menschliche Saetze ("had fun animating this, not that it took me
  2 months"), dann einen sauberen Credits-Block mit Link zum Original, dann 3-6 Hashtags. Kein Rechts-Absatz, keine
  Kapitel bei einem 2:37-Song, keine Kaomoji-Kaskade.
- Regeln: Zeile 1 = Songname + Saenger natuerlich im Satz (Suchwort in den ersten 100 Zeichen), in Raymis Stimme, aber
  knapp und echt (max. ein Kaomoji). Dann:
  ```
  ◆ Original: <Link>
  ◆ Music & Lyrics: サツキ (32ki)
  ◆ Vocals: Hatsune Miku, Kasane Teto
  ◆ Original MV: channel
  ◆ Animation & English translation: Raymi (fan-made, not official)
  ```
  Ein Satz "not my song, all rights belong to ..." genuegt. Dann Hashtags: #Mesmerizer #メズマライザー #VTuber (+ #初音ミク).
- Japanische Fans schreiben "二次創作アニメーション" und "本家様: <Link>" - fuer JP-Reichweite eine JP-Zeile ergaenzen.

## 4. Tags
Beide Schriften und die gesuchten Formen: Songname, JP-Titel, "<song> miku and teto", Saengernamen EN + JP (初音ミク,
重音テト), "<song> animation", "<song> lyrics", "vocaloid", "ボカロ", "fan animation", "vtuber". Keine "cover"-Tags bei
Original-Audio, nie "ai ..." (Blockliste).
