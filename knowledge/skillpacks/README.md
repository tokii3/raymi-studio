# Skill packs for motion / video (surveyed 2026-10-27)

toki 2026-10-27 showed four TikToks (a paid motion-graphics skill, MANI NPR for Blender, Higgsfield Katana, Chase's
`animate` skill) and asked: are there similar packs, free first, to try other styles and raise the quality? No
generative AI; adopt the skills and build them in so they are really used.

Rule: the packs are read, then distilled in our words into our own skills, agents and checks. We do NOT install
them as they are: they are written for launch films and explainers, for other renderers (HyperFrames / canvas /
GSAP), and several call paid generative services. Their code is not copied. Their reference media is not copied.

## What was looked at
| pack | licence / price | what it is | verdict for Raymi |
|---|---|---|---|
| Miftahul "Motion-graphics-skill" (the paid TikTok one) | repo gone; now sold as "Motion Video Director" on a subscription site (Motionsmith) | brief -> VO -> storyboard -> build -> contact-sheet preview -> render + mix | nothing to buy: every step already exists here (writers' room, storyboard, screening kit), and the rules it is known for are covered by the free packs below |
| cth9191/animate (Chase, video 4) | MIT, free | canvas `frame(t)` films; intake -> story -> look -> storyboard -> build; craft rules; **new style from references** | ADOPTED: craft rules (story / timing / transitions), style-from-references method -> `raymi style`, `knowledge/styles/` |
| iart-ai/motion-design-skills | MIT, free | 9 skills: beat-sync editing, shot composition, colour, animation principles, art direction, AE, Remotion | ADOPTED: beat grid + phrases + arc + speed ramps (editing), depth roles + safe areas (composition) |
| Tejashmakwana/motionmaxxing | Apache-2.0, free (GSAP inside has its own licence) | a director skill measured on ~4,300 moves of 53 pro moments; slop table; gates | ADOPTED: measured durations / eases / camera numbers / smear / clocks, transition rules, slop tells, "describe every frame before judging" |
| heygen-com/hyperframes skills (motion-doctrine, seam-craft, cut-the-curve) | Apache-2.0, free | HTML -> MP4 renderer + motion law | ADOPTED: the vector law for seams + carriers + no idle wobble -> `raymi seams` |
| LottieFiles/motion-design-skill | MIT, free | motion principles for UI / Lottie | read; little beyond the above for an MV |
| dylantarre/animation-principles | MIT, free | 144 small skills on Disney's 12 principles | not adopted: UI-oriented, already in knowledge/craft and raymi-posing-acting |
| remotion-dev/skills (official) | free | Remotion API best practice | optional for studio code; our studio has its own proven patterns |
| fal-ai-community/skills (cinematography, storytelling) | free | prompt vocabulary for AI video generators | not adopted (generative AI) |
| charlie947/motion-graphics-skills | MIT, free | 13 launch-video skills | not adopted: product-launch specific |
| MANI NPR (Blender) / NPR Shader Kit ($9.99, GPL) | paid add-ons | toon / manga / painterly rendering for 3D | not now: our toon look lives in three.js / Remotion (PostFX, TwoTone, VRM outline); a Blender NPR pass only if a video is ever rendered in Blender |
| Higgsfield Katana | subscription + credits | generative re-edits with your character | NO: generative AI and loss of control |

## Where it went (the places that are actually loaded)
- `.claude/skills/raymi-editing/pro_rules.md` - grid, phrases, arc, the vector law, carriers, transitions, silence before the payoff
- `.claude/skills/raymi-camera/pro_rules.md` - snap + tail, move size by length, two-push pans, parallax, whips, dives, drift
- `.claude/skills/raymi-2d-techniques/pro_rules.md` - one clock / one blur grammar, durations, arrival, stagger, smear numbers
- `.claude/skills/raymi-screening/slop_tells.md` - AI default vs professional, "describe every frame first"
- `.claude/skills/raymi-references/style_from_refs.md` + `knowledge/styles/` - trying a new look by measuring it
- `raymi/seams.py` (`python -m raymi seams <job>`; summary + warnings in every `timeline` run) - the vector law measured
- `raymi/style.py` (`python -m raymi style measure | compare`) - a look in numbers
- the maker agents (camera-director, editor, fx-designer, look-designer, choreographer) and the cut / motion critics read the files above

Sources: github.com/cth9191/animate, github.com/iart-ai/motion-design-skills, github.com/Tejashmakwana/motionmaxxing,
github.com/heygen-com/hyperframes, github.com/LottieFiles/motion-design-skill, github.com/dylantarre/animation-principles,
remotion.dev/docs/ai/skills, github.com/fal-ai-community/skills, github.com/charlie947/motion-graphics-skills,
skillsllm.com/skill/motion-graphics-skill, github.com/Miftahul-Islam-Efaz/Motionsmith.
