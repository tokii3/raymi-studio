# VRM-Raymi statt PNG-Puppe - was ein kompletter Umstieg kostet (Phase 1, 2026-10-19)

Gebaut und geprüft (in keinem bestehenden Video ändert sich etwas):
- `assets/vrm/raymi3.vrm` (dein VRoid-Export, 25,7 MB - unter GitHubs 50/100-MB-Grenze, also kein Git LFS nötig).
- `@pixiv/three-vrm` 3.5.5 (passt zu three 0.169 / @remotion/three 4.0.532).
- `studio/src/three/VrmPuppet.tsx`: wird wie Puppet3D platziert (Füße auf dem Set-Boden, Höhe in Metern, zum
  Objektiv gedreht oder in Grad), MToon bleibt, Ausdrücke per Name (joy, angry, sorrow, fun, surprised, a/i/u/e/o),
  Augen schauen ins Objektiv, Blinzeln auf festen Frames, feste Schlüsselposen als Knochenrotationen
  (`vrmPoses.ts`: stand, point, crouch, arms_up - neue Pose = ein Eintrag).
- Spring Bones (Haare, Hasenohren, Schwanz) deterministisch: jeder Frame simuliert neu ab einem festen Start
  (3 s Fenster + Einschwingen), nichts wird zwischen Frames gemerkt -> parallele Worker sehen dasselbe Bild.
  Test: `node --test studio/test/vrm.test.mjs` (reine Mathematik, kein Rendern; Füße am Boden in jeder Pose,
  gleiche Pose in jeder Renderreihenfolge).
- Haut bleibt hell grau-blau (Regel 9): `lock` 0..1 verschiebt diesen Anteil ihrer Farbe vom beleuchteten in einen
  selbstleuchtenden Anteil (Default 0,6) - farbiges Set-Licht kann nur noch den Rest tönen.
- Board-Job `jobs/2026-10-19_vrm-test` (board.json -> Composition `VrmBoard`), nur Cloud-Stills.

## Was ein vollständiger Umstieg kostet

**1. Animationsquelle** (der größte Brocken)
- Prozedurale Schlüsselposen (jetzt da): billig, passt zu unserem "gehaltene Pose + Squash"-Stil, aber jede neue
  Geste muss von Hand in Knochenwinkeln geschrieben werden. ~0,5-1 h pro gute Pose, Iteration nur über Cloud-Stills.
- VRMA-Clips (VRoid Hub / VRM Posing / eigene Aufnahmen aus z. B. VRM Posing Desktop): three-vrm lädt sie direkt,
  sauberste Lösung für echte Bewegung (Laufen, Tanzen). Gratis-Quellen sind begrenzt; eigene Clips = ein Tool lernen.
- Mixamo-Retarget (gratis, Adobe-Konto nötig - fragt dich vorher): riesige Bibliothek (Tanz, Laufen, Jubeln), der
  Retarget-Code ist bekannt (three-vrm Beispiel), ~1 Tag Einbau. Lizenz: Mixamo-Animationen dürfen in eigenen
  Videos verwendet werden.
- Empfehlung: Posen-Bibliothek + Mixamo/VRMA für Bewegungsclips, beides als Daten in shots.json ("pose", "clip").

**2. Guards in `studio/src/film/check.ts` und `raymi/timeline.py`**
- Heute hängen ~37 Stellen in check.ts und ~49 in timeline.py an der Sprite-Anatomie (Kopfbox, top/feet,
  Schnittkanten, Billboard-Matrix). Mit VRM fällt "cut sprite edge" komplett weg (ein 3D-Körper hat keine
  Schnittkante) - das war eine der nervigsten Fehlerquellen.
- Gesicht / Figur / Hero-Boxen kommen dann aus Knochen: Kopf-Knochen + Radius = Gesichtsbox, alle Knochen = Figur,
  die Krone sitzt am Kopf-Knochen (dreht und neigt sich automatisch mit). Das geht im selben Node-Lauf wie heute:
  der Test oben lädt das Modell in 0,2 s ohne Browser. Aufwand: ~1-2 Sessions (Guards + Python-Compiler auf
  `vrm`-Keys umstellen, Sprites bleiben als zweite Puppe erhalten).

