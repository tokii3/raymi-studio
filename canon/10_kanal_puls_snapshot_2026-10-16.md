# Kanal-Puls (automatisch, nicht von Hand bearbeiten)

Stand 2026-10-16T10:00, Daten bis 2026-10-15 (YouTube liefert Analytics mit 1-3 Tagen Verzug). Erzeugt von `raymi.cmd pulse daily` aus der YouTube-API. Vor jeder Video-Planung lesen; Raymis Erinnerungen stehen in `11_Raymis-Kanal-Geschichte.md`.

Vertrauen: **Anekdote** = unter 3 Videos (nur Hinweis, keine Regel), **Tendenz** = 3-5, **belastbar** = ab 6. Kleine Zahlen nicht schoenreden und nicht ueberinterpretieren.

## 1. Lage

- Kanal **wachsend**: letzte 7 Tage 3.905 Aufrufe (-48 %), 28 Tage 16.900.
- Abos: 63 gesamt, netto +7 in 7 Tagen, +62 in 28 Tagen.
- Gesamt seit Start: 16.900 Aufrufe, 47 h Wiedergabezeit, 40 Videos.
- Uploads letzte 14 Tage: 14; letzter Upload vor 6 Tag(en).
- Bester Tag bisher: 2026-10-10 mit 2.053 Aufrufen.
- **Freiraum-Budget: 30 %** der naechsten Videos sind freie Experimente.

## 2. Kennzahlen-Fenster

| Fenster | Aufrufe | Engaged | Wiedergabe (h) | Abos netto | Likes | Kommentare | Shares |
|---|---|---|---|---|---|---|---|
| letzte 7 T | 3.905 | 1.416 | 16.5 | +7 | 36 | 4 | 0 |
| 7 T davor | 7.485 | 2.364 | 17.3 | +15 | 118 | 8 | 4 |
| letzte 28 T | 16.900 | 6.023 | 47.1 | +62 | 301 | 22 | 6 |
| 28 T davor | 0 | 0 | 0.0 | +0 | 0 | 0 | 0 |

## 3. Strategie fuer die naechsten Videos

Regelbasiert aus den echten Zahlen. Claude gewichtet nach Vertrauen; toki entscheidet. Kanon (brain/01-02) und Paket-Strategie (CLAUDE.md) gehen immer vor.

- **Reichweite holt aktuell am ehesten: Song-Short. Abos pro Aufruf holt am ehesten: Lore/Alltags-Short.** _Warum:_ Median Start-Aufrufe (7 Tage) bzw. Abos je 100 Aufrufe (gepoolt) je Format, n=9/18. _Vertrauen:_ belastbar
- **Paket-Logik bestaetigt sich: Song-Short als Tuer, Lore/Alltags-Short als Bindung. Jede Tuer braucht eine sichtbare Bruecke (angepinnter Kommentar, verwandtes Video).** _Warum:_ Reichweite und Abo-Quote kommen aus verschiedenen Formaten. _Vertrauen:_ belastbar
- **Hook-Typen nach Start-Reichweite: personal_fact > callout > ranking > confession.** _Warum:_ Median Start-Aufrufe der Shorts je hook_type. _Vertrauen:_ Anekdote
- **Staerkste Hooks (erste 3 s): "The Worst Singer In The Ocean Refuses To Stop"; "why is best friend salmon ( ˶ˆ ᗜ ˆ˵ ) #vtuber #pngtuber #indieVtuber #envtuber #shorts  #vtuberdebut". Ihr Einstieg ist die Vorlage, nicht ihr Thema.** _Warum:_ Anteil, der nach 3 s noch schaut, Kanal-Median 89 %. _Vertrauen:_ belastbar
- **4 Video(s) verlieren am Anfang deutlich mehr als der Kanal-Median: "Know My Name - True Damage | Fan Animation (League of Legends / LOL Worlds 2026 Anthem)" (69 %); "I Rate Every Fish That Swims Past My House" (61 %); "10 Food Rules. Zero Regrets. (Except Maybe Rule Five)" (68 %). Gemeinsamkeit pruefen (erster Satz, erstes Bild).** _Warum:_ Hook-Halt < 85 % des Medians. _Vertrauen:_ belastbar
- **Engaged-Anteil Shorts (Median): 37 % (Ziel-Hypothese 40 %).** _Warum:_ Wer nicht wegwischt, zaehlt fuer den Algorithmus. _Vertrauen:_ belastbar
- **Letzter Durchbruch: "today i'm turning into a cute little stingray :3" (3.49x der Start-Aufrufe davor). Was genau war anders? Genau EINE Eigenschaft davon im naechsten Video wiederholen.** _Warum:_ Ausreisser gegen die eigenen frueheren Videos. _Vertrauen:_ Anekdote
- **Seit 6 Tagen kein Short. Ohne neuen Upload faellt der Kanal auf ~15-35 Aufrufe am Tag (27.-29.09.); ein Short pro Tag.** _Warum:_ 14 Uploads in 14 Tagen. _Vertrauen:_ belastbar
- **Mehrere Shorts am selben Tag (2026-10-04, 2026-10-06, 2026-10-07). Lieber verteilen: ein Short pro Tag zur festen Zeit.** _Warum:_ Jeder Short bekommt seinen eigenen Testlauf im Shorts-Feed; am selben Tag konkurrieren sie. _Vertrauen:_ Tendenz
- **Freiraum-Budget: 30 % der naechsten Videos duerfen echte Experimente sein (Kanal wachsend). Pro Experiment genau eine neue Variable, Rest bewaehrt; Ergebnis landet hier.** _Warum:_ Waechst der Kanal, traegt er mehr Risiko; schrumpft er, zurueck zu Bewaehrtem. _Vertrauen:_ Regel

