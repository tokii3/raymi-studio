> Copied 2026-10-18 from the old engine (jobs/2026-10-04_pop-in-2-day: shots.txt story header + AUDIT.md) as evidence. Engine paths in it do not exist here.

# POP IN 2 - the story (from the shot list header)

STORY (approved by toki 2026-10-03, storyboard_v3.jpg in the old job):
  You (the dashed figure) carry Raymi as an acrylic stand. It is not enough for her: she comes alive and pops into
  your whole day - bedroom, train, classroom, kitchen, sofa - first cute, then clingy. At night there is a concert:
  the roles flip, SHE searches for YOU in the crowd and finds you. On the train home she falls asleep on your
  shoulder; in bed she is a stand on your nightstand again - and winks.
ACTS = times of day = locations: morning bedroom > train > school > evening home > concert > backstage > finale >
  night train + bedroom. The letterbox stays while she is "only merch" / hiding; it opens when she is alive.
Every location is a real 3D set (engine/mv_world.py), the moments play inside them (w=<location>).

# POP IN 2 v3 - Audit jedes Moments (toki's Methode: Was ist das? Was soll es zeigen? Wie geht es besser?)

## Die Grundprobleme hinter toki's Beispielen (gelten fuer ALLES)
1. **Statisch** (Aufsteller im Zimmer): ein Element ist da, aber es passiert nichts. -> Jede Figur und jedes Prop
   bewegt sich im Takt oder reagiert auf das Wort.
2. **Erste Idee = Platzhalter** ("Du"-Maennchen): das Element funktioniert, ist aber nicht zu Ende gedacht.
   -> Pro Element fragen: wie liest es sich besser (Bewegung, Zeiger, Kontrast, Groesse)?
3. **Unsaubere Geometrie** (Schildmast): Dinge sitzen nicht da, wo sie physisch hingehoeren. -> Jedes Prop pruefen:
   Mast mittig, Deckel auf Kiste, Figur auf Boden/Sitz, Schatten am Fuss.
4. **Ueberbenutzung macht es zufaellig** (Raster): ein Mittel ueberall = kein Mittel. -> Gilt auch fuer meine Motive:
   Hosentasche 8x, Trio 5x, Pappkarton 5x, pop_hero 5x, Augenschlitz 5x, Kacheln 3x, BOY 3x -> halbieren.
5. **Stumpfe Farben** (grau/schwarz): -> farbige Schatten, Licht aus der Szene, keine Grauwerte.
6. **Zu klein / unlesbar**: Wichtiges muss sofort gesehen werden (Aufsteller, Du, Raymi in weiten Bildern).
7. **Kulisse als Tapete** (neu erkannt): in vielen Momenten klebt Raymi als Sticker VOR einem unscharfen Raum.
   Sie wohnt nicht darin. -> Sie steht auf dem Boden, sitzt auf dem Tisch, hat Schatten, der Raum ist scharf.
8. **Story-Bruch**: abstrakte Bilder (Spirale, Ringe, Hypnose, Himmel/Hoelle) ohne Bezug zum Ort.
   -> Nur dort, wo es Kopfkino ist, und dann sichtbar als Gedanke (Rahmen/Blase) - sonst in den Ort holen.

