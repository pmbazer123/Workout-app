import type { ExerciseData } from '@/types'

// 25 exercises across all fitness levels. IDs are assigned by the DB after seed.
export const EXERCISES: Omit<ExerciseData, 'id'>[] = [
  // ── RECRUIT (bodyweight fundamentals) ────────────────────────────────────

  {
    name: 'Push-Up',
    category: 'push',
    description:
      'The foundational upper-body press. Builds chest, shoulders, and triceps while maintaining a rigid plank position.',
    musclesTargeted: ['chest', 'anterior deltoid', 'triceps', 'core'],
    formCues: [
      'Hands shoulder-width apart, fingers pointing forward',
      'Body forms a rigid plank from heels to crown — no sagging hips',
      'Lower until chest grazes the floor',
      'Exhale on the push, inhale on the way down',
      'Elbows track at 45° from torso — not flared wide',
      'Full lockout at the top — squeeze the chest',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Bodyweight Squat',
    category: 'legs',
    description:
      'The king of lower-body movements. Builds quad, glute, and hamstring strength with full knee and hip mobility.',
    musclesTargeted: ['quadriceps', 'glutes', 'hamstrings', 'calves', 'core'],
    formCues: [
      'Feet shoulder-width apart, toes turned out 15-30°',
      'Sit back and down — weight on mid-foot to heels',
      'Knees track over second toe — never caving inward',
      'Break parallel: crease of hip below top of knee',
      'Keep chest tall and spine neutral throughout',
      'Drive through heels to stand, squeezing glutes at top',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Plank',
    category: 'core',
    description:
      'Isometric core stability. Builds anti-extension strength in the abs, obliques, and lower back.',
    musclesTargeted: ['rectus abdominis', 'obliques', 'transverse abdominis', 'lower back', 'shoulders'],
    formCues: [
      'Elbows directly under shoulders, forearms flat',
      'Body is a straight line — no pike, no sag',
      'Squeeze glutes and quads to lock the spine',
      'Tuck chin slightly — neutral neck, gaze at floor',
      'Breathe steadily — do not hold your breath',
      'Press forearms into floor like trying to pull them together',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Jumping Jack',
    category: 'cardio',
    description:
      'Classic full-body warm-up and cardio drill. Elevates heart rate and improves coordination.',
    musclesTargeted: ['deltoids', 'hip abductors', 'calves', 'core'],
    formCues: [
      'Start with feet together, arms at sides',
      'Jump feet out past shoulder-width as arms rise overhead',
      'Land softly on the balls of your feet',
      'Maintain a slight knee bend throughout',
      'Arms make a full arc — touch overhead each rep',
      'Keep a steady rhythm — do not rush',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Mountain Climber',
    category: 'cardio',
    description:
      'Dynamic core and cardio movement. Builds hip-flexor strength and metabolic conditioning.',
    musclesTargeted: ['core', 'hip flexors', 'chest', 'shoulders', 'quads'],
    formCues: [
      'Start in a high push-up position — wrists under shoulders',
      'Drive one knee toward chest while keeping hips level',
      'Alternate legs in a controlled run — not a flail',
      'Hips stay parallel to the floor — no rocking',
      'Engage core hard — imagine doing a plank while running',
      'Prioritise form over speed',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Glute Bridge',
    category: 'legs',
    description:
      'Hip extension targeting the posterior chain. Essential for knee health and explosive power.',
    musclesTargeted: ['glutes', 'hamstrings', 'lower back', 'core'],
    formCues: [
      'Lie on back, feet flat on floor, knees bent at 90°',
      'Drive hips up by squeezing glutes — not by pushing with the back',
      'At the top, form a straight line from shoulder to knee',
      'Hold 1 second at the top — maximise the glute squeeze',
      'Lower slowly — 2 seconds down',
      'Feet stay flat — do not rise on toes',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Superman Hold',
    category: 'core',
    description:
      'Posterior chain isolation for lower back and glutes. Critical for spinal stability.',
    musclesTargeted: ['erector spinae', 'glutes', 'rear deltoids', 'hamstrings'],
    formCues: [
      'Lie face down, arms extended overhead',
      'Simultaneously lift arms, chest, and legs off the floor',
      'Squeeze glutes and posterior — not just the back',
      'Hold at the top for 2 seconds before lowering',
      'Keep neck neutral — look at the floor, not forward',
      'Control the descent — do not drop',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Reverse Lunge',
    category: 'legs',
    description:
      'Unilateral leg strength with less knee stress than forward lunges. Builds balance and glute activation.',
    musclesTargeted: ['glutes', 'quadriceps', 'hamstrings', 'calves', 'core'],
    formCues: [
      'Stand tall, step one foot directly back',
      'Lower back knee toward the floor — stop 1 inch off',
      'Front shin stays vertical — knee over ankle, not toes',
      'Drive through the front heel to return to standing',
      'Keep torso upright — no forward lean',
      'Alternate legs each rep unless specified otherwise',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },
  {
    name: 'Tricep Dip (Floor)',
    category: 'push',
    description:
      'Bodyweight tricep isolation using the floor. Builds pushing endurance without any equipment.',
    musclesTargeted: ['triceps', 'anterior deltoid', 'chest'],
    formCues: [
      'Sit with hands behind you, fingers pointing forward',
      'Feet flat on floor, hips lifted off the ground',
      'Bend elbows straight back — not flared out',
      'Lower hips toward floor by bending elbows only',
      'Push back up to full extension without swinging',
      'Keep hips elevated throughout — do not rest them',
    ],
    equipment: ['none'],
    fitnessLevels: ['Recruit', 'Soldier', 'Operator'],
  },

  // ── SOLDIER (adds pulling movements and intensity) ────────────────────────

  {
    name: 'Pull-Up',
    category: 'pull',
    description:
      'The gold standard upper-body pulling movement. Tests and builds true relative strength.',
    musclesTargeted: ['latissimus dorsi', 'biceps', 'rear deltoids', 'rhomboids', 'core'],
    formCues: [
      'Dead hang start — full arm extension, shoulders engaged',
      'Pull elbows down and back toward your hip pockets',
      'Chin clears the bar — no partial reps',
      'Lower with control — 2-3 seconds down',
      'Do not kip or swing — dead-stop reps only',
      'Squeeze shoulder blades together at the top',
    ],
    equipment: ['pull_up_bar'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Burpee',
    category: 'full_body',
    description:
      'The most demanding bodyweight movement. Combines a push-up, plank, and squat jump into one conditioning beast.',
    musclesTargeted: ['chest', 'shoulders', 'triceps', 'core', 'quads', 'glutes', 'calves'],
    formCues: [
      'Stand tall, then squat down and place hands outside feet',
      'Jump or step feet back to push-up position',
      'Perform one full push-up — chest to floor',
      'Jump or step feet back to squat position',
      'Explode upward into a jump, arms overhead',
      'Land softly, absorb with bent knees — immediately into next rep',
    ],
    equipment: ['none'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Dip',
    category: 'push',
    description:
      'Compound push for chest, triceps, and shoulders. Greater range of motion than floor dips.',
    musclesTargeted: ['lower chest', 'triceps', 'anterior deltoid'],
    formCues: [
      'Support yourself at arms length on the bars',
      'Slight forward lean (15-20°) emphasises the chest',
      'Lower until shoulders are below elbows',
      'No swinging — core stays tight',
      'Push to full lockout at the top',
      'Control the descent — 2-3 seconds down',
    ],
    equipment: ['dip_bars'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Jump Squat',
    category: 'legs',
    description:
      'Plyometric lower-body power drill. Develops explosive strength for running and jumping.',
    musclesTargeted: ['quadriceps', 'glutes', 'calves', 'hamstrings'],
    formCues: [
      'Start with a standard squat position',
      'Descend to parallel, then explode upward maximally',
      'Fully extend hips, knees, and ankles at the top',
      'Land softly in squat position — absorb through the legs',
      'Immediate transition into next rep',
      'If landing is loud, absorb more — be silent',
    ],
    equipment: ['none'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Hollow Body Hold',
    category: 'core',
    description:
      'Advanced isometric core compression. Foundation of gymnastic strength and the most demanding abdominal drill.',
    musclesTargeted: ['rectus abdominis', 'transverse abdominis', 'hip flexors', 'obliques'],
    formCues: [
      'Lie on back, press lower back firmly into the floor',
      'Lift shoulders slightly and extend arms overhead',
      'Legs extend out, raise to ~45° or lower if possible',
      'Lower back must stay glued to the floor throughout',
      'If lower back lifts, raise legs higher',
      'Hold the tension — breathe in short controlled breaths',
    ],
    equipment: ['none'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Inverted Row',
    category: 'pull',
    description:
      'Horizontal pulling movement. A bodyweight row for back and biceps without a vertical bar.',
    musclesTargeted: ['latissimus dorsi', 'rhomboids', 'biceps', 'rear deltoids', 'core'],
    formCues: [
      'Lie under a table or low bar, grip overhand',
      'Body forms a straight line from heels to crown',
      'Pull chest to the bar by driving elbows back',
      'Squeeze shoulder blades at the top — pause 1 second',
      'Lower slowly — 3 seconds down',
      'Keep hips up — do not let them sag',
    ],
    equipment: ['pull_up_bar'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Pike Push-Up',
    category: 'push',
    description:
      'Shoulder-dominant push-up variation. Bridges the gap between push-ups and handstand push-ups.',
    musclesTargeted: ['anterior deltoid', 'lateral deltoid', 'triceps', 'upper chest'],
    formCues: [
      'Form an inverted V with hips high, feet close to hands',
      'Lower the crown of the head toward the floor',
      'Elbows track outward — not back like a regular push-up',
      'Push to full arm extension at top',
      'Keep the pike position throughout — hips do not lower',
      'The more vertical your torso, the harder the shoulder demand',
    ],
    equipment: ['none'],
    fitnessLevels: ['Soldier', 'Operator'],
  },
  {
    name: 'Hanging Knee Raise',
    category: 'core',
    description:
      'Hanging core compression. Builds hip flexor and lower ab strength from a dead hang.',
    musclesTargeted: ['hip flexors', 'rectus abdominis', 'obliques', 'forearms', 'lats'],
    formCues: [
      'Dead hang from bar — full shoulder extension',
      'Pull knees to chest by flexing at the hip',
      'Curl the pelvis slightly — do not just lift the knees',
      'Lower legs with control — 2-3 seconds down',
      'Minimise swing — engage core to stay still',
      'Progress: bent knee → straight leg → toes-to-bar',
    ],
    equipment: ['pull_up_bar'],
    fitnessLevels: ['Soldier', 'Operator'],
  },

  // ── OPERATOR (advanced and unilateral) ────────────────────────────────────

  {
    name: 'Pistol Squat',
    category: 'legs',
    description:
      'Single-leg squat to full depth. The pinnacle of lower-body bodyweight strength and balance.',
    musclesTargeted: ['quadriceps', 'glutes', 'hamstrings', 'core', 'hip stabilisers'],
    formCues: [
      'Stand on one leg, other leg extended forward',
      'Sit back and down into a full-depth squat on one leg',
      'Counterbalance: extend arms or the free leg forward',
      'Knee of squatting leg tracks directly over the foot',
      'Touch glute to calf at the bottom — full ROM',
      'Drive through the heel to stand — no momentum',
    ],
    equipment: ['none'],
    fitnessLevels: ['Operator'],
  },
  {
    name: 'Archer Push-Up',
    category: 'push',
    description:
      'Unilateral push-up variation. Loads one arm at a time, building toward one-arm push-ups.',
    musclesTargeted: ['chest', 'triceps', 'anterior deltoid', 'core', 'serratus'],
    formCues: [
      'Start in wide push-up position, one arm straight out to side',
      'Lower toward the bent arm — the straight arm stays locked',
      'The loaded arm handles almost all the pushing',
      'Keep hips level — no rotation',
      'Push back to centre and repeat on opposite side',
      'The wider the straight arm, the harder the movement',
    ],
    equipment: ['none'],
    fitnessLevels: ['Operator'],
  },
  {
    name: 'Muscle-Up',
    category: 'pull',
    description:
      'The ultimate pull-up bar movement. Combines a pull-up and dip in one explosive sequence.',
    musclesTargeted: ['latissimus dorsi', 'chest', 'triceps', 'biceps', 'core', 'shoulders'],
    formCues: [
      'Generate a slight kip from a dead hang',
      'Pull explosively — drive elbows down and chest to bar',
      'As bar hits chest, transition wrists over the bar',
      'Push to full lockout above the bar',
      'Lower in reverse with control — do not drop',
      'Master strict pull-ups and dips separately before attempting',
    ],
    equipment: ['pull_up_bar'],
    fitnessLevels: ['Operator'],
  },
  {
    name: 'L-Sit',
    category: 'core',
    description:
      'Static compression hold between parallel surfaces. Tests hip flexor and core at full contraction.',
    musclesTargeted: ['hip flexors', 'rectus abdominis', 'triceps', 'lats', 'quads'],
    formCues: [
      'Grip parallel bars or push-up handles, arms locked',
      'Lift legs to parallel with the floor — no bending knees',
      'Push down through the bars to elevate hips',
      'Hold the position — breathe steadily',
      'Legs must be straight — bent-knee L-sit is a regression',
      'Progress: tuck hold → one leg out → full L-sit',
    ],
    equipment: ['dip_bars'],
    fitnessLevels: ['Operator'],
  },
  {
    name: 'Handstand Hold',
    category: 'push',
    description:
      'Inverted pressing endurance. Builds shoulder strength and balance for handstand push-ups.',
    musclesTargeted: ['shoulders', 'triceps', 'core', 'wrist stabilisers'],
    formCues: [
      'Kick up with the dominant leg, back against the wall',
      'Arms fully locked — do not bend',
      'Stack: wrists under elbows under shoulders under hips',
      'Point toes and squeeze everything — create full-body tension',
      'Gaze slightly forward toward the floor',
      'Come down slowly — controlled descent, not a fall',
    ],
    equipment: ['none'],
    fitnessLevels: ['Operator'],
  },
  {
    name: 'Dragon Flag Negative',
    category: 'core',
    description:
      "Bruce Lee's core movement. The hardest bodyweight abdominal drill for total spinal stability.",
    musclesTargeted: ['rectus abdominis', 'obliques', 'hip flexors', 'lower back', 'glutes'],
    formCues: [
      'Lie on a bench, grip behind head or sides',
      'Press upper back into bench — only upper traps touch',
      'Raise legs and hips to vertical',
      'Lower the body as one rigid board — extremely slow',
      'Stop just before touching the bench — hold the bottom',
      'If your lower back sags, your abs are giving out — stop',
    ],
    equipment: ['none'],
    fitnessLevels: ['Operator'],
  },
  {
    name: 'Plyometric Push-Up',
    category: 'push',
    description:
      'Explosive push-up where hands leave the ground. Develops upper-body power and fast-twitch muscle fibre.',
    musclesTargeted: ['chest', 'triceps', 'anterior deltoid', 'core'],
    formCues: [
      'Start in standard push-up position',
      'Lower to chest, then explode upward maximally',
      'Hands leave the floor — clap is optional',
      'Land with soft elbows — immediately absorb and descend',
      'Maintain rigid plank — no hip sag on landing',
      'If form breaks, switch to standard push-ups',
    ],
    equipment: ['none'],
    fitnessLevels: ['Operator'],
  },
]
