export interface DrillQuote {
  text: string
  attribution?: string
  context: 'start' | 'mid' | 'rest' | 'complete' | 'general'
}

export const DRILL_QUOTES: DrillQuote[] = [
  // ── WORKOUT START ──────────────────────────────────────────────────────────
  {
    text: "You're 37. Your body is already writing its will. Today you rewrite it.",
    context: 'start',
  },
  {
    text: "Nobody's watching. Nobody cares. That's not an excuse — that's freedom.",
    context: 'start',
  },
  {
    text: "The only difference between you and someone in shape is about 20 minutes. Starting now.",
    context: 'start',
  },
  {
    text: "Your future self is either grateful or embarrassed. You decide which.",
    context: 'start',
  },
  {
    text: "You showed up. That's the bar. It's a low bar. Step over it.",
    context: 'start',
  },
  {
    text: "Warning: this workout will not kill you. Probably.",
    context: 'start',
  },

  // ── MID-WORKOUT TOASTS ─────────────────────────────────────────────────────
  {
    text: "Halfway done. The couch hasn't moved. It's waiting. Ignore it.",
    context: 'mid',
  },
  {
    text: "You're still here. Statistically impressive for someone your age.",
    context: 'mid',
  },
  {
    text: "Your muscles are confused right now. That's called adaptation. Keep going.",
    context: 'mid',
  },
  {
    text: "The hard part was starting. The second hard part is right now.",
    context: 'mid',
  },
  {
    text: "Fun fact: nobody has ever regretted finishing a workout. Not once. Ever.",
    context: 'mid',
  },
  {
    text: "This is the part where most people stop. You're not most people. Probably.",
    context: 'mid',
  },

  // ── REST PERIOD ────────────────────────────────────────────────────────────
  {
    text: "Rest. The only mercy you'll get today.",
    context: 'rest',
  },
  {
    text: "Breathe. Your heart rate is coming down. Don't get too comfortable.",
    context: 'rest',
  },
  {
    text: "Rest is part of the program. Quitting is not.",
    context: 'rest',
  },
  {
    text: "Use this time wisely. Think about the next set. Not the fridge.",
    context: 'rest',
  },
  {
    text: "30 seconds. Enough time to reconsider your life choices and continue anyway.",
    context: 'rest',
  },
  {
    text: "Almost there. The timer is not your enemy. Your sofa is.",
    context: 'rest',
  },

  // ── WORKOUT COMPLETE ───────────────────────────────────────────────────────
  {
    text: "Mission complete. Your ancestors would be mildly impressed.",
    context: 'complete',
  },
  {
    text: "Done. The couch was wrong about you.",
    context: 'complete',
  },
  {
    text: "That's one down. The rest of the plan is already waiting. Go eat something.",
    context: 'complete',
  },
  {
    text: "You did it. Log it. Don't overthink it. Tomorrow's already lined up.",
    context: 'complete',
  },
  {
    text: "Finished. Not bad for a 37-year-old.",
    context: 'complete',
  },
  {
    text: "You trained today. That puts you ahead of the version of you who almost skipped.",
    context: 'complete',
  },

  // ── GENERAL (dashboard daily order) ───────────────────────────────────────
  {
    text: "Showing up is 90% of it. The other 10% is not lying about showing up.",
    context: 'general',
  },
  {
    text: "Consistency beats intensity every time. But intensity is why you're reading this.",
    context: 'general',
  },
  {
    text: "Your competition is yesterday's version of you. He was less fit.",
    context: 'general',
  },
  {
    text: "28 days. You've wasted longer on worse things.",
    context: 'general',
  },
  {
    text: "The plan is simple. Getting off the sofa is the hard part.",
    context: 'general',
  },
  {
    text: "You don't need motivation. You need a calendar and a bad memory for excuses.",
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
