# Modul 01: Farbe

Stand: 2026-10-15, Version 1. Quellen-IDs [Qxx] siehe `Quellenregister_und_Luecken.md`.
Belegstufen: A = peer-reviewed/Primärstudie, B = Fachinstitution/seriöse Sekundärliteratur, C = populär/Blog/Wikipedia, D = eigenes Wissen, nicht geprüft.
Eintragsstruktur: Definition, Mechanik, Wirkung (gemessen), Kultur/Geschichte, Motive, Einsatz (wann/warum), Warum gefällt es, Kritiker-Check.

---

## 1. Wie Farbe entsteht und wahrgenommen wird

### 1.1 Drei Eigenschaften
- Hue (Farbton): der Ort auf dem Farbkreis, in HSV als Winkel 0 bis 360 Grad (0 Rot, 120 Grün, 240 Blau).
- Saturation (Sättigung): Reinheit/Buntheit, 0 bis 100 Prozent.
- Value/Brightness (Helligkeit): wie hell oder dunkel, 0 bis 100 Prozent [Q22, B-].
- Praktische Folge: Hue, Sättigung und Helligkeit wirken unabhängig voneinander auf Emotion (siehe Abschnitt 3). Eine Farbe nur über ihren Namen zu beschreiben ("Rot") verschweigt zwei von drei Stellschrauben.

### 1.2 Wie das Auge Farbe verarbeitet
- Trichromatische Theorie (Young 1802, Helmholtz 1852): drei Zapfentypen mit unterschiedlicher Wellenlängen-Empfindlichkeit; erklärt Farbmischung und Farbenblindheit [Q19, B].
- Gegenfarbentheorie (Hering 1878): Verarbeitung in Gegensatzpaaren Rot-Grün, Blau-Gelb, Hell-Dunkel; erklärt Nachbilder [Q19, B].
- Heutiges Bild: zweistufig. Die Netzhaut arbeitet trichromatisch, die spätere Verarbeitung gegnerisch [Q19, B].
- Einschränkung: Die Gegenfarbentheorie in ihrer ursprünglichen Form (Herings "Urfarben") gilt als empirisch nicht ausreichend gestützt; die Zapfen-Gegner-Mechanismen entsprechen nicht den Urfarben. Die vereinfachte Aussage "Komplementärfarben sind im Auge fest verdrahtete Gegenspieler" ist daher mit Vorsicht zu verwenden [Q20, C+].

### 1.3 Farbmodelle und Primärfarben
- Es gibt drei gängige Primärfarbsysteme: RGB (additiv, Licht), CMY (subtraktiv, Druck/Pigment) und RYB (traditionelle Mal-Lehre) [Q18, B].
- Additive Mischung (Bildschirm): Licht addiert sich, Rot+Grün ergibt Gelb, alle drei ergeben Weiß. Subtraktive Mischung (Farbe/Tinte): Pigmente absorbieren Licht, Mischung wird dunkler [Q18, B].
- RYB wird zwar weit gelehrt, aber CMY ergibt einen größeren Mischbereich. Verbreiteter Irrtum: Cyan sei gleich Blau und Magenta gleich Rot [Q18, B].
- Irrtum "Primärfarben sind rein und nicht mischbar": falsch, CMY-Farben lassen sich aus RYB-Farben mischen und umgekehrt [Q18, B].
- Für digitale Arbeit (Raymi, Video): Arbeitsraum ist RGB. Für Druck ist Umrechnung nach CMYK nötig, Farben können dabei stumpfer wirken [Q18 und Begleitquellen, B/C].
### 1.4 Wahrnehmungsgleiche Farbräume
- Munsell-System (1905, erstes Farbordnungssystem): beschreibt Farbe über Hue, Value (Helligkeit) und Chroma (Farbintensität); beruht auf Messungen visueller Reaktionen, deshalb ungleichmäßig geformt; wird noch heute verwendet (z.B. Hautfarbe in der Forensik, Bodenfarbe, Zahnfarbe) [Q49, B-/C+].
- CIELAB (L*a*b*, CIE 1976): annähernd wahrnehmungsgleich, das heißt numerische Abstände entsprechen ungefähr wahrgenommenen Farbunterschieden; gegnerfarbenbasiert; Standard bei Lack, Farbstoff und Druck; Farbdifferenz-Formeln wie CIE94 sind gleichmäßiger als einfaches CIELAB [Q49, B-/C+].
- Konsequenz (Ableitung, D): HSV/HSL sind einfach, aber nicht wahrnehmungsgleich; gleiche Sättigungs- oder Helligkeitswerte wirken je nach Farbton unterschiedlich hell. Für Palettenarbeit sind LCh-/Lab-basierte Werkzeuge verlässlicher. Quelle fehlt, prüfen.
- sRGB ist der Standardfarbraum für das Internet [Q49, B-]. Display P3, Gamma, Farbmanagement: nicht recherchiert.

### 1.5 Barrierefreiheit: Farbenfehlsichtigkeit und Kontrast
- Verbreitung: etwa 8 Prozent der Männer und 0,5 Prozent der Frauen haben eine Farbsehschwäche (etwa 1 von 12 Männern, 1 von 200 Frauen; Angabe laut National Eye Institute in Sekundärquellen) [Q48, B-/C+].
- WCAG (Web Content Accessibility Guidelines) verlangen Kontrastverhältnis mindestens 4,5:1 für normalen Text und 3:1 für großen Text und für UI-Elemente; Farbe darf nie das einzige Mittel zur Information sein [Q48, B-].
- Grenze der Norm: Ein Paar, das WCAG besteht, kann für Menschen mit Rotschwäche (Protanopie) trotzdem zu wenig Kontrast haben, weil Rot dunkler erscheint (Scoping-Review mit 113 Arbeiten, ASSETS 2025) [Q48, A]. Hoher Kontrast garantiert keine Unterscheidbarkeit der Farben; WCAG regelt keine Sättigung [Q48, C+].
- Faustregel: Kategorien-Paletten bleiben nur bis etwa sechs bis sieben Werte unterscheidbar, bei Farbsehschwäche nur bis etwa vier (C+) [Q48].
- Praxis: Farbe entfernen und prüfen, ob alles noch verständlich ist (Graustufentest, siehe Abschnitt 6) [Q48, C+].