## 4. Formate im Vergleich (Mediane, Videos ab 3 Tage alt)

| Format | n | Vertrauen | Aufrufe | Start-7-T | Ø gesehen | Engaged | Hook-Halt 3 s | Ende-Halt | Abos/100 | Suche |
|---|---|---|---|---|---|---|---|---|---|---|
| Lore/Alltags-Short | 18 | belastbar | 71 | 48 | 63 % | 39 % | 89 % | 23 % | 0.63 | 9.0 % |
| Song-Short | 9 | belastbar | 1.246 | 1.246 | 57 % | 27 % | 92 % | 21 % | 0.10 | 6.7 % |
| Musikvideo (lang) | 8 | belastbar | 176 | 130 | 29 % | 68 % | 86 % | 17 % | 0.61 | 4.5 % |
| Longform | 5 | Tendenz | 17 | 15 | 17 % | 77 % | 82 % | 9 % | 2.40 | 0.8 % |

## 5. Hook-Typen (Lore/Alltags-Shorts)

| hook_type | n | Vertrauen | Aufrufe | Start-7-T | Hook-Halt | Abos/100 |
|---|---|---|---|---|---|---|
| personal_fact | 5 | Tendenz | 297 | 265 | 89 % | 0.78 |
| debate | 1 | Anekdote | 279 | 273 | 96 % | 0 |
| callout | 3 | Tendenz | 145 | 141 | 92 % | 0.17 |
| ranking | 2 | Anekdote | 89 | 48 | 85 % | 1.69 |
| confession | 3 | Tendenz | 50 | 38 | 89 % | 1.70 |

## 6. Hypothesen (brain/analytics/hypotheses.json)

| ID | Hypothese | Messung | Ergebnis | Vertrauen |
|---|---|---|---|---|
| H-hook | Persoenliche Weird-Fact/Gestaendnis-Hooks holen mehr Start-Reichweite als Rankings | first7_views: A 48 (n=8) vs B 48 (n=2) | **widerlegt** | Anekdote |
| H-search | Song-Videos bekommen mehr Such-Traffic als Lore-Shorts | search_share: A 0.06 (n=17) vs B 0.09 (n=17) | **widerlegt** | belastbar |
| H-bridge | Song-Shorts holen pro Aufruf weniger Abos als Lore-Shorts (darum braucht es die Bruecke) | subs_per_100: A 0.08 (n=9) vs B 0 (n=17) | **widerlegt** | belastbar |
| H-engaged | Song-Shorts erreichen mindestens 40 % Engaged-Anteil | engaged_share: 0.27 (n=9) Ziel 0.4 | **widerlegt** | belastbar |
| H-20s | Shorts bis 20 s werden zu einem hoeheren Anteil gesehen als laengere Shorts | avg_pct: A 104 (n=5) vs B 57 (n=21) | **bestaetigt** | Tendenz |
| H-hookhold | Lore-Shorts halten in den ersten 3 s mindestens 70 % der Zuschauer | hook_hold: 0.89 (n=13) Ziel 0.7 | **bestaetigt** | belastbar |
| H-longform-bind | Longform/Musikvideos holen pro Aufruf mehr Abos als Shorts (Fans bleiben fuer mehr Raymi) | subs_per_100: A 0.60 (n=13) vs B 0 (n=26) | **bestaetigt** | belastbar |

