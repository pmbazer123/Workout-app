export interface DrillQuote {
  text: string
  attribution?: string
  context: 'start' | 'mid' | 'rest' | 'complete' | 'general'
}

export const DRILL_QUOTES: DrillQuote[] = [
  // ── WORKOUT START ──────────────────────────────────────────────────────────
  { text: 'Pain is weakness leaving the body. Now get on the floor.', context: 'start' },
  {
    text: "Nobody said it was going to be easy. They said it was going to be worth it. MOVE.",
    context: 'start',
  },
  {
    text: "I've seen better form on a broken-down truck. Get it together, soldier.",
    context: 'start',
  },
  {
    text: "Every rep you skip is a gift to your enemy. DO. NOT. GIVE. GIFTS.",
    context: 'start',
  },
  {
    text: "Drop and give me twenty. Not nineteen. Not twenty-one. TWENTY.",
    context: 'start',
  },
  {
    text: "The only easy day was yesterday. Today you earn it.",
    context: 'start',
  },

  // ── MID-WORKOUT TOASTS ─────────────────────────────────────────────────────
  {
    text: "You call that a push-up? My grandmother does better. And she's buried.",
    context: 'mid',
  },
  {
    text: "Your body is lying to you. It says it's tired. IT IS NOT TIRED.",
    context: 'mid',
  },
  { text: "You don't stop when you're tired. You stop when you're DONE.", context: 'mid' },
  {
    text: "The man who quits is the man who was never serious. Are you serious?",
    context: 'mid',
  },
  { text: "Last set. You didn't come this far to only come this far.", context: 'mid' },
  { text: "HYDRATION CHECK. Drink water. Then get back in the fight.", context: 'mid' },
  {
    text: "Halfway there, soldier. Outstanding. Now finish what you started.",
    context: 'mid',
  },
  { text: "Your future self is watching. Don't embarrass them.", context: 'mid' },

  // ── REST PERIOD ────────────────────────────────────────────────────────────
  { text: "Rest is a weapon. Not a reward. Use it wisely.", context: 'rest' },
  {
    text: "Sixty seconds. Control the breathing. Prepare for contact.",
    context: 'rest',
  },
  {
    text: "Champions don't sleep between rounds. They reset. Now reset.",
    context: 'rest',
  },
  { text: "Breathe. Count. Get ready. The next set won't wait.", context: 'rest' },

  // ── WORKOUT COMPLETE ───────────────────────────────────────────────────────
  {
    text: "MISSION COMPLETE. That is what discipline tastes like. Remember it.",
    context: 'complete',
  },
  {
    text: "You showed up. You finished. That is more than most people ever do. Dismissed.",
    context: 'complete',
  },
  {
    text: "Every warrior has a moment that defines them. You just had yours.",
    context: 'complete',
  },
  {
    text: "Warriors are not born. They are built. Today you built something.",
    context: 'complete',
  },
  {
    text: "Outstanding, soldier. Recovery is a weapon — use it before tomorrow.",
    context: 'complete',
  },

  // ── GENERAL (dashboard / progress) ────────────────────────────────────────
  {
    text: 'Discipline is the bridge between goals and accomplishment.',
    attribution: 'Jim Rohn',
    context: 'general',
  },
  {
    text: 'The more you sweat in training, the less you bleed in battle.',
    context: 'general',
  },
  {
    text: 'Suffer the pain of discipline or suffer the pain of regret. Choose.',
    context: 'general',
  },
  {
    text: 'We do not rise to the level of our expectations — we fall to the level of our training.',
    attribution: 'Archilochus',
    context: 'general',
  },
  {
    text: "It never gets easier. You just get better.",
    context: 'general',
  },
  {
    text: "What the mind can conceive and believe, the body can achieve. Conceive harder.",
    context: 'general',
  },
]

export function getQuoteByContext(context: DrillQuote['context']): DrillQuote {
  const filtered = DRILL_QUOTES.filter((q) => q.context === context)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export function getDailyQuote(): DrillQuote {
  // Deterministic by day of year so the same quote shows all day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  )
  const general = DRILL_QUOTES.filter((q) => q.context === 'general')
  return general[dayOfYear % general.length]
}