## 2. Farbbeziehungen: Kontraste und Harmonien

### 2.1 Ittens sieben Kontraste (Bauhaus)
Itten (Bauhaus-Lehrer) beschrieb sieben grundlegende Farbkontraste [Q07, B; Q08, C+]:
1. Farbe-an-sich-Kontrast (Hue): reine, ungemischte Farben nebeneinander
2. Hell-Dunkel-Kontrast: laut Itten der grundlegendste Weg, Form wahrzunehmen
3. Kalt-Warm-Kontrast: Rot/Orange/Gelb gelten als warm, Blau/Grün/Violett als kalt
4. Komplementärkontrast: gegenüberliegende Farben steigern sich gegenseitig
5. Simultankontrast: eine Farbe verändert die Wirkung der Nachbarfarbe
6. Qualitätskontrast (Sättigung): gesättigt gegen abgeschwächt
7. Quantitätskontrast (Ausdehnung): Verhältnis der Flächengrößen
- QUELLENKONFLIKT: Die Getty-Seite listet statt Simultankontrast den Begriff "analogous" [Q07]; die Kursunterlage und die gängige Fachliteratur nennen Simultankontrast [Q08]. Als wahrscheinlich richtig gilt Simultankontrast. Gegenprüfung am Originalbuch steht aus.
- Einschränkung (D, nicht belegt): Ittens Lehre kommt aus der Pigment- und Malerei-Welt (RYB, subtraktiv), digitale Farbe ist additiv (RGB) [Q18 belegt nur den Unterschied der Modelle]. Vermutlich bleiben die Kontraste als Wahrnehmungsprinzip nutzbar, die Mischregeln gelten nicht eins zu eins. Prüfen.
- Albers (Interaction of Color, 1963): Farbe ist relativ, dieselbe physikalische Farbe wirkt je nach Umgebung anders (Simultankontrast, Nachbild-Experimente) [Q44, C]. Primärtext noch nicht geprüft.

### 2.2 Harmonien (Farbschemata)
Alle Schemata arbeiten auf dem Farbton-Winkel des Farbkreises [Q21, C/B-]:
- Komplementär: Gegenfarbe, 180 Grad. Starker Kontrast, wirkt am stärksten bei voller Sättigung; in großen Flächen schwer zu handhaben, ideal als Blickfang. Als Textfarbe laut Forenquelle ungeeignet (C-).
- Split-Komplementär: Basisfarbe plus die beiden Nachbarn der Gegenfarbe (etwa 150 Grad). Ähnlich starker Kontrast, aber weniger Spannung, gilt als anfängerfreundlich.
- Analog: benachbarte Farben. Harmonisch, in der Natur häufig, wirkt einheitlich warm oder kalt; braucht ausreichend Wert- oder Sättigungsunterschied.
- Triadisch: drei gleichmäßig verteilte Farben (120 Grad). Lebendig; eine Farbe dominieren lassen, die anderen als Akzent.
- Tetradisch (Rechteck/Quadrat): vier Farben; eine dominant halten.
- Monochrom: Variation von Helligkeit/Sättigung einer Farbe.
- Faustregel 60-30-10 (Hauptfarbe, Sekundärfarbe, Akzent) ist verbreitet, aber nur aus Blog-Quellen belegt [Q40, C].
- Kritiker-Hinweis: Eine "korrekte" Harmonie garantiert keine Wirkung. Entscheidend sind Wertkontrast, Sättigung und Flächenverhältnis (siehe Abschnitt 3).

## 3. Wirkung von Farbe auf Gefühl (gemessen)

### 3.1 Valdez und Mehrabian 1994 [Q12, A]
- Methode: Munsell-Farbchips, Emotionsmodell Pleasure-Arousal-Dominance.
- Kernbefund: Sättigung und Helligkeit haben starke und konsistente Effekte. Regressionsgleichungen (standardisiert): Pleasure = 0,69 Helligkeit + 0,22 Sättigung; Arousal = -0,31 Helligkeit + 0,60 Sättigung; Dominance = -0,76 Helligkeit + 0,32 Sättigung.
- Lesart: Hellere Farben sind angenehmer; gesättigtere Farben erregen stärker; dunklere Farben wirken dominanter.
- Hue-Befunde: Blau, Blaugrün, Grün, Rotviolett, Violett, Violettblau waren die angenehmsten Töne; Gelb und Gelbgrün die unangenehmsten. Gelbgrün, Blaugrün und Grün erregten am meisten, Violettblau und Gelbrot am wenigsten.

### 3.2 Wilms und Oberfeld 2018 [Q13, A]
- Methode: 27 Farben (3 Hue x 3 Sättigung x 3 Helligkeit) plus Graustufen auf LED-Display, 62 Teilnehmende, 30 Sekunden pro Farbe, Selbstauskunft plus Hautleitfähigkeit und Herzrate.
- Befund: Gesättigte und helle Farben erhöhen die Erregung. Der Farbton wirkt zusätzlich, Erregung steigt von Blau und Grün zu Rot. Gesättigte und helle Farben lösten stärkere Hautleitfähigkeits-Reaktionen aus.
- Fazit der Autoren: Effekte hängen nicht nur vom Farbton ab, sondern von allen drei Dimensionen und ihren Wechselwirkungen.
- QUELLENKONFLIKT beim Farbton: Bei Valdez und Mehrabian gehören Grüntöne zu den erregendsten Hues, bei Wilms und Oberfeld steigt Erregung von Blau/Grün zu Rot. Die Studien nutzten unterschiedliche Reize (Chips gegen Display) und andere Farbsätze. Belastbar ist nur: Sättigung und Helligkeit wirken in beiden Studien. Hue-spezifische Erregungsaussagen sind unsicher.