## 7. Video fuer Video (neueste zuerst)

| Datum | Format | Titel | Aufrufe | Start-7-T | Ø gesehen | Engaged | Hook 3 s | Ende | Abos/100 | Suche | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-10 | Musikvideo (lang) | Know My Name - True Damage | Fan Animation (League of Legend | 217 | 217 | 29 % | 33 % | 69 % | 17 % | 0 | 38.7 % | Hook schwach, Suche traegt |
| 2026-10-10 | Song-Short | True Damage - Know My Name (League of Legends Worlds 2026) - | 2.795 | 2.795 | 54 % | 27 % | 92 % | 19 % | 0.07 | 53.6 % | Suche traegt |
| 2026-10-07 | Song-Short | today i'm turning into a cute little stingray :3 | 297 | 297 | 105 % | 19 % | 96 % | 54 % | 0 | 3.7 % | Durchbruch (3.49x) |
| 2026-10-07 | Song-Short | It's Me, It's Verity but it's me (Raymi) | 1.379 | 1.379 | 57 % | 38 % | 89 % | 21 % | 0.15 | 15.9 % | Durchbruch (13.65x), Suche traegt |
| 2026-10-07 | Musikvideo (lang) | It's Me, It's Verity - Fan Animation (but it's me) | 168 | 168 | 28 % | 80 % | 80 % | 13 % | 0.60 | 6.0 % | - |
| 2026-10-07 | Musikvideo (lang) | Let's Get Weird - Bill Cipher Song | Fan Animation | 602 | 601 | 41 % | 54 % | 86 % | 27 % | 0.66 | 3.5 % | Durchbruch (5.95x) |
| 2026-10-06 | Song-Short | Let's Get Weird but she's in your phone (Bill Cipher Song) | 1.305 | 1.300 | 86 % | 30 % | 93 % | 37 % | 0.15 | 6.7 % | Durchbruch (18.84x) |
| 2026-10-06 | Song-Short | Electric Angel but my first stream had 0 viewers | 350 | 350 | 66 % | 20 % | 90 % | 25 % | 0 | 5.4 % | Durchbruch (4.12x) |
| 2026-10-06 | Musikvideo (lang) | Electric Angel / えれくとりっく・えんじぇぅ - Fan Animation | 5 | 5 | 42 % | 100 % | - | - | 0 | 0.0 % | unter Erwartung (0.05x) |
| 2026-10-04 | Musikvideo (lang) | Mesmerizer / Hatsune Miku & Kasane Teto | Fan Animation | メズ | 167 | 141 | 22 % | 55 % | 93 % | 12 % | 0.60 | 13.8 % | Durchbruch (2.43x), Suche traegt |
| 2026-10-04 | Song-Short | Mesmerizer (メズマライザー) / Miku & Teto | Fan Animation | 1.212 | 1.203 | 48 % | 28 % | 91 % | 15 % | 0.08 | 8.7 % | Durchbruch (20.74x) |
| 2026-10-04 | Song-Short | Renai Circulation, but it's my secret desk diary | 525 | 525 | 162 % | 19 % | 95 % | 59 % | 0 | 5.9 % | Durchbruch (9.05x) |
| 2026-10-04 | Musikvideo (lang) | Renai Circulation - Kana Hanazawa | Romaji + English Lyrics  | 119 | 101 | 21 % | 59 % | 81 % | 13 % | 0 | 2.5 % | - |
| 2026-10-03 | Song-Short | She escaped her acrylic stand | POP IN 2 - B-Komachi | 1.246 | 1.246 | 40 % | 22 % | 94 % | 12 % | 0.16 | 4.3 % | Durchbruch (32.79x), zieht Abos |
| 2026-10-03 | Musikvideo (lang) | POP IN 2 - B-Komachi | A Day With Your Oshi | Lyric Video | 184 | 120 | 43 % | 78 % | 86 % | 18 % | 1.09 | 3.8 % | Durchbruch (2.5x), zieht Abos |
| 2026-10-01 | Song-Short | Lie or truth? YOASOBI - Idol, animated by a Stingray VTuber | 1.415 | 1.402 | 50 % | 28 % | 89 % | 16 % | 0.14 | 28.3 % | Durchbruch (41.24x), Suche traegt |
| 2026-10-01 | Musikvideo (lang) | YOASOBI - Idol (アイドル) | Kinetic Lyric Video [JP / Romaji / E | 328 | 116 | 29 % | 85 % | 89 % | 20 % | 0.91 | 5.2 % | Durchbruch (3.22x) |
| 2026-09-30 | Lore/Alltags-Short | Stingray VTuber Says Rays Are The Cooler Sharks | 102 | 101 | 36 % | 19 % | 82 % | 9 % | 0 | 1.0 % | - |
| 2026-09-30 | Lore/Alltags-Short | I Rate Every Fish That Swims Past My House | 35 | 34 | 42 % | 43 % | 61 % | 11 % | 0 | 62.9 % | Hook schwach, Suche traegt |
| 2026-09-30 | Longform | The Deep Sea Is Weirder Than You Think | 15 | 12 | 5.58 % | 93 % | 81 % | 6 % | 6.67 | 0.0 % | unter Erwartung (0.21x), zieht Abos |
| 2026-09-30 | Longform | Ocean Facts That Sound Fake But Are Real | 17 | 15 | 17 % | 76 % | 85 % | 8 % | 0 | 0.0 % | unter Erwartung (0.33x) |
| 2026-09-30 | Longform | Things Humans Do That Make No Sense To A Stingray | 1 | 0 | - % | - | - | - | 0 | - | unter Erwartung (0.0x) |
| 2026-09-30 | Lore/Alltags-Short | The Worst Singer In The Ocean Refuses To Stop | 50 | 38 | 41 % | 40 % | 100 % | 13 % | 0 | 20.0 % | Suche traegt |
| 2026-09-26 | Lore/Alltags-Short | You've Been Drinking Bubble Tea Wrong This Entire Time | 279 | 273 | 34 % | 40 % | 96 % | 9 % | 0 | 4.3 % | Durchbruch (8.27x) |
| 2026-09-26 | Lore/Alltags-Short | VTuber Confesses The Real Reason She Goes Stargazing | 92 | 58 | 49 % | 44 % | 87 % | 23 % | 3.26 | 4.9 % | zieht Abos |
| 2026-09-25 | Longform | 10 Food Rules. Zero Regrets. (Except Maybe Rule Five) | 28 | 20 | 16 % | 71 % | 68 % | 10 % | 7.14 | 7.1 % | Hook schwach, zieht Abos |
| 2026-09-25 | Lore/Alltags-Short | chat proved i havent had a REAL meal in years 💀 no rules no  | 297 | 265 | 65 % | 37 % | 87 % | 29 % | 0 | 1.1 % | Durchbruch (8.69x) |
| 2026-09-24 | Lore/Alltags-Short | i saw how you eat sushi... and its a CRIME  (°_°) #vtuber | 20 | 18 | 26 % | 35 % | - | - | 0 | 65.0 % | unter Erwartung (0.28x), Suche traegt |
| 2026-09-24 | Lore/Alltags-Short | You're Allowed To Be Too Much ♥ | 13 | 8 | 104 % | 15 % | - | - | 0 | 30.8 % | unter Erwartung (0.14x), Suche traegt |
| 2026-09-24 | Lore/Alltags-Short | Sharks And Rays Are Basically Cousins | 22 | 11 | 68 % | 36 % | - | - | 0 | 0.0 % | unter Erwartung (0.24x) |
| 2026-09-23 | Lore/Alltags-Short | There's A Correct Way To Eat Onigiri (Fight Me) | 145 | 141 | 67 % | 36 % | 92 % | 36 % | 0 | 9.0 % | Durchbruch (3.1x) |
| 2026-09-23 | Lore/Alltags-Short | This VTuber Can Predict Rain (Allegedly) | 1.080 | 598 | 68 % | 51 % | 91 % | 26 % | 0.83 | 0.8 % | Durchbruch (10.31x) |
| 2026-09-22 | Lore/Alltags-Short | VTuber Ranks Ocean Animals (Someone Will Get Mad) | 31 | 28 | 80 % | 19 % | - | - | 0 | 19.4 % | unter Erwartung (0.48x), Suche traegt |
| 2026-09-21 | Lore/Alltags-Short | This Stingray VTuber Is Done Being Called A Devil | 34 | 28 | 63 % | 53 % | 71 % | 43 % | 0 | 52.9 % | unter Erwartung (0.41x), Hook schwach, Suche traegt |
| 2026-09-21 | Lore/Alltags-Short | VTuber Confesses She Betrayed Her Best Friend | 34 | 33 | 67 % | 41 % | 89 % | 28 % | 0 | 35.3 % | Suche traegt |
| 2026-09-20 | Lore/Alltags-Short | VTuber Calls Out Everyone Who Eats Rice First | 911 | 905 | 47 % | 39 % | 96 % | 15 % | 0.22 | 0.4 % | Durchbruch (13.12x) |
| 2026-09-20 | Longform | meet raymi, the stingray vtuber whose best friend is a salmo | 64 | 58 | 27 % | 77 % | 84 % | 22 % | 0 | 1.6 % | unter Erwartung (0.12x) |
| 2026-09-19 | Lore/Alltags-Short | why is best friend salmon ( ˶ˆ ᗜ ˆ˵ ) #vtuber #pngtuber #ind | 1.146 | 1.137 | 74 % | 46 % | 98 % | 35 % | 0.96 | 0.6 % | zieht Abos |
| 2026-09-19 | Lore/Alltags-Short | New VTuber Ranks Every Ocean Creature (Salmon Broke The Scal | 147 | 69 | 33 % | 34 % | 85 % | 15 % | 2.04 | 22.4 % | unter Erwartung (0.12x), zieht Abos, Suche traegt |
| 2026-09-17 | Lore/Alltags-Short | Video Node 8 | 0 | 0 | - % | - | - | - | - | - | - |

## 8. Woher die Zuschauer kommen und wer sie sind

Traffic (Kanal gesamt): Shorts-Feed 67 %, YouTube-Suche 16 %, Abo-Feed 5 %, Vorgeschlagen 4 %, andere YT-Seite 4 %, Kanalseite 2 %, SOUND_PAGE 0 %, Playlist 0 %

Laender (Top): DE 43 %, US 22 %, JP 21 %, KR 5 %, BR 3 %, ID 3 %, RU 2 %, CA 2 %
Alter/Geschlecht (Top): male 25-34 47 %, male 18-24 20 %, male 35-44 12 %, female 25-34 8 %
Aufrufe von Abonnenten: 1 % (Rest = neue Leute).

## 9. Kommentare

21 Zuschauer-Kommentare, Antwortquote 100 %, Stammgaeste (3+ Videos): 3.


## 10. Suchbegriffe (alle Videos, Top 12; Regeln: brain/09)

| Begriff | Aufrufe | Ø gesehen |
|---|---|---|
| know my name | 229 | 14 % |
| know my name true damage | 80 | 20 % |
| idol yoasobi | 71 | 23 % |
| true damage | 65 | 26 % |
| know my name true damage reaction | 59 | 5.50 % |
| yoasobi | 49 | 14 % |
| now you know my name | 44 | 15 % |
| know my name reaction | 40 | 8.30 % |
| know my name lol | 38 | 8.90 % |
| メズマライザー | 28 | 13 % |
| let's get weird | 26 | 352 % |
| know my name lol reaction | 21 | 0 % |
