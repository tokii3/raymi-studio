# Modul 09: Digitale Kunst und 3D

Stand: 2026-10-15, Version 1. Quellen-IDs [Qxx] siehe `Quellenregister_und_Luecken.md`.
Belegstufen: A = peer-reviewed/Primärstudie, B = Fachinstitution/seriöse Sekundärliteratur, C = populär/Blog/Wikipedia, D = eigenes Wissen, nicht geprüft.
Reine Wissenssammlung. Keine Anbindung an eine Engine.

---

## 1. Raster und Vektor

- Raster: Raster aus Pixeln, die je eine Farbe speichern. Auflösungsabhängig, verliert beim Vergrößern an Qualität. Passt zu Fotos und Bildern mit komplexen Farbverläufen. Formate: GIF, JPEG, PNG [Q802, C].
- Vektor: Formen und Linien als mathematische Beschreibung; skalierbar ohne Qualitätsverlust. Passt zu Schrift, Logos, Linienarbeit [Q802, C].
- Programme: Raster (Photoshop, GIMP, Krita, Clip Studio u.ä.), Vektor (Illustrator, Inkscape) [Q802, C; Zusatz zu Krita/Clip: D].
- Konsequenz: Charakter-Sprites sind meist Raster. Für Skalierung in Videoformaten (1080 x 1920) auf ausreichend große Quellauflösung achten (D).

## 2. Ebenen und Mischmodi (Blend Modes)

Mathematik der Mischmodi (a = untere Ebene, b = obere Ebene, Werte 0 bis 1) [Q174, C+]:
- Multiply: a x b. Immer dunkler; Weiß ändert nichts. Typisch für Schatten und Texturen.
- Screen: 1 minus (1 minus a)(1 minus b). Immer heller. Typisch für Glühen und Lichter.
- Overlay: Kombination aus Multiply und Screen; Mittelgrau der oberen Ebene ändert nichts; erhöht Kontrast.
- Soft Light: sanftere Variante von Overlay.
- Color Dodge: a geteilt durch (1 minus b), hellt stark auf, Lichter können ausbrennen.
- Add (Linear Dodge): Summe, über 1 wird Weiß. Für additive Lichteffekte.
- Color und Hue: übernehmen Farbton (und Chroma) der oberen Ebene, behalten die Helligkeit der unteren. Typisch fürs Umfärben bei gleicher Helligkeit.
Hinweis: Die Formeln stammen aus einer Zusammenfassung; konkrete Implementierungen unterscheiden sich je nach Software (Farbraum, Gamma) [Q174, C+].
Bezug: Cel-Shading mit Multiply-Schatten und Screen-Lichtern siehe Modul 02, Abschnitt 6.

## 3. Digitale Malerei: Workflow-Grundlagen (Überblick, D)

- Typischer Ablauf: Skizze, Linien (Lineart), Flächenfarben (Flats), Schatten/Licht, Rendering/Details, Farbkorrektur/Finish.
- Wert zuerst: Mit Graustufenentwurf arbeiten, Farbe danach (siehe Modul 01, Abschnitt 6: Wert vor Farbton).
- Reference und Moodboard vor Beginn (Industriepraxis, D).
- Stile: Cel-Stil (flach, harte Schatten), Painterly (weiche Übergänge, sichtbare Pinsel), Pixel Art (begrenzte Pixelraster), Lineless, Halbton/Manga-Raster (D).
- Nicht recherchiert: Pinseltypen, Druckempfindlichkeit, Stabilisierung, Farbmanagement-Details.

## 4. Farbmanagement (Kurz)

- Bildschirmdarstellung: sRGB als Standard-Farbraum für Web/Video (Modul 01, Abschnitt 1.4). Wide-Gamut-Displays können Farben abweichend darstellen; Export deshalb in sRGB (Praxis, D).
- Sichtprüfung auf dem Zielgerät (Handy) ist Pflicht, weil Displays Farben unterschiedlich zeigen (Kritiker-Grundsatz, siehe 00-Raster).

## 5. 3D-Pipeline

Überblick (Wikipedia-Zusammenfassung) [Q801, C]:
- Modellieren: Form aus Eckpunkten (Vertices) und Polygonen; auch Scannen, prozedural, Simulation.
- Materialien und Texturen: Farbe (Albedo), Oberflächendetail über Bump-/Normal-Maps; Displacement verformt das Modell.
- Animation: Keyframing, inverse Kinematik, Motion Capture, oft kombiniert.
- Rendering: Bild aus 3D-Szene, entweder physikalisch (Lichttransport) oder nicht-fotorealistisch (Stil), Echtzeit (VR, Spiele) oder offline.
- Compositing: Nachbearbeitung im Videoprogramm.
Nicht in der Quelle behandelt: Rigging und Beleuchtung als eigene Stufen (beide in anderen Quellen unten oder Lücke).

