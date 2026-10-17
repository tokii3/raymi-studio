# Modul 04: 2D-Animation (Grundlagen, Anime-Praxis, Live2D/VTuber)

Stand: 2026-10-15, Version 1. Quellen-IDs [Qxx] siehe `Quellenregister_und_Luecken.md`.
Belegstufen: A = peer-reviewed/Primärstudie, B = Fachinstitution/seriöse Sekundärliteratur, C = populär/Blog/Wikipedia, D = eigenes Wissen, nicht geprüft.
Reine Wissenssammlung. Keine Anbindung an eine Engine.

---

## 1. Die zwölf Prinzipien der Animation

Herkunft: Ollie Johnston und Frank Thomas, "The Illusion of Life: Disney Animation" (1981). Das Buch selbst wurde nicht eingesehen; die Liste stammt aus Sekundärseiten, die untereinander übereinstimmen [Q300, Q301, C]. Eine Studie über die Wirksamkeit der Prinzipien (im Sinne von "Zuschauer finden Animation besser") wurde nicht gefunden. Die Prinzipien sind Handwerksüberlieferung eines Studios, kein Naturgesetz.

1. Squash and Stretch: Verformung vermittelt Gewicht und Biegsamkeit; das Volumen bleibt scheinbar erhalten.
2. Anticipation: Vorbereitende Gegenbewegung macht die Hauptaktion glaubwürdig und lesbar; weglassen = Überraschungseffekt.
3. Staging: Die Szene so zeigen, dass Idee, Aktion oder Stimmung unmissverständlich klar ist. Entspricht dem Fokus-Gedanken aus Komposition (Modul 05).
4. Straight Ahead und Pose to Pose: Frame-für-Frame von vorn nach hinten (spontan, lebendig, schwer kontrollierbar) gegen Schlüsselposen zuerst und Lücken füllen (kontrolliert).
5. Follow Through und Overlapping Action: Teile laufen nach dem Stopp weiter und bewegen sich mit unterschiedlicher Geschwindigkeit (Haare, Kleidung, Ohren).
6. Slow In und Slow Out: Mehr Zwischenbilder nahe den Extrempositionen; Bewegung beschleunigt aus Posen heraus und bremst hinein.
7. Arcs: Natürliche Bewegung folgt gebogenen Bahnen; mechanische Bewegung ist die Ausnahme.
8. Secondary Action: Zusatzbewegung, die die Hauptaktion stützt, ohne sie zu überlagern.
9. Timing: Anzahl der Frames einer Aktion. Bestimmt Geschwindigkeit, Gewicht, Stimmung und Persönlichkeit.
10. Exaggeration: Übertreibung von Aktion oder Merkmalen, die die Szene im Gleichgewicht lässt.
11. Solid Drawing: Volumen, Gewicht und Balance; keine "Zwillinge" (spiegelsymmetrische Posen).
12. Appeal: Charisma. Die Figur wirkt real und interessant, auch ein Bösewicht.

Verbindung zur Kritik: Appeal gehört zu "warum gefällt es". Niedlichkeit hat Forschungsbasis (Kindchenschema, siehe 00_Kritiker-Raster), die anderen Aspekte von Appeal (Charisma, Persönlichkeit) sind nicht operationalisiert.

## 2. Timing und Spacing

- Timing: wie lange eine Aktion in Frames oder Sekunden dauert. Spacing: wie weit sich ein Objekt zwischen Frames bewegt [Q302, C-].
- Easing entsteht über Spacing: enge Abstände am Anfang/Ende, weite in der Mitte [Q302, C-].
- Beispiel aus der Quelle: Ein Fall in 6 Frames bei 24 fps dauert 0,25 s und wirkt schnell und leicht; 24 Frames sind 1 s und wirken langsam und schwer [Q302, C-]. Gewicht ist demnach überwiegend Timing. Diese Faustregel ist Lehrmeinung, nicht gemessen.
- Allgemein: Weit auseinander liegende Positionen lesen sich schnell, eng beieinander langsam und weich [Q302, C-].

## 3. Frame-Raten und Anime: Ones, Twos, Threes

- Film läuft mit 24 Bildern pro Sekunde. "Ones" = neue Zeichnung jedes Bild (24 Zeichnungen/s), "Twos" = jede Zeichnung 2 Bilder (12/s), "Threes" = 3 Bilder (8/s), Fours/Fives für nahezu statische Szenen [Q303, C+].
- Anime wird häufig auf Threes aus Budgetgründen animiert; die Rate wird pro Szene gewählt (Actionszenen oft Twos oder Ones) [Q303, C+]. Das ist Teil dessen, was "Limited Animation" bedeutet: Zeichnungen sparen, Haltepunkte, wiederverwendete Zyklen, Mundphasen statt voller Bewegung (Einordnung, D; die Fachquelle nennt nur das Raten-Prinzip).
- Gestalterisch wichtig: Weniger Zeichnungen sind kein Qualitätsmangel an sich. Gute Limited Animation setzt Posen, Timing und Haltepunkte bewusst (D).
- Warum gefällt es: Das gelernte Anime-Sehen (Haltepunkte, Impact Frames, Speedlines) ist Genre-Konvention. Zuschauer lesen sparsame Animation als Stil, solange Timing und Posen stimmen (Einschätzung, D).

## 4. Typische 2D-Animationstechniken (Überblick)

