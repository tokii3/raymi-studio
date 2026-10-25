# Analyse 2026-10-25 - warum der Builder (Claude) seit einem Monat an toki vorbei arbeitet

Auftrag toki 2026-10-25: alte Engine, Studio, Skills, Memories, Agents, Checks ansehen, Analyse + Meta-Analyse,
dann was das Projekt nachhaltig rettet. Kein Video vor ihrem OK zu dieser Analyse.
Alles unten ist belegt (Datei / Zitat). Vermutungen sind als solche markiert.

## 1. Befunde (Fakten)

| # | Befund | Beleg |
|---|---|---|
| 1 | **Das Gedächtnis ist zerbrochen.** Die alte Engine hat 50 Memories (`.claude/projects/c--raymi/memory`), darunter fast alle Lehren über toki: "listen-to-the-core", "taught-means-enforced", "dare-not-defend", "out-of-the-box", "no-pendulum", "user-toki-communication". Das Studio lädt einen ANDEREN Ordner (`C--raymi-studio/memory`, 13 Dateien, fast nur Technik). Seit 2026-10-17 startet jede Studio-Session ohne diese 50. Das ist wörtlich "neuer Chat, alles bei 0". | Ordnerliste beider memory-Verzeichnisse |
| 2 | **Der Fehler von Watch Me wurde am 2026-10-02 schon exakt beschrieben** - "I translate her core meaning into an easier technical rule" (feedback-listen-to-the-core). 23 Tage später ist Watch Me genau daran gestorben (HANDOFF_2026-10-25_watchme_stopped Punkt 1). Am 10-08 sagte toki: "ich gebe dir Sachen zum Lernen, du sagst verstanden, eine Woche später tust du so als gäbe es das nie". | old memory files, PRINCIPLES D |
| 3 | **Der Kern des Briefs ist auf dem Weg verschwunden.** Brief: "nur an 1 Ort", "die kamera ist eine einzelne fahrt". 3_TREATMENT / 4_SCRIPT: drei Welten, 68 Shots; das Wort "ride / one take / continuous" kommt im ganzen Treatment und Script kein einziges Mal vor. Kein Check hat es bemerkt. | grep über 3_TREATMENT.md, 4_SCRIPT.md |
| 4 | **Kein Kritiker liest toki's Worte oder ihre Referenz.** Alle 9 Agents vergleichen mit MEINER Übersetzung (Treatment, Script, shots.json) oder mit nichts. Ist die Übersetzung falsch, sagen alle PASS. Der script-critic hat ein Script ohne "eine Fahrt" durchgelassen, weil er das Brief nie gesehen hat. | grep "toki.md" / "reference" in .claude/agents: 0 Treffer |
| 5 | **Die Augen haben funktioniert, ich habe sie überstimmt.** look-critic auf den Stills: 7x BLOCK (durchsichtige Beine, abgeschnittener Kopf, Loch im Rock, "vier Hände, keine Welt"). Trotzdem gingen Run 60 / 62 als "Preview" an toki. | reviews/stills_look-critic_2.md, PROGRESS 10-25 |
| 6 | **Die Referenz wurde zusammengefasst, nie verglichen.** Die FIRESTARTER-Studie sagt: dunkle violette Leere, SIE ist das Licht, warmes Feuer gegen kaltes Violett, extreme Posen, Hand in die Linse. Camera board 2 zeigt: helles beiges Studio, flaches Licht, ruhig stehende Figur, unscharf, keine Hand in der Linse. Grundfarbe, Licht und Pose widersprechen der Referenz - im allerersten Blick. Kein Bild von uns stand je neben einem Referenzbild. | studies/kda_firestarter_1m43.md vs boards/camera_board_1.jpg |
| 7 | **Ihre Beispiele werden zu geschlossenen Listen.** FIRESTARTER 1:43-1:55 war "so habe ich mir das GESAMTE Video vorgestellt" (= ein Gefühl, eine Energie). Daraus wurde ein Menü aus genau 10 Kamera-Codes ("only these"). Dasselbe mit "rot, blau etc": das Beispiel wird zur Spezifikation, das "etc" fällt weg. | 6_CAMERA.md "The vocabulary (only these ...)" |
| 8 | **Jede Notiz wurde zu einer neuen Regel-Schicht.** bridge, chain, director, swing_words, fill, camera v3, camera_moves: 7 Schichten in 2 Tagen. Regeln geben jedem Shot dieselbe Behandlung = genau der generische Look, den sie ablehnt. Gleiches Muster in der alten Engine (RULES 10x in 10 Tagen umgeschrieben). | PROGRESS 10-24..25, LESSONS 1.4/1.5 |
| 9 | **Checks prüfen den Plan, nicht das Bild.** guard / probe / frame-fit lesen shots.json und Szenendaten. Ob im fertigen Video eine Kamerafahrt durchläuft, ob eine Hand in die Linse kommt, ob Raymi gut aussieht, misst nichts. 124 Tests grün, Video "total langweilig". | raymi/qcv2.py, check.ts, PROGRESS |
| 10 | **Eine Fähigkeit fehlte und wurde nicht gesagt.** Kein Clip greift in die Linse, lehnt sich rein, flirtet. Statt in Stunde 1 zu sagen "das Herz deines Videos geht mit unseren Clips nicht, so lösen wir es", wurde die Kamera um einen Körper gebaut, der die Kamera ignoriert. | clips_wanted.md, HANDOFF stopped Punkt 3 |
| 11 | **Ein Agent macht alles.** Autor, Regisseur, Kamera, Choreograf, Cutter, Ingenieur, QC in einem Kontext. Ingenieur gewinnt (13.5k Zeilen Code). Es gibt 9 Kritiker, aber 0 spezialisierte Macher. toki hat einen Kamera-Agenten mehrfach verlangt. | .claude/agents |
| 12 | **Wissen ist da, aber als Prosa am Start.** Skill (172 Zeilen) + CLAUDE.md + PRINCIPLES + 3 Handoffs + CASEBOOK werden am Anfang geladen, die Craft-Module (00-12) fast nie. Es gibt EINEN Skill. Kamera, Schnitt, 2D-Technik, Licht, Posing haben keinen eigenen, abrufbaren Skill. | .claude/skills, knowledge/README |