## 6. Rigging und Skinning

[Q804, C]:
- Rig: Hierarchie von Knochen (virtuelles Skelett) zum Posieren und Keyframen eines Meshes.
- Knochen haben eine Transformation relativ zur Bindepose und einen Eltern-Knochen; Kindknochen erben die Bewegung.
- Skinning: Zuordnung von Knochen zu Vertices; Gewichte (Blend Weights) erlauben weiche Verformung an Gelenken (Linear Blend Skinning).
- FK (Forward Kinematics): Rotationen aller Knochen definieren die Pose. IK (Inverse Kinematics): Zielgesteuert (z.B. Fuß am Boden platzieren).
- Blend Shapes (Morph Targets) für Mimik: in der gesichteten Quelle nicht behandelt, aus VRM-Doku bekannt (Gewichtung 0 bis 1) [Q306, C].
- Bezug 2D: Live2D nutzt Deformer und Parameter statt Skelett (siehe Modul 04).

## 7. Shading und PBR

- Physically Based Rendering: Rendering auf Grundlage realer Optik; "mehr ein Konzept als feste Regeln"; Alles reflektiert Licht (matt wenig, Metall und Flüssigkeiten viel); Messwerte realer Materialien setzen Bereiche für Albedo, Glanz, Reflektivität; Mikrofacetten erzeugen Glanzlichter [Q803, C].
- In der Quelle nicht belegt: Metallic-Parameter, Normal Maps als Pflichtbestandteil, Energieerhaltung (ausdrücklich nicht behandelt) (D).
- NPR (Non-Photorealistic Rendering): Toon-/Cel-Shading mit harten Schattenbändern, Outline (Inverted Hull), Rim Light (siehe Modul 02, Abschnitt 6) [Q172, C].

## 8. 3D-Licht und Kamera (Überblick)

- Lichtquellen: Sonne/Directional, Punkt, Spot, Fläche (weiche Schatten), Environment/HDRI (D).
- Kamera: Brennweite, Sensorgröße, Blende (Schärfentiefe), Fokus (Foto-/Filmwissen, D).
- 3D-Beleuchtung folgt derselben Lehre wie Modul 02 (Key/Fill/Rim).
- Nicht recherchiert: Global Illumination, Raytracing vs. Rasterisierung im Detail, Rendering-Kosten.

## 9. Warum gefällt es?

- Digital: Rückgängig-Funktion, Ebenen, Iteration erleichtern Perfektion; Gefahr: Gleichförmigkeit ("Slop"), wenn Standard-Pinsel und -Filter ohne Absicht benutzt werden (Einschätzung, D).
- 3D: Glaubwürdigkeit von Gewicht und Licht; Uncanny Valley (Mori, 1970) bei fast realistischen Figuren: nicht recherchiert (D).
- Stilisierung (Cel/NPR) umgeht das Uncanny Valley, weil Erwartungen anders gesetzt sind (Hypothese, D).

## 10. Kritiker-Checkliste Digital/3D

1. Vision: Welcher Stil und welche Wirkung?
2. Technik: Sind Ränder sauber (kein Halo, keine Treppen), Auflösung ausreichend?
3. Mischmodi: Wirken Schatten/Lichter natürlich oder wie Filter (zu graue Schatten, zu stark ausgebrannte Lichter)?
4. Konsistenz: Gleiche Linienstärke, gleiche Schattenlogik, gleiche Lichtquelle?
5. Farbe: Auf Zielgerät geprüft?
6. 3D: Gewichtung der Verformung an Gelenken, keine Durchdringungen?
7. Skeptiker: Wiederholt sich das Muster, wirkt es wie Template?
8. Fix-Liste nach Raster Phase 5.

## 11. Lücken

- Vektor-Formate, Bézier-Kurven, Anti-Aliasing, Farbtiefe nicht recherchiert.
- Digitale Pinseltechnik und Tablet-Workflows nicht recherchiert.
- KI-generierte Bilder: Eigenheiten, typische Fehler (Hände, Konsistenz), Artefakte und Prompt-Praxis nicht in dieser Runde recherchiert; relevant, weil das Projekt KI-Bilder nutzt (Prüfaufgabe).
- 3D-Software (Blender u.a.), Retargeting, Motion Capture nicht recherchiert.
- Uncanny Valley nicht recherchiert.