## Pro Moment (Ist -> Soll -> Besser)
| Moment | Ist | Schwaeche | Besser |
|---|---|---|---|
| wake | Zimmer morgens, Kamera faehrt zum Aufsteller | Aufsteller winzig, Fahrt endet zu weit | Fahrt endet nah am Aufsteller, Sonnenstrahl faellt genau auf ihn |
| alarm | Handy-Wecker mit Titel | Handy schwebt vor unscharfem Zimmer | Handy liegt/vibriert auf dem Tisch, Hand-Fokus, Kacheln aus dem Display |
| blink | Aufsteller zwinkert, BOY! | gut | BOY als Sprechblase vom Aufsteller |
| pack | springt in Tasche | gerade gebaut | ok, pruefen in Bewegung |
| zipper | Taschen-Innen, Augen im Reissverschluss | Taschen-Innen leer | Innenfutter-Muster, Gegenstaende (Handy, Schluessel) als Silhouetten |
| trainmap | Zug, Linienplan | Du klein am Rand | Du + Tasche im Vordergrund, Plan leuchtet pro "doko" |
| reflect | Spiegelung im Fenster | gut (toki) | Du ebenfalls als Spiegelung, Stadt laeuft schneller durch |
| crowd w=train | Wimmelbild vor unscharfem Zug | Tapete; Kopien schweben | Kopien sitzen auf den Baenken des scharfen Zugs |
| seats | sie springt von Sitz zu Sitz | ok | Du sichtbar, sie schaut dich an |
| lean | lehnt an deiner Schulter | Du-Figur klebt neben ihr | beide sitzen, sie kippt im Zuggeschaukel |
| box2 w=train | Springkiste | Kiste im Gang ohne Boden-Schatten | Kiste steht auf dem Zugboden, Deckel trifft Haltegriff |
| capture | Gesicht + Zielkreuz | ok | Zielkreuz = Kamerasucher deines Handys (Rahmen, REC) |
| shelf w=classroom | Regal mit Aufstellern | Regal schwebt vor Tafel | Aufsteller stehen auf DEINEM Pult, echte Raymi kommt durch die Tuer |
| stuck w=classroom | Sticker-Wand | klebt vor Tafel | Sticker kleben AUF der Tafel / deinem Heft |
| bite | Bild wird weggebissen | Hintergrund abstrakt pink | Klassenzimmer wird weggebissen -> Refrain-Klassenzimmer dahinter |
| pop_hero (5x) | Sticker + Spritzer | Ueberbenutzt, Tapete | 2x behalten; sonst: sie steht auf dem Lehrerpult |
| eyes / wink / heart / you | Nahaufnahmen | Tapete | ok als Nahaufnahmen, aber Hintergrund scharf + passend (Tafel mit Herz) |
| trio (5x) | 3 Raymis tanzen | Ueberbenutzt | 2x; einmal auf den Pulten, einmal auf der Buehne |
| sheet | Stickerbogen | abstrakt | Stickerbogen = dein Heft auf dem Pult |
| rings | Beat-Ringe | Story-Bruch | ersetzen: Kreide-Kreise auf der Tafel um sie |
| beside | Bank + Du | Bank vor Klasse | sie sitzt am Nachbarpult neben dir |
| jeans (8x) | Hosentasche | viel zu oft, Tasche schwebt | 3x; Tasche gehoert zu DIR (Du-Figur, deine Hose) |
| tiptoe (5x) | Karton laeuft | 5x, schwebt | 2x; laeuft durch den Gang zwischen Pulten |
| tumble | Fussabdruecke | schwach lesbar | Schulranzen/Buecher fallen auf sie, Sterne |
| hideboy | zaehlt | ok | sie zaehlt an der Tafel (Versteckspiel in der Klasse) |
| pyon | Sprung mit Nachbildern | ok | Sprung ueber die Pultreihen |
| gift | Anhaenger 2U | schwebt | Anhaenger haengt am Haltegriff im Zug |
| marquee/peekbar/boy/sneak | Titel-Ruf | 13x insgesamt = Fuellmaterial | halbieren, im Zug: Kacheln = Leuchtschrift-Anzeige |
| slot (5x) | Augenschlitz | 5x | 3x (Anfang, Bruecke, Ende) |
| back | Hinterkopf + Schild | Schild war schief (gefixt) | Schild = Bahnhofsschild im Zug-Abend |
| hug | Plueschumarmung | ok | auf deinem Bett, Abendlicht |
| upturn | 3 Augenschlitze | abstrakt schwarz | Spiegelschrank im Bad / 3 Handyfotos |
| shake | Shaker | ok | Kueche scharf, sie steht an der Theke |
| swirl | Bonbonspirale | Story-Bruch | Topf auf dem Herd, sie ruehrt, Dampf-Herzen |
| tv x2 | TV-Moment | gut | Du auf dem Sofa staerker, Fernbedienung |
| mirror | Handspiegel | ok | auf dem Schreibtisch |
| star | Sternschnuppe | Story-Bruch | Blick aus deinem Fenster: sie reitet auf der Sternschnuppe vorbei |
| ages / formula | Fotos / Tafel | ok | Hausaufgaben auf deinem Schreibtisch |
| dontgo/gauge/tangle/pingpong | Abend-Zimmer | Tapete | im scharfen Zimmer, Boden-Schatten |
| hypno/frust | Spirale / Kritzel | Story-Bruch | als Gedankenblase ueber dir im Zimmer |
| vanish/ticket | sie verschwindet, Ticket | gut | Ticket faellt langsam, Kamera folgt |
| hall_oi / call | Konzert | gut | Du in der Menge markiert |
| tear / eyes / capture / pop_hero in der Halle | uun-POP IN | abstrakt | Vorhang reisst auf der Buehne |
| search | Rollentausch | Du jetzt gross | ok |
| play/dressup/updown/heavenhell/orbit | Garderobe | updown + heavenhell abstrakt | updown: Spiegel-Grimassen; heavenhell als Kostuemwahl (Engel/Teufel-Kostuem am Staender) |
| heartbeat/door | Herzschlag, Tuer | gut | Tuer = Buehnentuer der Garderobe |
| dada | Schrift | Timing gemessen | Schrift auf der LED-Wand der Buehne |
| memories/parade/gauge/trio big | Finale | gut | Parade auf der Buehne |
| lean (Nacht) / goodnight | Heimweg, Nachttisch | gut | sie schlaeft am Fenster, Stadtlichter |