### 3.3 Konsequenz für die Praxis (Ableitung, D)
- Wer Energie und Aufmerksamkeit will, nutzt hohe Sättigung und Helligkeit; wer Ruhe oder Schwere will, senkt Sättigung und/oder Helligkeit.
- Die Wirkung der Farbe lässt sich also über Sättigung/Helligkeit steuern, ohne den Farbton zu ändern.
- Prüfen im Einzelfall, nicht blind anwenden (Abschnitt 7 Replikationslage).

## 4. Warum mögen Menschen bestimmte Farben? (Präferenz)

- Ecological Valence Theory (Palmer und Schloss 2010): Menschen mögen Farben, die stark mit Dingen verbunden sind, die sie mögen (Blau mit klarem Himmel und sauberem Wasser), und mögen Farben nicht, die mit Unangenehmem verbunden sind (Braun mit Fäkalien und verdorbenem Essen) [Q04, A].
- Im Test mit 32 Farben sagte die Theorie etwa 80 Prozent der Varianz der durchschnittlichen Präferenz voraus, mehr als konkurrierende Modelle [Q05, A]. Ein früheres Farbemotions-Modell erklärte etwa 67 Prozent [Q04, A].
- Präferenz ist lernbar: Eine Folgestudie testete, ob die Vorliebe für Farben einer Institution (z.B. Hochschulfarben) mit der Verbundenheit zur Institution steigt; mir liegt nur ein Abstract-Auszug vor, das Ergebnis ist deshalb nicht im Detail geprüft [Q06, A-].
- Folge für Design: Farbwirkung hängt am Kontext der Dinge, die man damit verbindet. Eine Farbe an einem unbeliebten Objekt wird weniger gemocht.

## 5. Universelles und Kulturelles

### 5.1 Jonauskaite et al. 2020 [Q09, A, vollständig gelesen]
- 4.598 Teilnehmende, 30 Nationen, 22 Sprachen. 12 Farbwörter (Rot, Orange, Gelb, Grün, Türkis, Blau, Violett, Rosa, Braun, Schwarz, Grau, Weiß) und 20 Emotionen (Geneva Emotion Wheel), online, mit Farbbegriffen, nicht mit Farbflächen.
- Muster ähneln sich weltweit stark (durchschnittliche Ähnlichkeit r = 0,88), Männer und Frauen fast identisch (r = 0,987). Zusätzlich gibt es lokale Unterschiede; sprachlich oder geografisch nahe Länder ähneln sich mehr. Ein Algorithmus erriet die Nation bei 34,4 Prozent der Personen (Zufall 9,7 Prozent).
- Starke Verknüpfungen (Wahrscheinlichkeit mindestens 0,4): Schwarz mit Traurigkeit, Angst, Hass; Rot mit Liebe, Ärger; Rosa mit Liebe, Freude, Vergnügen; Grau mit Traurigkeit, Enttäuschung; Gelb mit Freude; Orange mit Freude, Belustigung; Weiß mit Erleichterung.
- Rot und Schwarz lösten in jedem Land die meisten Emotionsverknüpfungen aus, Braun die wenigsten.
- Rosa, Grün, Türkis und Schwarz sind am einheitlichsten über Länder hinweg; Violett und Gelb am uneinheitlichsten (Ähnlichkeit Violett 0,659, Rosa 0,925).
- Lokale Abweichungen (Beispiele): Nigeria verknüpft Rot auch mit Angst; China Weiß auch mit Traurigkeit (passt zu Trauerfarbe); Ägypten verknüpft Gelb nicht mit Freude; Griechenland Violett mit Traurigkeit; Deutschland Neid mit Gelb, Polen mit Rot (zitiert aus früherer Studie).
- Grenzen der Studie: Online-Stichprobe (computererfahren, möglicherweise globalisiert), Begriffsassoziationen statt direkt erlebter Gefühle, keine Kleinstgesellschaften.

### 5.2 Weitere Querbelege
- Tham et al. 2020 (Chinesisch- und Englischsprachige): als kulturübergreifend gefunden werden Weiß mit Reinheit, Blau mit Wasser/Himmel, Grün mit Gesundheit, Violett mit Würde/Königlichem, Rosa mit "weiblichen" Eigenschaften. Kulturspezifisch: Rot und Orange mit Begeisterung im Chinesischen, Rot mit Anziehung im Englischen [Q10, A].
- Adams und Osgood 1973 (23 Kulturen): Rot ist emotional markant, aktiv und stark; Schwarz und Grau gelten als schlecht; Weiß, Blau, Grün als gut; Gelb, Weiß, Grau als schwach; Schwarz und Rot als stark [Q11, A].
- Implizite Messung (Reaktionszeiten) ergibt teils andere Muster als explizite Befragung, z.B. bei Weiß: explizit unterscheiden sich Kulturen, implizit nicht so stark. Die Befundlage zu implizitem Kulturvergleich ist dünn [Q39, A].
- Bewertung: Eine grobe universelle Schicht gibt es, kulturelle Schichten liegen darüber. Für ein englischsprachiges Weltpublikum zählt zuerst die universelle Schicht.

## 6. Eigenständige Wirkung: Sättigung und Wert kommen vor dem Farbton
- Lesbarkeit entsteht überwiegend aus Hell-Dunkel-Unterschieden. Zwei Farben mit verschiedenem Farbton, aber gleicher Helligkeit verschwimmen bei kleiner Darstellung (Pixel-Art-Lehrmaterial, C) [Q37].
- Mit dem Graustufentest prüfbar: bleiben die Formen lesbar, trägt die Wertstruktur [Q37, C; stimmt mit Itten-Aussage zu Hell-Dunkel überein, Q07, B].

