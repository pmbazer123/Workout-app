# Calisthenics Coach Review — Updated June 21 2026

## Benchmark Results (June 21 2026)
- Push-Up: **22 reps**
- Pike Push-Up: **21 reps**
- Bulgarian Split Squat: **20 each leg** (test cap hit — actual max is higher)
- Hollow Body Hold: **60 seconds**

Row tests not completed yet. Programming assumes pull is in the same ballpark as push.

## Bottom Line After Audit
The original plan was built too conservatively. The benchmark numbers confirm this person is stronger than the plan assumed. The main issues identified and fixed are below.

## What Was Good Already
- 4 training days + 2 run days + 2 rest days per week is the right structure.
- The push / pull / full body split gives good weekly balance.
- Hollow Body Hold and Dead Bug are excellent core choices.
- Backpack rows are an honest substitute for a bar — not ideal, but usable.
- 20-30 minute session cap is a good constraint for sustainability.

## Problems Found and Fixed

### 1. Plan was calibrated for someone weaker
Week 1 started at 4×8 push-ups and 3×20s hollow body holds. With a 22-rep push-up max and a 60-second hollow body hold, those numbers were too easy from Day 1.

**Fix:** Recalibrated to ~60% of benchmark max for Week 1, progressing from there:
- Push-Up: 4×8 → 4×12
- Pike Push-Up: 3×6 → 3×10
- Hollow Body Hold: 3×20s → 3×40s
- Week 2+: corresponding increases throughout

### 2. Week 4 regressed instead of consolidating
Week 4 was labeled "Consolidation" but dropped back to Week 1 exercise variations and rep counts. Push day went from Decline Push-Up 4×10 (Week 3) back to regular Push-Up 3×10 (Week 4). Hollow Body Hold dropped from 4×25s back to 3×20s.

Consolidation should mean: reduce sets by one, hold the same exercise variation and intensity.

**Fix:** Week 4 now keeps Decline Push-Up, Pike, and the same rep ranges as Week 3, with one fewer set.

### 3. Bulgarian Split Squat armor vest progression was too soft
The vest was listed as "optional" throughout the plan. But since bodyweight Bulgarian split squats are easy enough that the test was capped at 20 reps, the vest needs to be mandatory from Week 2 onward to drive any actual leg adaptation.

**Fix:** Vest language changed from "optional" to standard from Day 8 onward.

### 4. Equipment filter was too aggressive in the bot
The bot was filtering out Decline Push-Ups, Feet-Elevated Push-Ups, and Bulgarian Split Squats as "equipment-dependent" exercises. These only need a chair or sofa. The filter was leaving push days with no leg work and making the bot's workout display look like a core-only session.

**Fix:** Filter now only removes backpack exercises. Chair/sofa exercises display normally.

### 5. Pull days showed as 2-exercise core sessions
With the old filter removing all backpack exercises, pull days (Days 3, 10, 17, 24) appeared as Hamstring Walkout + Reverse Crunch only. The bot showed this as the "equipment-free version" without flagging that the full session was hidden.

**Fix:** When all exercises on a day are filtered out (e.g. a pure pull day), the bot now shows all exercises with a note that a loaded backpack is needed.

### 6. No restart command existed
To reset the cycle, the state JSON had to be edited manually. This is brittle.

**Fix:** Added `/restart` command with a confirmation keyboard. Clears history, sets start date to today, keeps reminder settings.

### 7. Day 6 benchmark notes referenced a previous cycle
The notes said "You already completed most of the benchmark" — text written for a specific moment that became stale on a new cycle.

**Fix:** Rewritten to be cycle-agnostic instructions.

## Remaining Limitations (Known, Not Fixed)

### Pulling is still the weakest area
Backpack rows are the only pulling work. Load progression is limited by how much weight fits in a backpack. Without a pull-up bar:
- There is a real cap on pulling strength development
- The plan cannot produce the back thickness that vertical pulling gives

**What to do:** Buy a pull-up bar. When you have one, the plan should be revised to replace Backpack Rows with Inverted Rows (weeks 1-2) and Pull-Ups (weeks 3-4). Until then, the backpack rows are the best available option.

### Row benchmark still missing
We do not have actual pull numbers from the benchmark. The plan assumes pull is roughly on par with push. If pull is significantly weaker, the row volumes may need adjustment.

**What to do:** Complete the row tests on Day 6 when the plan arrives at it in this new cycle, and update accordingly.

### No warm-up in strength sessions
Every strength session goes straight into working sets. A 5-minute warm-up (arm circles, hip hinges, leg swings) would reduce injury risk for a 37-year-old and likely improve first-set performance.

**Not fixed because:** It would add to message length and session time. Can be added as a standard pre-session note if wanted.

## Re-Entry Rule After Missing Sessions
If the cycle is interrupted:
- Miss 1-5 days: use `/restart` to reset to Day 1 with today's date, then train normally. The bot auto-skips no days on a fresh start.
- Miss 6+ days: same — restart and treat it as a new cycle. There is no penalty.
- The `/undo` command handles same-day mistakes only.