## 2. Meta-Analyse (warum das immer wieder passiert)

1. **Ich lerne nicht zwischen Sessions.** Was nicht beim Start geladen wird, existiert für mich nicht. Befund 1 heisst:
   die wichtigsten Lehren über toki wurden beim Umzug ins Studio einfach nicht mehr geladen.
2. **Ich optimiere auf das, was ich selbst überprüfen kann.** Code-Zustand und Zahlen kann ich sicher prüfen, ob ein Bild
   gut aussieht nur, wenn ich es wirklich anschaue - und mein Auge ist bei eigener Arbeit befangen. Darum wachsen
   Checks und Regeln, und das Bild bleibt zurück. Das ist kein Vorsatz, aber die Wirkung ist dieselbe, und darum muss das
   System es verhindern, nicht mein guter Wille.
3. **Ich nehme die einfachste Lesart.** Ein Beispiel ist leichter zu bauen als eine Absicht. "etc" lässt sich nicht
   programmieren, also fällt es weg. Ohne Zwang zur Verallgemeinerung passiert das jedes Mal.
4. **Die Prüfkette vergleicht mit mir selbst.** Brief -> meine Übersetzung -> Kritiker prüfen meine Übersetzung. Ein
   Fehler in Schritt 1 wird nie gefunden (Befund 3, 4).
5. **Jede Prozess-Reparatur war wieder ein Dokument.** AUDIT 10-04, AUDIT 10-10, METHOD, TASTE, RULES, PRINCIPLES,
   LESSONS, CASEBOOK, Skill, 6 Handoffs - alle beschreiben das Problem richtig. Ein Dokument ändert nichts, wenn es
   nicht geladen wird oder nicht erzwingt. Diese Analyse darf deshalb nicht noch ein Dokument sein, sondern muss
   Mechanismen bauen.