- Cel-/Frame-by-Frame (traditionell oder digital).
- Cutout-Animation: Figur aus Teilen (Kopf, Arme, Beine) wird bewegt; schnell, aber Gefahr steifer Wirkung ohne Overlapping und Arcs (D).
- Rig-Animation (Skelett) in 2D-Programmen (D).
- Mesh-Deformation-Rigging, Live2D-Prinzip: ein illustriertes Bild wird in Teile getrennt und über Deformer und Parameter animiert (D, Prinzip aus Parameterlisten ableitbar, siehe Abschnitt 5).
- Motion Graphics / Tweening (Interpolation zwischen Keyframes mit Easing-Kurven), siehe Modul 06.

## 5. Live2D, PNGTuber und VTuber-Avatare

Technische Fakten aus Dokumentationen (C bis B-, Herstellerdoku):
- Live2D-Standardparameter: Augen (ParamEyeLOpen/ROpen, ParamEyeBallX/Y, Smile-Parameter), Brauen (Y, Form, Winkel), Mund (OpenY, Form), Kopfwinkel (AngleX/Y/Z als Yaw, Pitch, Roll), Körper (BodyAngleX/Y/Z), Atmen (ParamBreath) [Q304, C].
- Modelldateien: Definition (.model3.json), Texturen, Motions, Expressions, Physics-Einstellungen [Q306, C].
- VTube Studio: Jeder Parameter wird von genau einem Wertlieferanten gesteuert, der höchste aktive gewinnt: Standardwert, Idle-Animation, Face Tracking, einmalige Animation, Expression, Physics als höchste Priorität; Übergänge werden weich überblendet [Q305, B-/C+ (Herstellerwiki)].
- Idle-Animation = Standard-Bewegung bei stehender Figur, VRM-Modelle nutzen Blendshapes mit Gewichtung 0 bis 1 [Q306, C].
- Lip Sync für Live2D in der gesichteten Doku nicht beschrieben; Mundöffnung ist ein Parameter, den man audiogesteuert setzen kann (Ableitung, D).
- PNGTuber: Wenige Standbilder, Wechsel nach Sprechen/Nicht-Sprechen und evtl. Emotion; extrem günstig, funktioniert über Wiedererkennbarkeit (D).

Gestaltungswissen (D, nicht geprüft, aus Gesamtbild abgeleitet):
- Leben im Standbild: Atmen, Blinzeln in unregelmäßigen Abständen, kleine Kopfbewegungen, Haar-/Kleidungsphysik. Perfekt regelmäßige Zyklen wirken mechanisch.
- Blinzeln: kurz (wenige Frames), unregelmäßig.
- Ausdruck: Mimik ist Kombination aus Augenform, Brauen, Mund; die Lesbarkeit im Kleinformat verlangt klare Extrempositionen.

## 6. Transitions und Effekte im Animationskontext (Überblick)

- Impact Frames, Speedlines, Smear Frames, Hold Frames sind Anime-Konventionen für Wucht/Tempo (D, Quellenlage: Fan-/Lehrmaterial nicht in dieser Runde geprüft).
- Parallax (Ebenen mit unterschiedlicher Geschwindigkeit) erzeugt Tiefe in 2D (D).
- Squash/Stretch in 2D-Sprites: zeitlich kurz einsetzen, Volumen halten (D).

## 7. Warum gefällt es? (Schichten)

- Wahrnehmung: Bewegung zieht Aufmerksamkeit; glatte, bogenförmige Bewegung wirkt organisch (Arcs, Slow In/Out; Lehrmeinung, D).
- Biologie: Kindchenschema und große Augen bei Charakteren (siehe 00-Raster, Q31).
- Kultur/Genre: Anime-Konventionen sind erlernt; "Lebendigkeit" einer Figur wird an Mikrobewegung (Blinzeln, Atmen) erkannt.
- Konvention: VTuber-Zuschauer erwarten Reaktivität (Mimik folgt Sprache/Emotion).

## 8. Kritiker-Checkliste 2D-Animation

1. Vision: Welche Persönlichkeit/Emotion soll die Bewegung zeigen?
2. Lesbarkeit der Pose (Silhouette), auch in kleinem Maßstab.
3. Timing: Passt Dauer zum Gewicht und zur Emotion? Gibt es Anticipation und Follow Through?
4. Easing: Gibt es Slow In/Out oder wirkt es linear/mechanisch?
5. Bögen: Folgen Kopf/Arme/Haare Bögen?
6. Mikrobewegung: Gibt es Atmen, Blinzeln, Idle? Sind sie unregelmäßig genug?
7. Konsistenz: Gleiche Frame-Rate-Logik in der Szene (nicht Mischung aus Twos und Ones ohne Grund)?
8. Mimik: Lesbar im Kleinformat, passend zum gesprochenen Inhalt?
9. Skeptiker: Wirkt es wie Schablone oder wie eine gedachte Figur?
10. Fix-Liste nach Raster Phase 5.

## 9. Lücken

- Originalquelle (Thomas/Johnston) nicht gelesen; Richard Williams "Animator's Survival Kit" nur als Suchtreffer gesehen (D).
- Keine Studie zur Wirkung von Animationsprinzipien auf Zuschauer gefunden.
- Anime-Produktionspipeline (Genga, Douga, Satsuei) nicht belegt recherchiert.
- Live2D-Rigging-Praxis (Deformer, Warp, Rotation, Glue) nur auf Parameterebene.
- Lip-Sync-Methoden (Phoneme, Viseme) nicht recherchiert.
- Uncanny-Valley-Forschung für Avatare nicht recherchiert.
