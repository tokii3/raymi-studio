# Such- und Tag-Intelligenz (Stand 2026-10-02, erste Auswertung: YOASOBI-Idol-Short)

Zweck: Tags, Titel und Beschreibung kommen kuenftig aus ECHTEN Suchbegriffen statt aus Bauchgefuehl.
Gilt zusaetzlich zu `08_Kanal-Analyse-2026-09.md` und `engine/channel_rules.py` (bei Widerspruch gilt die
strengere Regel; die Blockliste bleibt bindend). Rohdaten: `brain/search_terms.json` + `brain/analytics/`.
Werkzeug: `engine/tools/search_terms.py` (ingest / report / tags / engaged). Alles hier ist eine Stichprobe
von EINEM Video - Richtung, kein Gesetz. Nachpruefen mit dem naechsten Export (~14.10.).

## 1. Datenbasis
Video: Short "Lie or truth? YOASOBI - Idol, animated by a Stingray VTuber" (32 s), Studio-Werte vom 2026-10-02.
- 1.128 Views (typischer Kanalbereich 10-120), 1,6 h Wiedergabezeit, Ø 0:15 = 47 %, 0 neue Abos,
  Suche: 2.462 Impressionen / 0,7 % CTR.
- Quellen: Shorts-Feed 946 (84 %, Ø 0:14), Suche 128 (11 %, Ø 0:13), weitere Funktionen 54 (5 %, Ø 0:28), Browse 0.
- Suchbegriff-Export (nur 2026-10-01): 58 Suchviews, davon 33 einzeln aufgelistet, 25 von YouTube in den
  Long Tail versteckt (Datenschutzschwelle). Das ist also eine Stichprobe der Stichprobe.

## 2. Befunde (Sicherheit in Klammern)
1. **Song-Videos ziehen Suchtraffic.** 11 % Suche gegen 2,6 % Kanal-Baseline (brain/08). Suche ist hier ein
   echter Kanal, bei Lore-Shorts nicht. Tags/Titel/Beschreibung zaehlen bei Song-Videos also wirklich. (hoch)
2. **Alle Suchen sind Song-Absicht.** Kein einziger Begriff mit Raymi / VTuber / Stingray. Die Leute suchen
   YOASOBI, nicht uns. Entdeckung laeuft ueber die Marke des Songs, nicht ueber unsere. (hoch)
3. **Spezifisch schlaegt generisch.** "idol yoasobi" (9 Views): 12 s / 39 %. "yoasobi" allein (11 Views): 6 s / 20 %.
   Generische Sucher wollen das Original und wischen weg; wer Songnamen + Artist tippt, bleibt doppelt so lang.
   (mittel: n=20 Views, Richtung klar)
4. **Reihenfolge-Varianten tauchen einzeln auf**: "idol yoasobi", "yoasobi idol", "idol yoasobi dance", "yoasobi song",
   "yoasobi cover". Beide Wortfolgen als Tag fuehren. (mittel)
5. **Franchise-Begriffe haben Nachfrage**: "yoasobi oshi no ko" (11 s / 34 %), "ai hoshino song" (Figur, nicht KI).
   Auch Nachbarlieder des Artists werden gesucht ("sakihokore yoasobi"). (niedrig: je 1 View)
6. **Rauschen** (odyssey oled g6, no descendo, anta kai 3, c9ダンス): ignorieren. Ein-View-Begriffe sind nur
   Hinweise, nie Entscheidungsgrundlage.
7. **Engaged-Anteil ~34 %, also ~66 % Absprung.** Views zaehlen bei Shorts seit 31.03.2025 jeden Start;
   Ø-Dauer und Retention gelten nur fuer engaged Views (bei zwei Quellen geprueft). Darum passen 0:15 und 1,6 h
   nicht zusammen: 1,6 h / 1.128 = ~5 s pro Start. Rueckgerechnet: Wiedergabezeit / Ø-Dauer / Views = 34 %;
   die Zip (0,049 h, 9 s, 58 Views) ergibt ebenfalls 34 %. Das ist EINE BERECHNUNG, kein Studio-Wert -
   gegenpruefen mit "Gesehen vs. weggewischt" (Studio > Engagement). Vergleich: Salmon-Short 29-37 %. Hook-Quote
   hat sich trotz Engine-Arbeit nicht bewegt. (mittel)
8. **0 Abos aus 1.128 Views.** Feed-Konversion im Kanal ~0,8 je 100 Aufrufe, Kanalseite ~12 je 100 (brain/08).
   Song-Zuschauer kennen Raymi nicht und es gibt keine Bruecke. Reichweite ohne Bindung. (hoch)
9. Shorts-Suchviews entstehen nicht ueber Thumbnail-Klicks (0,7 % von 2.462 = ~17 Klicks, aber 128 Suchviews):
   die CTR ist bei Shorts keine brauchbare Kennzahl. (mittel)
10. "Weitere Funktionen" Ø 0:28 (~88 %) - kleine Stichprobe, vermutlich Sound-/Remix-Seiten. Nicht sicher. (niedrig)

## 3. Tag-Regelwerk v2 (gilt zusaetzlich zu brain/08, Blockliste bleibt)
Reihenfolge der Quellen: 1. echte Suchbegriffe (`search_terms.py tags <thema>`), 2. YouTube-Autovervollstaendigung /
vidIQ-Keywords, 3. eigene Ideen. Immer in dieser Reihenfolge, nie umgekehrt.

