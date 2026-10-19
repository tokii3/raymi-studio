# Critic calibration - toki's verdict vs the stored critic answers

Why: the critics (`.claude/agents`) exist to find real faults and to refuse generic slop - not to replace toki's taste
(toki 2026-10-16: "die kritiker sind dazu da um fehler zu finden und schlechte generische slop sachen abzulehnen ...
aber sie sollen nicht zu viel blockieren und einschraenken"). After every package, its verdict is compared with what
the critics said: what they caught that she also saw, what they blocked that she approved, what they missed. The
result changes the agents (their first questions, what may block) - never a single video.

One file per package: `<date>_<song>.md` (table + what changed in the agents). Read the newest before screening.

| package | critics right | critics over-blocked | critics missed | agents changed |
|---|---|---|---|---|
| [KING 2026-10-19](2026-10-19_KING.md) | lyrics flat / small / thin; untranslated Japanese | crowd look, props, holds, cut rhythm, story (toki uploaded, liked animation + effects) | the crown = the main element unreadable | hero first, lyric weight first, BLOCK only real faults / slop, catalog status respected |

Rule change 2026-10-19 (toki, before the Firestarter package): "raymi muss nicht immer ins bild forciert werden ...
auch wenn lyrics sie mal überdecken ist das nicht all zu schlimm ... solange raymi nicht dauerhaft abgeschnitten wird".
Story / type / look critics no longer flag a shot without her or lyrics flying over her; the guard (check.ts) only
refuses text PARKED on her face (>= 0.6 s) or burying > 60 % of her figure for a whole line. Script critic: new
`OPENING:` line (Know My Name lost viewers in the first 3 s).
