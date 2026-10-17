# Modul 12: KI-Bilder, typische Artefakte und Uncanny Valley

Stand: 2026-10-15, Version 1. Quellen-IDs [Qxx] siehe `Quellenregister_und_Luecken.md`.
Belegstufen: A = peer-reviewed/Primärstudie, B = Fachinstitution/seriöse Sekundärliteratur, C = populär/Blog/Wikipedia, D = eigenes Wissen, nicht geprüft.
Reine Wissenssammlung. Keine Anbindung an eine Engine.
Warum dieses Modul: Das Projekt nutzt KI-generierte Bilder (PixAI-Anfragen). Der Kritiker muss typische Fehler erkennen und benennen können.

---

## 1. Typische Fehler KI-generierter Bilder

Quellenlage: zwei Herstellerseiten (Runway, Cliprise) mit Eigeninteresse, ohne Tests, Stichproben oder Fehlerraten [Q920, Q921, C-]. Die Liste ist deshalb eine Praktikerliste, keine messbare Statistik. Plausible Ursachen sind Erklärungsversuche der Anbieter.

| Fehlerklasse | Beschreibung | Angeführte Ursache (unbelegt) | Angeführte Abhilfe |
|---|---|---|---|
| Hände, Finger, Anatomie | Zusätzliche/verschmolzene Finger, falsche Gelenke | Modell rät Gelenkstruktur statt Anatomie zu verstehen; Menschen sind sehr empfindlich gegenüber Gesichtsfehlern | Pose vereinfachen, Zuschnitt ändern, lokal reparieren |
| Gesichtsasymmetrie / Identitätsdrift | Gesicht ändert sich zwischen Bildern | Modell hält Identität nicht stabil | Saubere Referenz nutzen |
| Physikalisch unsinnige Objekte | Gegenstände ohne plausible Beziehung | Modell lernt Mit-Auftreten, nicht Physik | Räumliche Beziehung explizit beschreiben |
| Fehlende/unvollständige Objekte | Teile des Motivs fehlen (z.B. halbes Tier) | Fokus auf markante Merkmale | Grenzen im Prompt nennen (alles im Bildausschnitt) |
| Verzerrter Text/Logos | Buchstaben falsch, Wörter unlesbar | Modell erfindet Buchstabenformen; längerer, kleiner Text schlägt am häufigsten fehl | Text separat im Designprogramm ergänzen |
| Unmögliche Schatten / inkonsistente Reflexionen | Mehrere Lichtquellen, widersprüchliche Schatten | Konflikt in Lichtangaben | Eine Lichtquelle festlegen |
| Verschmolzene Grenzen | Elemente laufen ineinander | Dichte Überlappungen | Elemente trennen, Kanten nachbearbeiten |
| Wiederholte Objekte / Musterdrift | Muster verändern sich, Duplikate | - | Details reduzieren, nachbearbeiten |
| Hochskalierungs-Halos | Artefakte nach Upscaling | - | Ursprungsbild vor dem Upscalen reparieren |
| "Zu KI"-Look | Glatt, glänzend, unnatürlich perfekt, generischer Durchschnitt | Modelle erzeugen einen verallgemeinerten Durchschnitt | Spezifischen Kontext angeben (z.B. natürlich, Film) |
| Inkonsistenz bei Neugenerierung | Korrekte Details ändern sich | Neugenerierung | Bild mit beschriebener Änderung bearbeiten statt neu erzeugen |

Quelle zu Reparaturleiter (Cliprise): vom Billigsten zum Teuersten: akzeptieren/zuschneiden, Prompt vereinfachen, Referenz verbessern, lokal bearbeiten, neu generieren; Fehler zuerst als strukturell oder lokal einteilen [Q921, C-].
Hinweis: Anime-Stil-Modelle haben eigene Fehlerbilder (Augen-Asymmetrie, Haar-Linien, Kleidungs-Nähte, Hände). Diese sind hier nicht belegt (D, Prüfaufgabe).

## 2. Konsistenz zwischen Bildern (Charakter)