**Song-/Musikvideos (Lyric-Video + Short):**
1. Genaue Phrase in beiden Wortfolgen als erste Tags: `<song> <artist>` und `<artist> <song>`.
2. Absichts-Varianten: `<song> lyrics`, `<song> romaji`, `<song> english lyrics`, `<song> lyric video`; fuer Shorts
   zusaetzlich `<song> <artist> dance` / `animation`. "cover" nur, wenn es wirklich ein Cover ist (Original-Audio = kein Cover).
3. Franchise / Figur: z. B. `oshi no ko`, `推しの子`, `ai hoshino` (Eigenname, kein KI-Hinweis).
4. Rollen-Tags: `vtuber` (+ optional `Touyami Raymi`). NIE 'stingray vtuber' im Titel (toki 2026-10-04: so schreibt
   niemand) - Titel-Regeln stehen in brain/12_Titel-und-Beschreibung.md.
5. Nur ein generischer Artist-Tag (`YOASOBI`). Er bringt Reichweite, aber Abspringer; nie den Titel darauf bauen.
6. Hoechstens ein Tippfehler-Tag (z. B. `yaosobi`) - Nutzen laut YouTube gering, weiss ich nicht sicher. Kein Pflicht-Tag.
7. Nachbarlieder des Artists NICHT als Tags (Fremdversprechen), aber in der Beschreibung des Voll-Videos erwaehnbar.
8. Neu in der Blockliste (Tool): `ai cover / ai voice / ai generated` (Persona: nie "AI"). `ai hoshino` bleibt erlaubt.
   TODO fuer die Engine: dieselbe Regel in `channel_rules.TAG_BLOCK` / `mv_job.persona_issues` pruefen (siehe BACKLOG).

**Alle Videos:** Tags 8-12, ein Hashtag-Trio (Thema, #vtuber, #envtuber), keine Sammel-Tags (bestehende Regeln).
Beschreibung Zeile 1 enthaelt die genaue Hauptphrase (Songname + Artist bzw. Themenwort) und bei Song-Videos das
Franchise-Wort. Titel: Rolle ("Stingray VTuber") bleibt Pflicht in mindestens einer Option.

**Titel-Test (offen):** Der Idol-Short beginnt mit dem Hook ("Lie or truth?"), die Suchphrase steht in der Mitte.
Beim naechsten Song-Short Option "Phrase zuerst" (`Idol - YOASOBI | ...`) gegen "Hook zuerst" testen, EINE Aenderung
pro Video. Ob die Wortposition im Titel fuer Suche eine Rolle spielt, weiss ich nicht sicher.

**Entscheidung pro Suchbegriff (automatisch im Tool, mind. 5 Views):** Ø-Prozent >= 115 % der Baseline = PROMOTE
(in Titel/Beschreibung/erste Tags); <= 75 % = demote (hoechstens 1 Tag); dazwischen keep; < 5 Views = Hinweis.

## 4. Bruecke Song-Reichweite -> Raymi (Hypothesen, jeweils mit Messung)
- H1: Song-Shorts brauchen eine Bruecke. Test: angepinnter Kommentar stellt Raymi vor + Link-Hinweis auf Lore-Short;
  "Verwandtes Video" = Voll-Lyric-Video (steht schon in upload.json). Messung: Abos je 100 Views, Kanalseiten-Aufrufe.
- H2: Hook-Quote: Song-Suchende wollen sofort die Musik. Test: erster Frame = Song-Moment/Refrain-Text statt
  Erklaer-Einstieg. Messung: Engaged-Anteil (Ziel >= 40 %, Vorschlag, nicht abgestimmt).
- H3: Song-Videos als Entdeckungskanal, Lore-/Alltags-Shorts als Bindungskanal; nicht mehr als 1 Song-Short pro
  ~4 Videos (Inauthentic-Content-Regel: Formate variieren). Content-ID-Claim ist erwartet; Song-Videos werden nicht monetarisiert.

## 5. Neue Kennzahlen
- Engaged-Anteil: `search_terms.py engaged <views> <watch_hours> <avg_view_s>` (Ziel-Hypothese >= 40 %).
- Suchanteil je Video (Baseline 2,6 %; Idol-Short 11 %).
- Spezifische-Suchbegriff-Retention (Ø-% der Begriffe mit >= 2 Woertern) vs generisch.
- Abos je 100 Views (Baseline Feed 0,8).

## 6. Ablauf nach jedem Upload (Lernschleife)

**Seit 2026-10-04 automatisch:** `raymi.cmd pulse daily` holt die Suchbegriffe jedes Videos ueber die API nach
`search_terms.json` (Schluessel `yt:<video-id>`, ersetzt manuelle Exporte desselben Videos) und schreibt Engaged-Anteil,
Suchanteil und Abos je 100 Aufrufe nach `10_Kanal-Puls.md`. Die Schritte unten gelten nur noch als Fallback ohne API.
1. 48 h nach Upload und nach 7 Tagen: Studio > Analytics > Reichweite > Traffic-Quelle > "YouTube-Suche" >
   Export (Zip). Pfad aus dem Kopf, bei Abweichung bitte korrigieren.
2. `engine/.venv/Scripts/python engine/tools/search_terms.py ingest <job> <zip> --title "<Titel>" --range <von..bis>`
3. `... search_terms.py report` und `... tags <Thema>` -> Kandidaten fuer das naechste Video, in `upload.json` /
   `script.json` uebernehmen, danach laeuft die normale Kanal-Regelpruefung (`raymi package`).
4. Gesamtzahlen (Views, Wiedergabezeit, Abos, Quellenanteile) in `06_Analytics-Insights.md` oder `VIDEO_LEARNINGS.md`
   nachtragen; Engaged-Anteil berechnen.
5. Nach 3+ Videos: Schwellen im Tool und in `channel_rules.py` nachjustieren (Konstanten, nicht Aufrufstellen).