**3. Renderzeit auf Actions**
- Spring-Simulation: ~0,13 s CPU pro Frame (lokal gemessen, Mathe ohne Bild). Bei ~2,5 s pro 1080p-Frame heute
  (3D-Set) sind das ~5 %. Das Modell (54k Dreiecke, 20 MToon-Materialien) zu zeichnen kostet unter Software-GL
  mehr als ein Sprite-Quad. Die reine Zeichenzeit pro Frame steht nur im Actions-Log (ohne gh-Zugang hier nicht
  ablesbar): der ganze Lauf mit 29 Stills (Setup + Bundle + Rendern) war nach ~15 min fertig, also kein Ausreißer.
  Echte Zahl kommt aus dem ersten Pilot.
- Laden: 25 MB pro Worker-Start, einmal pro Seite (Sekunden, nicht Minuten).

**4. Was es bringt**
- Ein Körper aus jedem Winkel: Turntable, Top-down, Froschperspektive, Raymi läuft durchs Set - alles, was die
  Kritiker am "gemalten Sticker im 3D-Set" bemängelt haben, und jede neue Pose ohne neuen Sprite.
- Sie wird vom Set-Licht beleuchtet und wirft einen echten Schatten in ihrer Form.
- Ausdrücke + Mundformen = später Lippen-Sync aus dem Vocal-Stem möglich.
- Das VRM ist dein eigenes gebautes Modell (kein KI-Bild) und bleibt zwischen Videos identisch.

**5. Was es kostet / Risiken**
- Der Look ändert sich: VRoid-Anime statt deiner gemalten Sprites. Ob das noch "Raymi" ist, entscheidest du an den
  Boards (Vergleichskacheln `*_vs_sprite`).
- Der VRoid-Standard-Look kann generisch wirken (Anti-Slop-Test: "könnte das jede VTuberin sein?"). Ihr Körper
  (Rochen-Form, Leuchtpunkte, Tako-Ohren) muss im Modell stärker werden - das ist Modell-Arbeit in VRoid, nicht Code.
- **Lizenz im VRM:** die Metadaten sagen `commercialUssageName: Disallow`, `allowedUserName: OnlyAuthor`,
  `Redistribution_Prohibited`. Du bist die Autorin, also okay für jetzt - aber stell beim nächsten Export in VRoid
  "Kommerzielle Nutzung: erlaubt" ein, bevor monetarisierte Videos (ab 1. Feb 2027) damit laufen.

## Was die Boards zeigen (boards/overview.jpg, 29 Cloud-Stills)
- Funktioniert: Turntable von allen Seiten (Schwanz + Ohren hängen über Spring Bones), alle 4 Posen lesen sich,
  Füße stehen mit Schatten auf dem Boden, Ausdrücke (joy, angry, sorrow, fun, surprised) klar, Augen ins Objektiv.
- Haare sind knallig blau-violett und die Haut sehr hell lavendel: **das kommt aus den Texturen deines Modells**
  (geprüft), nicht aus dem Licht. Die Sprites haben schwarze Haare mit hellem Verlauf - neben dem Sprite
  (`*_vs_sprite`) sieht man, dass das zwei verschiedene Raymis sind. Das ist die eigentliche Frage an dich.
- Haut im hellen Aquarium etwas überbelichtet (lock 0,6 + Grade). Feinjustierung (lock ~0,4-0,45) ist eine Zeile,
  mache ich erst, wenn du die Richtung willst.
- Neben dem Sprite wirkt das VRoid-Modell schlichter: weniger Haarvolumen, Standard-VRoid-Gesicht, die
  Rochen-Silhouette fehlt. Das ist Modellarbeit in VRoid (Haare dunkler/voluminöser, ihr Gesicht, Körpermerkmale).

## Vorschlag
Phase 2 nur, wenn dir die Boards gefallen: (a) VrmPuppet in den Film (shots.json `"raymi": [{"vrm": ..., "pose":
...}]`), (b) knochenbasierte Guards, (c) Mixamo/VRMA-Clips. Etwa 3 Sessions bis zum ersten Pilot mit VRM-Raymi.