## 7. Replikationslage: Was ist nicht gesichert?
- Elliot et al. 2007: Ein kurzer Blick auf Rot vor einem Test senkte die Leistung (4 Experimente), Rot wirkt demnach als Vermeidungssignal [Q14, B (Pressemeldung zu Studie)].
- Elliot und Maier: "Color-in-Context"-Theorie: Wirkung hängt vom Kontext (Leistung gegen Romantik) [Q16/Q17, A/C+].
- Replikationen: Konferenzposter fanden bei Anagrammen keinen Rot-Effekt und bei Snack-Konsum sogar mehr Verzehr auf roten Tellern [Q16, C+]; drei Studien (N = 830) fanden keinen Rot-Effekt auf Attraktivität [Q15, A]; ein Review hält die Befunde zur Rot-Wirkung auf Leistung für uneinheitlich [Q17, A-].
- Fazit: Spezifische Verhaltenseffekte einzelner Farben sind schwach gesichert. Zuverlässiger sind Effekte von Sättigung/Helligkeit auf Erregung (Abschnitt 3) und die universellen Assoziationen (Abschnitt 5).
- Blog-Pauschalaussagen wie "Rot steigert Verkäufe" haben keine belastbare Studienbasis [Q36, C].

## 8. Die Einzelfarben

Hinweis: Abschnitte "Motive" sind eigenes Wissen (D) und müssen in einer weiteren Runde gegengeprüft werden. Alles andere trägt eine Quelle.

### 8.1 Rot
- Einordnung: additive Primärfarbe (RGB), in RYB Primärfarbe, in CMY nur als Mischung [Q18, B].
- Gemessene Wirkung: Rot ist emotional am markantesten und hat in allen 30 Ländern die meisten Emotionsverknüpfungen, vor allem Liebe und Ärger [Q09, A]. Kulturübergreifend aktiv und stark [Q11, A]. Stärkste Erregung unter Rot/Grün/Blau bei gleicher Sättigung/Helligkeit [Q13, A].
- Kultur und Geschichte: Rot war die erste Farbe, die für Malerei und Färben entwickelt wurde; in der Antike mit Krieg, Reichtum und Macht verbunden, im Mittelalter religiös (Blut Christi, Höllenfeuer) und weltlich (Liebe, Ruhm, Schönheit); in der Reformation verlor Rot an Ansehen, nach der Französischen Revolution wurde es Farbe linker Bewegungen [Q24, B]. Im Mittelalter galt die Kombination Rot und Schwarz als Farben der Hölle [Q24, B; Besprechung]. China: Rot für Glück und Wohlstand (zusätzlich Hochzeit) [Q09, Q35, A/C]. Japan: Rot (aka) ist beliebt, viele Schreine und Tempel sind rot, Bedeutung Frieden und Wohlstand der Familie (Reiseblog, C) [Q35].
- Pigmentgeschichte: roter Ocker als ältestes Pigment; Krapp, Bleimennige, Zinnober/Vermilion (giftig, dunkelt am Licht nach); Karmin aus Cochenille (jahrhundertelang wirtschaftlich bedeutsam für das spanische Reich); Cadmiumrot ab 1907 [Q24, B; Q41, B-].
- Motive (D, ungeprüft): Blut, Feuer, Rose, Herz, Apfel, Mohn, Lippen. Bei Blut und Feuer deckt sich das mit den Bedeutungsfeldern aus Q24.
- Einsatz (Ableitung): Betonung, Energie, Gefahr, Leidenschaft. Wirkung steuerbar über Sättigung/Helligkeit (dunkles, gedämpftes Rot wirkt anders als reines Signalrot).
- Warum gefällt es: Hohe Auffälligkeit plus starke, universelle Gefühlsladung (Liebe und Ärger zugleich: Rot ist mehrdeutig, der Kontext entscheidet) [Q09, A].
- Kritiker-Check: Löst das Rot im Bild das Zielgefühl aus (Zuneigung oder Alarm)? Wird Rot als Akzent oder als Fläche gesetzt? Droht es, andere Elemente zu überstrahlen (Wertkontrast)? Verlasse dich nicht auf "Rot macht Leute ängstlich/leistungsschwach", das ist nicht gesichert (Abschnitt 7).

### 8.2 Orange
- Einordnung: Mischung aus Rot und Gelb, in RGB Sekundärfarbe (zwischen Rot und Gelb) [Q18, B].
- Gemessene Wirkung: starke Verknüpfung mit Freude und Belustigung [Q09, A]; im Chinesischen mit Begeisterung [Q10, A]. Der Hue-Bereich Gelbrot war bei Valdez und Mehrabian am wenigsten erregend [Q12, A], was zur Vorsicht bei pauschalen "Orange ist aufregend"-Aussagen mahnt.
- Kultur und Geschichte: Die Frucht trug den Namen zuerst, die Farbe folgte. Vor der Einfuhr der Orange nach Europa (Portugiesen und Spanier, 15./16. Jahrhundert) hieß die Farbe in europäischen Sprachen Gelbrot; das Wort stammt über Arabisch vom altpersischen "narang" und kam nach Spanien (naranja) [Q45, B-/C+; Wikipedia, C+]. Safranfarbene Roben von Mönchen in Buddhismus, Jainismus und Hinduismus gelten als Zeichen von Einfachheit und Entsagung beziehungsweise Reinigung durch Feuer [Q45, B-/C]. In den Niederlanden ist Orange Nationalfarbe durch das Haus Oranien (Orange-Nassau); der Ortsname Orange hat eine eigene Herkunft und ist nicht von der Farbe abgeleitet [Q45, B-; Wikipedia, C+]. In Großbritannien beliebt bei den Präraffaeliten [Q45, C+].
- Motive (D, ungeprüft): Orange (Frucht), Kürbis, Herbstlaub, Sonnenuntergang, Feuer, Fuchs; Sicherheits- und Warnfarbe wegen hoher Sichtbarkeit (Blogquelle, C) [Q45].
- Einsatz (Ableitung): warm, freundlich-energisch ohne die Härte von Rot; Gelbrot war bei Valdez und Mehrabian wenig erregend, hohe Sättigung steigert die Erregung [Q12, A].
- Anime-Konvention (C): Orange als Charakterfarbe mit hoher Wiedererkennung (z.B. Naruto, Blogquelle) [Q40, C].

