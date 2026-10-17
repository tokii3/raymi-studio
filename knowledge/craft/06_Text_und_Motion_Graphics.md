# Modul 06: Text, Untertitel und Motion Graphics

Stand: 2026-10-15, Version 1. Quellen-IDs [Qxx] siehe `Quellenregister_und_Luecken.md`.
Belegstufen: A = peer-reviewed/Primärstudie, B = Fachinstitution/seriöse Sekundärliteratur, C = populär/Blog/Wikipedia, D = eigenes Wissen, nicht geprüft.
Reine Wissenssammlung. Keine Anbindung an eine Engine.

---

## 1. Rolle von Text im Video

- Untertitel haben zwei Funktionen: Barrierefreiheit (Gehörlose, Schwerhörige, Nichtmuttersprachler) und Tonlos-Konsum (viele schauen mobil ohne Ton; die Quote ist in Marketing-Blogs unterschiedlich angegeben und hier nicht als Fakt übernommen) [Q215, C-].
- Eingeblendeter Text dient auch als Hook (Frage/Behauptung in den ersten Sekunden), Betonung (Schlüsselwort hervorheben) und Gliederung.
- Gestaltungsprinzip: Text darf den Charakter nicht verdecken, muss aber in Kleinanzeige lesbar sein (Konfliktfeld, Kritikerprüfung).

## 2. Lesbarkeit: Was sagt eine Industrie-Richtlinie?

Netflix English Timed Text Style Guide (Industrie-Primärquelle, aber für Film/Serien, nicht für Shorts) [Q500, B-]:
- Lesegeschwindigkeit: bis zu 20 Zeichen pro Sekunde für Erwachsenenprogramme, bis 17 für Kinderprogramme.
- Zeilenlänge: höchstens 42 Zeichen pro Zeile, höchstens zwei Zeilen.
- Zeilenumbruch: nach Satzzeichen, vor Konjunktionen und Präpositionen; Artikel/Nomen, Adjektiv/Nomen, Vor-/Nachname, Verb/Pronomen nicht trennen; bevorzugt unten breitere (pyramidenförmige) Zweizeiler; keine Ein- bis Zweiwort-Oberzeile.
Hinweis: Die Zeichenzahlen sind für TV/Streaming begründet und nicht für kurze Social-Clips getestet. Als Obergrenze plausibel, aber Shorts-Zuschauer lesen kleiner Bildschirm (Hypothese, D).

Marketing-Quelle für Shorts (OpusClip-Blog, Eigeninteresse, keine Quellenangaben für die Zahlen) [Q215, C-]:
- Behauptete Praxiswerte: serifenlose fette Schrift, 5 bis 7 Wörter pro Zeile, maximal zwei Zeilen, Kontrast mindestens 4,5:1 (WCAG AA), Text in der mittleren Bildzone, Anzeigedauer etwa 0,3 s pro Wort plus 0,5 s. Alle diese Zahlen sind ungetestete Autorenregeln. Nur der WCAG-Kontrastwert selbst ist ein Standard (siehe Modul 01, Abschnitt 1.5).
- Prozentgewinne durch Untertitel ("12 bis 15 Prozent") sind ohne Studienangabe und werden nicht übernommen.

## 3. Typografie-Grundlagen

- Zentrierter Mehrzeilentext ist schwerer zu lesen, weil die Zeilenanfänge unregelmäßig sind; für Untertitel im Kurzformat (1 bis 2 kurze Zeilen) ist zentriert Konvention und akzeptabel [Q501, C; Anwendung D].
- Blocksatz erzeugt Löcher und Rivers, bei schmalen Spalten besonders; für Menschen mit kognitiven Einschränkungen schwer lesbar [Q501, C].
- Die gesichtete Quelle enthält keine Studien zur Lesbarkeit (nur Typografie-Handbücher und Richtlinien). Aussagen zu Schriftart-Vorteilen (serifenlos vs. Serif) sind deshalb nicht belegt (D).
- Hierarchie: Größe, Gewicht, Farbe, Platzierung unterscheiden Haupt- und Nebeninformation (Standard-Gestaltungslehre, D).
- Schrift trägt Stimmung: Handschrift/Rund = verspielt, Serifen = klassisch/ernst, Display/Blocksatz = Wucht. Das ist Konvention, nicht gemessen (D).
- Lizenz: Schriften haben Nutzungsrechte; für Kanalinhalte kommerzielle Lizenz prüfen (D).