- Identitätsdrift (siehe oben) ist für einen wiederkehrenden Charakter zentral: Gesicht, Haarform, Farbpalette, Proportionen sollen über viele Bilder gleich bleiben.
- Belegte Techniken in den gesichteten Quellen: Referenzbild nutzen, Änderungen per Bildbearbeitung statt Neugenerierung [Q920, Q921, C-]. Weitere Techniken (Charakter-Embeddings, LoRA, Seeds) wurden nicht recherchiert (Lücke).
- Konsistenz-Kritiker (00-Raster): Vergleichstabelle mit festen Merkmalen (Augenfarbe, Haaransatz, Accessoires, Proportion) abhaken.

## 3. Uncanny Valley

[Q912, C]:
- Mori (1970): Je menschenähnlicher ein Roboter, desto positiver die Reaktion, bis "fast menschlich" starke Abneigung auslöst; danach Erholung bei kaum unterscheidbarer Menschlichkeit.
- Empirischer Status: Gestützt durch einzelne Studien (z.B. Mathur und Reichling: Likeability-Einbruch bei Roboter-Gesichtern; Saygin: fMRT-Fehlpassung bei Android mit unpassender Bewegung; Schein und Gray: fehlende Augen verstärken Unheimlichkeit mehr als fehlende Nase), aber Mechanismen uneinheitlich belegt; konkurrierende Erklärungen (Merkmalsabweichung, Kategoriekonflikt, Pathogenvermeidung u.a.); manche sehen Heterogenes oder Expositionshäufigkeit als Ursache; jüngere, CGI-gewohnte Betrachter weniger betroffen [Q912, C].
- Praxis: Realismus von Aussehen, Bewegung und Stimme aufeinander abstimmen; stilisierte, neotene Merkmale (große Augen, runde Proportionen) können das Phänomen vermeiden (Hanson, laut Quelle) [Q912, C].
- Relevanz für 2D-/Anime-Avatare: Stilisierung umgeht die Kategorieerwartung "echter Mensch"; Probleme entstehen eher bei Mischungen (realistische Bewegung bei stilisiertem Bild oder umgekehrt) (Ableitung, D).
- Relevanz für TTS-Stimmen: Natürliche Stimme bei stilisierter Figur oder roboterhafte Stimme bei lebensnaher Figur kann Abgleich stören (Hypothese, D).

## 4. Warum gefällt es? / Wo kippt es?

- KI-Bilder gefallen durch Glätte, Detaildichte und Glanz (Wahrnehmung: Verarbeitungsleichtigkeit), kippen aber, wenn kleine Fehler (Finger, Text, Symmetrie) auffallen oder Gleichförmigkeit sichtbar wird ("zu KI", Mere Exposure/Überdruss) (Ableitung aus Q952, Q953, Q920; D).
- Die Haltung des Publikums zu KI-Inhalten ist nicht recherchiert (Lücke). Sie beeinflusst Wirkung und Offenlegungspflichten stark.

## 5. Kritiker-Checkliste KI-Bilder

1. Vision: Welche Wirkung und welcher Stil? Wo darf KI-Look stören, wo nicht?
2. Fehlerscan in drei Zoomstufen (Gesamt, Gesicht/Hände, Details/Text).
3. Anatomie: Finger, Gelenke, Augen, Ohren, Haaransatz, Symmetrie.
4. Licht: Eine Lichtquelle, passende Schatten und Reflexionen (Modul 02).
5. Konsistenz: Gleiche Merkmale wie Referenz?
6. Text im Bild: lesbar und korrekt? (Besser separat setzen.)
7. Glättung/Gleichförmigkeit: Wirkt es generisch oder spezifisch?
8. Kantenqualität bei Hochskalierung (Halos).
9. Fix-Liste nach Raster Phase 5, mit Klassifikation strukturell oder lokal.

## 6. Lücken

- Keine neutrale oder wissenschaftliche Quelle zu Fehlerraten und Ursachen.
- Anime-spezifische Fehler und Modelle nicht recherchiert.
- LoRA/Embedding/Seed-Techniken für Charakterkonsistenz nicht recherchiert.
- Publikumshaltung zu KI-Kunst, Kennzeichnungspflichten und Urheberrecht nicht recherchiert.
- Uncanny-Valley-Studien nur über Wikipedia.