### 8.3 Gelb
- Einordnung: subtraktive Primärfarbe (CMY, RYB), in RGB Mischung aus Rot und Grün [Q18, B].
- Gemessene Wirkung: Verknüpfung mit Freude (weltweit stark, aber uneinheitlich über Länder; Ägypten nicht); Sonnenscheinmenge der Umgebung beeinflusst, wie sehr Gelb als Farbe der Freude gilt [Q09, A]. Zugleich zählten Gelb und Gelbgrün bei Valdez und Mehrabian zu den am wenigsten angenehmen Tönen [Q12, A], und Gelb gilt als schwach [Q11, A]. Das sind Spannungen: Gelb ist als Assoziation fröhlich, als reiner Farbreiz nicht besonders angenehm.
- Kultur und Geschichte: Im Mittelalter wurde Judas in Gelb dargestellt, obwohl die Bibel seine Kleidung nicht beschreibt; Gelb wurde mit Verrat, Außenseitern und Geldverleihern verbunden; für Ägypter und Babylonier war es durch die Nähe zu Sonne und Gold bedeutsam [Q28, B/C]. Pastoureau urteilt laut Besprechung, Gelb sei bei gutem Licht fröhlich, bei schlechtem Licht schnell unangenehm und werde bei Mischung leicht schmutzig [Q28, C; paraphrasiert].
- Pigmente: Ocker, Chromgelb (ab 1809, bleibasiert, dunkelt mit der Zeit nach), Cadmiumgelb (ab 1820); Van Goghs Sonnenblumen zeigen leichtes Nachdunkeln des Chromgelbs [Q28, B (National Gallery)].
- Motive (D, ungeprüft): Sonne, Sonnenblume, Gold, Zitrone, Küken, Warnschild.
- Einsatz (Ableitung): hellste Buntfarbe, daher stark für Aufmerksamkeit und Hervorhebung; wirkt schnell schmutzig bei Mischung.
- Kritiker-Check: Wirkt das Gelb fröhlich oder krank/schmutzig? Ist der Wertkontrast zu Hintergrund und Text ausreichend (Gelb auf Weiß ist schwach lesbar, Ableitung aus Wertregel)?

### 8.4 Grün
- Einordnung: additive Primärfarbe (RGB); in RYB Mischung aus Blau und Gelb [Q18, B].
- Gemessene Wirkung: weltweit Gesundheit [Q10, A]; geringe Streuung zwischen Ländern [Q09, A]; Grün zählte bei Valdez und Mehrabian zu den angenehmen, aber auch erregenden Hues [Q12, A] (Konflikt mit Q13, siehe 3.2). Gute Bewertung, wenn es mit Pflanzen assoziiert wird, ohne diese Verknüpfung nicht automatisch [Q04, A].
- Kultur und Geschichte: stand lange für Natur, Vitalität, Wiedergeburt; zugleich in der Geschichte mit Gift verbunden: Scheeles Grün (Kupferarsenit, 1775) war das leuchtendste bis dahin hergestellte Grün, wurde in Tapeten, Kleidung, Spielzeug und sogar Lebensmitteln verwendet und war giftig; Smaragdgrün folgte 1814; Scheeles Grün wurde noch bis 1890 für Tapeten produziert [Q27, B-/C]. Im Islam gilt Grün als paradiesisch (C) [Q27].
- Motive (D, ungeprüft): Blätter, Gras, Wald, Frosch, Kleeblatt, Gift/Slime.
- Einsatz (Ableitung): Natur, Gesundheit, Ruhe; abgewandelt (gelbgrün, giftgrün) Unbehagen.
- Kritiker-Check: Welche Art Grün (warm/natürlich oder giftig/neon)? Passt sie zur beabsichtigten Stimmung?

### 8.5 Blau
- Einordnung: additive Primärfarbe (RGB), RYB-Primärfarbe; Cyan (nicht Blau) ist die CMY-Primärfarbe [Q18, B].
- Gemessene Wirkung: weltweit mit Wasser/Himmel verbunden [Q10, A]; Blau mit klarem Himmel und sauberem Wasser wird gemocht [Q04, A]; Blau zählt zu den angenehmen Tönen [Q12, A]; unter Rot/Grün/Blau die geringste Erregung [Q13, A].
- Kultur und Geschichte (Pastoureau, Besprechungen): Blau ist eine "junge" Farbe; selten in prähistorischer Kunst; für die alten Griechen kaum bedeutsam bis unbeliebt; Lapislazuli aus Afghanistan wurde importiert; Marienblau; im 12. Jahrhundert Aufstieg zur königlichen Farbe; später Farbe von Romantik, Jeans und der "Erde aus dem All" [Q23, B]. Ultramarin aus Lapislazuli war in der Renaissance teils wertvoller als Gold und deshalb der Jungfrau Maria vorbehalten [Q23, C+ (The Collector)]. Blau wird als heute beliebteste Farbe im Westen beschrieben [Q23, B]. Japan: "ao" deckte historisch Blau und Grün ab (Sprachblog, C) [Q35].
- Motive (D, ungeprüft): Himmel, Meer, Wasser, Saphir, Jeans.
- Einsatz (Ableitung): Ruhe, Tiefe, Vertrauen; kalt. Als Gegenpol zu Warm (Orange) ein Standard-Komplementärpaar.
- Kritiker-Check: Wirkt es ruhig oder kalt-distanziert? Zu wenig Sättigung kann Traurigkeit signalisieren, zu viel Sättigung wirkt "neon".