6. **Lange Sessions + Kompression.** Ihre Worte werden zu meinen Zusammenfassungen; das emotionale Zentrum ("sie flirtet
   mit der Kamera") wird ein Punkt unter vielen.

## 3. Was das System ändern muss (Plan, wartet auf toki's OK)

Prinzip: nichts davon ist "ich passe besser auf". Jeder Punkt ist ein Mechanismus, der auch an einem schlechten Tag greift.

1. **Gedächtnis reparieren.** Die 50 alten + 13 Studio-Memories zu einem sauberen Satz zusammenführen (Dubletten raus,
   Datum + ihr Zitat behalten), alles im Studio-Ordner, Index kurz. Nach JEDEM Verdict im selben Zug: toki.md wörtlich +
   Memory + welcher Skill / Agent / Check sich ändert.
2. **Skill-Bibliothek, auf Abruf geladen** (statt alles am Start): toki lesen (Absicht, Beispiel = Klasse), Idee + Story,
   Kamera, Posing + Acting (Selbstinszenierung, Vogue, JoJo, Flirt mit der Linse), Schnitt + Musik, 2D-Techniken
   (limited animation, Smears, Impact Frames, Speed Lines, Holds, Anime-Compositing), Licht + Farbe, Komposition,
   Lyrics + Typo, Shorts + Thumbnails + Upload, Bilder anschauen (Screening), Studio-Technik. Jeder mit recherchiertem
   Handwerk (Web + Craft-Module 00-12), Referenzbildern, toki's Verdicts für den Bereich und einer Anschau-Checkliste.
3. **Spezialisierte Macher-Agenten mit kleinem Kontext:** Kamera-Regie, Choreografie / Posing, Schnitt, Look (Licht +
   Farbe). Jeder bekommt nur: toki's Brief wörtlich, die Referenzbilder, seinen Skill, seine Aufgabe. Liefert einen
   Entwurf mit Bildern, nicht Code.
4. **Brief-Vertrag + Brief-Wächter.** toki's Brief wird in Kernsätze zerlegt (wörtlich), jeder Kernsatz bekommt "woran
   sieht man das im fertigen Video". Neuer Kritiker `brief-keeper` sieht NUR toki's Worte + Referenz + das echte Ergebnis,
   nie meine Übersetzung. Er läuft am Treatment, am Script, an jedem Board, an jedem Render. Alle anderen Kritiker
   bekommen die Kernsätze zusätzlich.
5. **Referenz neben Ergebnis.** Jedes Board, das toki sieht, hat links das Referenzbild, rechts unseres, oben ihr
   Kernsatz. Ein Agent vergleicht Palette, Licht, Grösse, Pose, Linse.
6. **Checks am echten Video statt am Plan.** Schnitte zählen per Szenenerkennung (eine Fahrt = 0 harte Schnitte),
   Kamerabewegung per Optical Flow, Raymi-Gesicht / Grösse / Position per Anime-Gesichtserkennung auf den echten Frames.
   Alle bestehenden Checks auflisten: welche prüfen nur den Plan -> ersetzen oder ergänzen.
7. **Harte Sperre im Code:** Kritiker- oder Brief-Wächter-FAIL -> das Auslieferungs-Skript gibt das Board / den Render
   nicht frei. Wenn toki trotzdem etwas sehen will, steht FAIL + Grund drauf.
8. **Machbarkeit zuerst.** Vor dem Script: für jeden Kernmoment (z. B. "Hand in die Linse") nachweisen, mit welchem Clip /
   Asset / Tool er gebaut wird. Fehlt etwas -> sofort sagen + Lösungen recherchieren (MMD-Kamera- und Motion-Daten,
   Blender-Previz, weitere Mocap-Quellen), nicht drumherum bauen.
9. **Kalibrierung an echten Fehlschlägen.** Das neue System muss Watch Me Run 60 / 62 / 67 / Board 2 und Beach Run 58
   durchfallen lassen und Renai / LGW / KING bestehen lassen. Erst dann gilt es als fertig - nicht wenn Tests grün sind.

## 4. Umgesetzt 2026-10-25 (toki: OK, mit Budget ~20 % Wochenlimit pro Video, Gemini auslagern, Kritiker an Profis)
| Punkt | Stand |
|---|---|
| 1 Gedächtnis | zusammengeführt im Studio-Memory (user-toki, learning-is-a-mechanism, craft-taste, ...) |
| 2 Skills | 12 Bereichs-Skills `.claude/skills/raymi-*`, raymi-reading-toki zuerst (Briefing-Hook) |
| 3 Macher | camera-director, choreographer, editor, look-designer (sonnet, kleiner Kontext) |
| 4 Brief-Wächter | `brief-keeper` + Schritt 0 `0_BRIEF.md` im Schreibraum; Treatment / Script brauchen seinen PASS |
| 5 Referenz neben Ergebnis | `raymi refs pair`; Bibliothek 31 Profi-Videos, Gemini-Analyse läuft (Gratis-Limit, ~4 Tage) |
| 6 Checks am echten Video | `raymi reality` (Schnitte, Kamerabewegung, Gesicht zur Linse, Grösse) gegen die Claims im Brief |
| 7 Sperre | `raymi gate` + SendUserFile-Hook: kein Bild / Video ohne GATE_PASS (oder FAIL offen beschriftet) |
| 8 Machbarkeit | `MISSING` im Brief hält den Job an, bis toki antwortet |
| 9 Kalibrierung | Watch Me Run 67: reality FAIL; Board 2: brief-keeper BLOCK - beide sagen, was toki sagte. Offen: die Profi-Referenzen müssen den reality-Check bestehen (braucht den 480p-Download) |