## 4. Kinetische Typografie und Textanimation

- Prinzip: Text bewegt sich im Rhythmus der Sprache oder Musik (Wort für Wort, Betonung durch Skalierung/Farbe).
- Easing und Timing gelten wie in der Animation (siehe Modul 04, Abschnitt 2): lineare Bewegung wirkt mechanisch, Slow In/Out wirkt organisch.
- Typische Muster (Konventionen, D): Pop-in mit leichtem Overshoot, Wort-Highlight (aktives Wort farbig), Karaoke-Style, Shake bei Betonung.
- Risiko: Zu viel Bewegung lenkt von der Figur ab und erschwert das Lesen; der Schnitt-Rhythmus (Modul 03) und die Textbewegung sollen zusammenarbeiten.

## 5. Motion Graphics: Bausteine

- Keyframes + Interpolation (linear, Bezier/Easing).
- Ebenen, Masken, Parenting, Expressions (Programmier-Logik in Animationsprogrammen) (D).
- Standard-Elemente: Lower Thirds, Callouts, Icons, Formen-Animation, Partikel, Glitch, Shake (D).
- Stilkohärenz: Eine begrenzte Palette (Farbe, Schrift, Bewegungssprache) wirkt professionell, wechselnde Stile wirken beliebig (Lehrmeinung, D).
- Die Farbwahl folgt Modul 01: Kontrast zuerst über Wertunterschied, nicht nur über Farbton.

## 6. Warum gefällt es?

- Wahrnehmung: Bewegung und Kontrast ziehen Aufmerksamkeit; Text im Fokusbereich hilft Orientierung.
- Verarbeitungsleichtigkeit: kurze Zeilen, klare Kontraste lesen sich mühelos.
- Konvention: Karaoke-Highlighting ist durch Creator-Kultur gelernt; kann nach Überverwendung als "Slop" wirken.

## 7. Kritiker-Checkliste Text/Motion

1. Vision: Was soll der Text bewirken (verstehen, betonen, Hook)?
2. Lesetest im Kleinformat und bei kurzer Betrachtung: Wird alles gelesen, bevor es verschwindet?
3. Lesegeschwindigkeit: Zeichen pro Sekunde unter etwa 17 bis 20 (TV-Richtwert)?
4. Zeilen: höchstens 2, sinnvoll umbrochen, 42 Zeichen als Obergrenze?
5. Kontrast: WCAG-Kontrast mindestens 4,5:1; Text auch bei wechselndem Hintergrund lesbar (Kontur/Box)?
6. Position: Außerhalb der UI-Zonen, ohne Gesicht/Fokus zu verdecken?
7. Bewegung: Hat sie Easing, unterstützt sie Betonung oder lenkt sie ab?
8. Konsistenz: Gleiche Schrift-, Farb-, Bewegungssprache im Video und Kanal?
9. Skeptiker: Wirkt das wie eine fertige Vorlage ohne Bezug zum Inhalt?
10. Fix-Liste nach Raster Phase 5.

## 8. Lücken

- Keine Studie zu Lesbarkeit von Untertiteln auf Mobilgeräten gefunden.
- Schriftarten-Wirkung (Serif/Sans, Handschrift) nicht empirisch recherchiert.
- Barrierefreiheit über WCAG-Kontrast hinaus (Blitzgrenzen, Photosensitivität bei Flashing/Glitch) nicht recherchiert; wichtig für Glitch-Effekte (D).
- Shorts-Textsicherheitszonen: Zahlen schwanken; Prüfung in der App erforderlich.
- Typografie-Primärliteratur (Bringhurst) nicht gelesen.