### 8.6 Violett/Lila
- Einordnung: in RYB Sekundärfarbe (Rot+Blau); ein Spektralviolett ist physikalisch etwas anderes als die Purpurmischung [Q18, B für Modelle].
- Gemessene Wirkung: weltweit "königlich/würdevoll" [Q10, A]; in Jonauskaite die uneinheitlichste Farbe (z.B. Griechenland mit Traurigkeit) [Q09, A]; Rotviolett, Violett und Violettblau gehören zu den angenehmen Hues, Violettblau ist wenig erregend [Q12, A].
- Kultur und Geschichte: Tyrisches Purpur aus Murex-Schnecken, Produktion ab etwa 1200 v. Chr. durch Phönizier, in Rom und Byzanz bis 1453; extrem teuer (etwa 9.000 Schnecken pro Gramm, populäre Zahl); Luxusgesetze beschränkten das Tragen, ab dem 4. Jahrhundert in Rom praktisch nur dem Kaiser; "the purple" steht für das Kaiseramt; in England beschränkte Elisabeth I. Purpur auf enge Verwandte; 1856 erfand Perkin den ersten synthetischen Farbstoff (Mauvein) [Q26, C+/B-]. Hinweis: Die verbreitete Vorstellung "Violett ist eine Königsfarbe" ist teils Folge dieser Geschichte (Wikipedia-Hinweis) [Q26, C+].
- Motive (D, ungeprüft): Amethyst, Lavendel, Nacht, Magie, Kaiser-Gewand.
- Einsatz (Ableitung): Würde, Mystik, Besonderheit; wegen der Streuung kulturell riskanter als Rosa oder Grün.
- Kritiker-Check: Wirkt es edel oder düster/traurig? Hängt stark von Helligkeit und Kombination ab.

### 8.7 Rosa/Pink
- Einordnung: helles, entsättigtes Rot (Mischung mit Weiß), in Magenta-Richtung CMY-Primärfarbe [Q18, B für Magenta].
- Gemessene Wirkung: stärkste Übereinstimmung zwischen Ländern (r = 0,925) und Verknüpfung mit Liebe, Freude, Vergnügen [Q09, A]; weltweit "weibliche" Eigenschaften [Q10, A].
- Kultur und Geschichte: Pastelltöne kamen Mitte des 19. Jahrhunderts als Babyfarben auf; es gab keine feste Geschlechtszuordnung; die Codierung Rosa/Mädchen und Blau/Jungen war ab den 1860ern bekannt, wurde in den USA aber erst in den 1950ern dominant und noch später universell (Paoletti). Eine behauptete komplette "Umkehr" (Rosa für Jungen, Blau für Mädchen) ist umstritten: Del Giudice sprach 2017 von Inkonsistenz statt Umkehr; Paoletti behauptete keine Umkehr [Q29, B-]. Anime/Kawaii: Rosa als Marker für süß, auffällig, verspielt (Blog-Konvention, C) [Q33].
- Motive (D, ungeprüft): Kirschblüte, Zuckerwatte, Herz, Schleife.
- Einsatz (Ableitung): Zuneigung, Weichheit, Niedlichkeit; wirkt in Kombination mit Kindchenschema-Merkmalen verstärkend (Q31 für Schema, Verknüpfung als Ableitung).
- Kritiker-Check: Ist das Rosa süß oder kitschig/steril? Gesättigtes Pink (Energie) und Pastell (Weichheit) lösen verschiedene Gefühle aus (Sättigung/Helligkeit, Abschnitt 3).

### 8.8 Braun
- Einordnung: dunkle, gedämpfte Mischung aus Orange/Rot/Gelb.
- Gemessene Wirkung: In Jonauskaite hat Braun die wenigsten Emotionsverknüpfungen [Q09, A]; laut Ecological Valence Theory wird Braun wegen Verbindung zu Verdorbenem im Durchschnitt wenig gemocht [Q04, A].
- Kultur und Geschichte: In Europa blieb Braun laut Pastoureau-Besprechung lange die Farbe der einfachen Leute (Bauern) [Q25, B]. Braunes Erdpigment (Umbra) wird seit prähistorischer Zeit in der Kunst verwendet (Wikipedia nennt Funde um 40.000 v. Chr., nicht gegengeprüft); Höhlenmalereien in Lascaux; im Alten Ägypten zur Hautfarbe. Im Mittelalter nutzten Buchmaler dunkles Braun selten; in der Renaissance gab es vier Standardbraun (Rohumbra, Rohsienna, gebrannte Umbra, gebrannte Sienna); Rembrandt nutzte Umbra in Grundierungen wegen schnellerer Trocknung; weitere Quellen: Sepia aus Tintenfisch, Kasseler Erde, das berüchtigte "Mumienbraun" [Q46, B-/C+]. Im Japanischen gibt es laut WebExhibits kein Grundwort für Braun, man sagt "Teefarbe" oder "Fallaub" (im modernen Japanisch existiert 茶色 chairo, Teefarbe, daher stimmt die Aussage nur eingeschränkt) [Q46, B-]. Viele Sprachen leiten das Wort für Braun von Lebensmitteln ab (z.B. Kaffee im östlichen Mittelmeerraum) [Q46, C+].
- Motive (D, ungeprüft): Erde, Holz, Schokolade, Kaffee, Leder, Herbst, Baumrinde.
- Warum gefällt es trotz geringer Beliebtheit: Browns sind das wichtigste Werkzeug für feine Abstufungen und Realismus [Q46, B-]; als Farbe der Wärme/Natur dient es dem Gesamtbild.
- Einsatz (Ableitung): natürlich, erdig, warm; wirkt schnell "schmutzig". Als Ruhefarbe oder für Natur nutzbar, aber selten als Blickfang.
- Kritiker-Check: Wirkt Braun als gewollte Erde/Holz oder als versehentlicher "Matsch" aus Mischfehlern?

