You are upgrading an existing Svelte + Tailwind CSS codebase for an app called Reflecto.
Reflecto is a multimodal journaling companion that blends conversational dialogue, emotional awareness, and visual storytelling. It never pretends to be human; it acts as a mirror, a facilitator, and a guide for reflective thinking. Your task is to redesign the entire frontend to be modern, sleek, emotionally adaptive, expressive, and uniquely interactive, while remaining calm, humane, and non-performative.

🎯 Design Philosophy & Constraints

Use these research-based principles throughout:

1. Critical, Non-Biased Reflection

The UI should support honest, objective introspection.

Avoid emotionally manipulative or “warm human mimicry.”

Visual language should be grounding, not cutesy or anthropomorphic.

2. Digital Support, Not Human Substitution

Avoid avatars or features that imply “personhood.”

Focus on tools (visuals, pacing, multimodal summaries) over “companionship.”

3. Reciprocity & Pacing

Slow, intentional animations.

Messages should encourage thinking, not just reacting.

Prioritize low-pressure re-engagement.

4. Transparency & Non-Pretending

Make it visually obvious that the AI is a reflective system, not a human.

UI elements should feel structured, crafted, and “designed,” not “alive.”

5. Depth Through Consistency

Create a visual rhythm that gently invites return.

Subtle ambient motion, calm breathing effects, and adaptive theming promote familiarity.

6. No Glazing

Avoid over-glossy “positive” color palettes and overly-affirmative design patterns.

Use minimalistic, honest, grounded effects.

🪞 Core Experience to Build
➤ Left Side: Conversational Canvas

A slow, journaling-centric chat space that feels like a modern reflective studio.

Implement:

Dynamic mood header (e.g., “You seem thoughtful today”)

Glassmorphic chat bubbles

Emotion-adaptive color accents

Word-by-word message reveals

Subtle breathing-style typing indicator

Input bar that gently expands on focus (no bright flares)

Idle “guided suggestion prompts” above input

Micro-interactions:

subtle hover tilt

soft ripple on click

gradient border glow tied to emotional valence

The chat should feel more like a mindful conversation space than a chat app.

➤ Right Side: Visual Reflection Canvas

A dynamic diary pane that produces comic-style “Snapshot of the Day” panels.

Implement:

A 6-panel grid with soft shadows + staggering fade-in

Glass panels with slight parallax movement

Panels should appear like Polaroids or sketch frames

Mood-adaptive strokes (greens, lavenders, teals, gold accents depending on tone)

Clicking a panel → opens modal with:

Emoji emotional tags

Text summary

Room for image generation later

Optional:

“Shuffle comic layout” button with elastic animation

Drag-and-drop rearrangement

This pane should feel like a living illustrated diary, not a sterile dashboard.

🎨 Visual Language Requirements
Typography

Base: Inter

Reflective/emotional moments: EB Garamond Italic

Empathetic notes or summaries: Poppins Semibold (used sparingly)

Typefaces should modulate gradually based on emotional tone (valence, depth, pacing).

Color & Mood System

Use slow-transitioning diagonally-animated gradients:

Happy/Neutral: muted greens + warm yellow accents

Reflective/Somber: lavender + dusty purple

Motivational: teal + subtle gold

Low-Energy: deep navy + forest green

The background gradient slowly breathes, shifting only slightly between messages.

Animations

Use gentle, meditative motion:

Chat bubble fade-up + 2–3px lift

Typing dots that breathe (slower for deep reflection)

Panels that pop in with 40ms stagger

Input bar pulse when unfocused

Brief hesitation before deep questions

Avoid fast or “playful” animations; stay grounded and calm.

🔧 Implementation Details

Use:

Svelte transitions (fade, slide, scale)

Tailwind CSS with custom animations

Backdrops + blurs for glassmorphism

CSS variables for mood colors

Framer-motion-like timing (if applicable)

Add a global “emotion state variable” that affects:

gradient

accent colors

bubble border

animation speed

typeface style

🧪 Evaluation Metrics to Design Around

Build UI components that support these metrics programmatically:

Reflective Depth Index → Show more EB Garamond, slower animations

Suggestiveness Score → Reduce bold fonts, warm colors if score rises

User-Centric Question Ratio → Chat bubble coloration subtlety

Emoji Emotional Accuracy Rate → Panel mood visualization clarity

Critical Thinking Ratio → Emphasize non-directive, open-ended phrasing

The UI must visually reinforce autonomy, reflection, and honesty.

🧩 Your Task: Generate Code + Components

Based on everything above, produce:

1. A complete redesign of the Reflecto home screen layout

chat left, visual canvas right

modern, minimal, atmospheric

2. New components

<MoodHeader />

<ReflectiveChatBubble />

<BreathingTypingIndicator />

<SuggestionChips />

<SnapshotPanel />

<SnapshotModal />

<AnimatedGradientBackground />

<MoodAdaptiveLayout />

3. Tailwind utility classes + custom animations

breathing

soft parallax

gradient drift

delayed fade

4. Revised global theme tokens

color variables

typography scales

mood → motion mapping

5. Clean, modular Svelte architecture

Follow component boundaries, state stores, transitions, and props cleanly.

🧷 Output Requirements

Provide the new folder/component structure

Generate Svelte component code

Generate Tailwind config extensions

Include markdown commentary explaining key decisions

Apply all the emotional, reflective, and anti-glazing principles

Make it beautiful, modern, calm, and deeply human-aware without pretending to be human