### 8.9 Schwarz
- Gemessene Wirkung: Traurigkeit, Angst, Hass; hohe emotionale Aufladung (zusammen mit Rot) [Q09, A]; "schlecht" und "stark" [Q11, A]; Dunkelheit erhöht wahrgenommene Dominanz [Q12, A].
- Kultur und Geschichte: In der Frühzeit des Christentums Hölle und Teufel, aber auch klösterliche Tugend und Demut; mittelalterliche Höfe machten Schwarz zum Zeichen von Luxus; Anne von Bretagne führte um 1500 Schwarz als Trauerfarbe für Königinnen ein (zuvor Weiß für Königinnen, Purpur für Könige); später Eleganz (Smoking), Rebellion (Lederjacke); durch Druck (Schwarz-Weiß) wurde Schwarz zu einem Grundmodus des Sehens; Newton erklärte Schwarz wissenschaftlich zur Nicht-Farbe, im 20. Jahrhundert wurde es wieder als Farbe anerkannt [Q25, B]. Japan: Kuro traditionell männliche Farbe, Samurai (Reiseblog, C) [Q35].
- Motive (D, ungeprüft): Nacht, Schatten, Rabe, Trauerkleidung, Tinte.
- Einsatz (Ableitung): Kontrast und Wertanker (dunkelster Wert), Eleganz, Bedrohung. Für Outline/Linienführung wichtigste Wertreferenz.
- Kritiker-Check: Reines Schwarz kann Details verschlucken. Prüfe, ob die dunkelsten Bereiche noch Form zeigen.

### 8.10 Weiß
- Gemessene Wirkung: Erleichterung (global) [Q09, A]; Reinheit (universell, Tham) [Q10, A]; "gut" und "schwach" [Q11, A]; in China zusätzlich Traurigkeit [Q09, A].
- Kultur und Geschichte: In vielen ostasiatischen Kulturen, Indien und historisch teils in Osteuropa mit Trauer verbunden [Q42, C]. Japan: Shiro heilig, Reinheit im Shintoismus; im Buddhismus auch Tod [Q35, C]. Das weiße Brautkleid wurde im Westen durch Queen Victorias Hochzeit 1840 populär; die Reinheits-Symbolik gilt als jüngere Zuschreibung, Victorias Wahl hatte laut Quellen auch wirtschaftliche Motive (Spitze) [Q30, B-/C+]. QUELLENKONFLIKT: Eine Quelle nennt Weiß Mitte des 19. Jahrhunderts als Trauerfarbe in England [Q30, Smithsonian], die Pastoureau-Besprechung nennt Weiß als Trauerfarbe der französischen Königinnen bis etwa 1500 [Q25]. Beides kann stimmen (verschiedene Regionen/Zeiten), ist aber nicht gegengeprüft.
- Implizit gemessen unterscheiden sich Kulturen bei Weiß weniger als explizit [Q39, A].
- Motive (D, ungeprüft): Schnee, Wolke, Lilie, Brautkleid, Papier, Geist.
- Einsatz (Ableitung): Helligkeitsanker, Leere/Neuanfang, Reinheit, bei Gespenstern Unheimliches. Reines Weiß ist die hellste Stelle und zieht den Blick.
- Kritiker-Check: Wirkt Weiß rein oder leer/steril? Kulturen mit Weiß-Trauer: für ein Weltpublikum besser als Kontext abwägen.

### 8.11 Grau
- Gemessene Wirkung: Traurigkeit und Enttäuschung [Q09, A]; "schlecht", "schwach", "passiv" [Q11, A].
- Kultur und Geschichte: Grau galt im Mittelalter als Farbe der Armen und der ungefärbten Wolle, daher Demut (Benediktiner, "graue Brüder"); in den Renaissance-Techniken folgte die Grisaille (Malerei in Grautönen); im alten China mit Bescheidenheit verbunden [Q47, B-/C+]. Itten sah Grau als bestes Neutral zwischen Schwarz und Weiß, zeigte aber, dass graue Flächen je nach Nachbarfarbe farbig erscheinen: "neutral" ist relativ [Q47, B- (Itten-Referenz in Magazinartikel)]. Pastoureau betont laut dieser Quelle, dass Farben immer ambivalent sind und sozial bestimmt [Q47, B-].
- Motive (D, ungeprüft): Regenwolken, Asche, Stein, Nebel, Metall, Alter (graues Haar).
- Einsatz (Ableitung): Neutralisierung, Wertbrücke zwischen Hell und Dunkel, Distanz; hohe Entsättigung wirkt leicht traurig (Bezug: Grau mit Traurigkeit/Enttäuschung, Q09).
- Kritiker-Check: Wirkt Grau als gewollter Ruhepol oder als Lebensverlust (zu viel Entsättigung)?

### 8.12 Türkis
- In Jonauskaite einbezogen, gehört zu den kulturübergreifend einheitlichsten Farben [Q09, A]; keine der Emotionsverknüpfungen erreichte dort die Schwelle 0,4 (laut Heatmap-Beschreibung nicht einzeln ausgewiesen), Detailwerte stehen im Zusatzmaterial der Studie (nicht geprüft).
- Geschichte: Türkis (Mineral) und Lapislazuli/Azurit wurden im Alten Ägypten für Schmuck, Grabbeigaben und Pigmente genutzt [Q23, B (Besprechung von Pastoureau, Blue)].
- Motive (D, ungeprüft): tropisches Meer, Pool, Edelstein, Schmuck.
- Einsatz (Ableitung): Mischung aus Blau (Ruhe) und Grün (Frische); in Kombination mit Warm (Koralle, Orange) starker Komplementärkontrast.

## 9. Farbe in Animation und Film (Berufspraxis)
- Farbskript (Color Script): Vorproduktions-Dokument aus kleinen Bildern, das für jede Szene Palette und Stimmung festlegt, damit Beleuchtung, Charakter und Umgebung dem gleichen emotionalen Plan folgen. Von Studios wie Pixar genutzt [Q32, C/C+].
- Praxisstimme Anime (Science SARU, Serie Dan Da Dan): Die Farbscript-Künstlerin beschreibt es als etwas Unterschwelliges, "wie Musik", sie führt mit der Emotion der Szene; der Colorist nutzte für ruhigere Szenen weniger Sättigung und sparte starke Sättigung für Actionszenen auf, damit diese herausstechen [Q32, B (Fachmagazin-Interview, paraphrasiert)].
- Beispiele für Palettenwechsel als Erzählmittel: in "Oben" von lebhaft zu entsättigt bei Trauer; in "Chihiros Reise ins Zauberland" gedämpfte Menschenwelt gegen kräftige Geisterwelt; Freude in "Alles steht Kopf" in Gelb [Q32, C+].
- Charakterfarben: Palette als Wiedererkennung und Persönlichkeit; Haarfarbe im Anime als Schnelllesehilfe (Rot energisch, Blau ruhig, Rosa süß). Das sind Konventionen aus Blogquellen, keine Forschung [Q33, C].
- Thumbnails/Feed: Plausibel und in Blogquellen wiederholt: Kontrast schlägt Farbton-Wahl; Lesbarkeit bei kleiner Größe ist entscheidend. Konkrete Prozentwerte aus diesen Quellen sind nicht belegbar und werden nicht übernommen [Q34, C-].

## 9b. Japanische Farbkultur und Anime-Farbgestaltung

### Traditionsfarben (dentōshoku)
- Japan hat eine eigene Sammlung traditioneller Farben (dentōshoku, 伝統色), einige schon seit der Asuka-Zeit (538 bis 710) in Gebrauch, insgesamt etwa 500 Farben; Einflüsse aus China und Korea [Q50, C+ (Tofugu)].
- Das Konzept der "fünf Farben" (goshiki: Rot, Blau/Grün, Gelb, Weiß, Schwarz) kam aus China und beruht auf Yin-Yang und den fünf Elementen; viele Farben sind nach Pflanzen und Tieren benannt; Farben zeigten Hofrang und Stand an, bestimmte Töne waren vorbehalten (ähnlich Purpur im Westen) [Q50, B- (Vorlesungsankündigung eines Kulturinstituts)].
- Heian-Zeit (794 bis 1185): Kasane no irome, Farbkombinationen übereinander getragener Roben mit Jahreszeitennamen; Geschmack bei der Kombination galt als Ausdruck von Kultur und wurde bewertet; der Zugang zu Rangfarben hing vom Stand ab [Q50, B (Education About Asia, AAS); Q50, B- (Phaidon zum Buch "Iro")].
- Beispiele: Sakura (blasses Rosa) entstand durch Schichtung durchscheinender Stoffe; Kōbai (rosig-rot) entstand, indem ein weißes (shiro) Seidengewand über ein beni-rotes gelegt wurde [Q50, C+/B-]. Indigo und Krapp gelten als älteste pflanzliche Färbemittel [Q50, C+]. Ebi-iro (Rotviolett aus Wildrebe) wurde in Asuka und Nara verwendet [Q50, B (Columbia JAANUS)].
- Hinweis: Anilinrot lässt sich von traditionellem Rot unterscheiden; Fremdwörter für Farben bedeuten nicht, dass Japan diese Farben vorher nicht kannte [Q50, C+].
- Nutzen (Ableitung): Schichtung und Jahreszeitenbezug sind ein eigenes Gestaltungsprinzip: Farbwirkung entsteht aus Überlagerung und nicht nur aus Einzelfarben.

### Berufsrolle Colorist in der Anime-Produktion
- Der Color Designer legt die Farben fest und erstellt Farbspezifikationstabellen (color specification charts), damit viele Personen konsistent koloriert; ein Prüfer (color specification inspector) kontrolliert alles; das Anlegen der Tabellen pro Szene kann Tage dauern [Q51, B (Interview ANN)].
- Das Finishing (Compositing) verarbeitet kolorierte Animation: glättet, ergänzt Beleuchtungs- und Unschärfeeffekte [Q51, B (Interview anitrendz)].
- Herausforderung: Verläufe der Haarfarben (Gradationen) richtig zu treffen [Q51, B].
- Historisch war der Beruf unterschätzt und stark von Frauen geprägt (Disney: Ink and Paint; Ghibli: Chefin des Finishing) [Q51, B-].
- Nutzen (Ableitung): Konsistenz-Prinzip: ein Farbmodell pro Figur und Szene, das jeder Arbeitsschritt nutzt, ist Kern der Anime-Qualität. Für Raymi bedeutet das: eine feste Farbtabelle pro Figur und Stimmung.

## 10. Kritiker-Checkliste Farbe (für Phase 3 des Raster-Dokuments)
1. Vision: Welches Zielgefühl, welche Farben sollen es tragen (Hue, Sättigung, Helligkeit getrennt benennen)?
2. Blind: Welche drei dominanten Farben sieht man zuerst? Welches Gefühl löst die Gesamtstimmung aus?
3. Wertstruktur: Graustufentest bestanden? Hauptmotiv vom Hintergrund getrennt?
4. Sättigungsplan: Wo ist die höchste Sättigung (soll der Blick hin)? Konkurrieren mehrere gesättigte Stellen?
5. Flächenverhältnis: Dominante Farbe, Nebenfarbe, Akzent erkennbar?
6. Harmonie: Welches Schema, passt es zur Absicht (Spannung gegen Ruhe)?
7. Konsistenz: Passt die Palette zum Charakter und zu den anderen Bildern des Videos (kein "gleiche Vorlage immer")?
8. Kontext: Anzeigegröße, Display, Lichtverhältnisse (Bildschirm additiv).
9. Kultur: Kritische Farbbedeutungen für ein Weltpublikum (z.B. Weiß, Violett, Gelb) geprüft?
10. Fix-Liste nach Raster Phase 5.

## 11. Offene Punkte (auch im Register)
Siehe `Quellenregister_und_Luecken.md`, Abschnitt Lückenliste.
