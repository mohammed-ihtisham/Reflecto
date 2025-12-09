<script>
  export let role = 'assistant'; // 'user' | 'assistant'
  export let speed = 1; // Animation speed multiplier (0.5 = slow, 1 = normal, 2.5 = very fast)
  export let keystrokeTrigger = 0; // increments on each keystroke
  export let label = 'Assistant is typing';
  
  $: isUser = role === 'user';

  // Base pulse animation duration - slower for slow typing, faster for fast typing
  $: basePulseDuration = Math.max(800, Math.min(2000, 1200 / speed));
  
  // Bounce duration based on typing speed
  $: bounceDuration = Math.max(200, Math.min(800, 600 / speed));
  
  // Dot wave stagger
  $: staggerDelay = Math.max(30, Math.min(120, 80 / speed));
  
  let dotRefs = [];
  let lastTrigger = 0;

  // Typing bubble intensity state
  let typingTimeout;
  let isTypingActive = false;
  
  // When keystrokeTrigger changes, bounce dots
  $: if (keystrokeTrigger !== lastTrigger && keystrokeTrigger > 0) {
    lastTrigger = keystrokeTrigger;
    triggerBounce();

    // increase bubble motion briefly
    isTypingActive = true;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      isTypingActive = false;
    }, Math.max(600, basePulseDuration));
  }

  function triggerBounce() {
    dotRefs.forEach((dot, i) => {
      if (!dot) return;
      const delay = i * staggerDelay;

      setTimeout(() => {
        dot.style.animation = `bounce-dot ${bounceDuration}ms ease-out`;
        dot.style.animationDelay = '0ms';

        setTimeout(() => {
          if (dot) dot.style.animation = '';
        }, bounceDuration);
      }, delay);
    });
  }
</script>

<div
  class={`typing-shell ${isUser ? 'user' : 'assistant'} ${isTypingActive ? 'is-typing' : ''}`}
  style="--pulse-duration: {basePulseDuration}ms;"
  aria-live="polite"
  aria-label={label}
>
  <!-- Subtle bubble drift background -->
  <div class="bubble-layer" aria-hidden="true">
    {#each [0, 1, 2, 3] as i}
      <span class={`bg-bubble bubble-${i} ${isUser ? 'user' : 'assistant'}`}></span>
    {/each}
  </div>

  <div
    class="typing-halo"
    style={`animation-duration: ${Math.round(basePulseDuration * 1.25)}ms`}
    aria-hidden="true"
  ></div>

  <div
    class="glow-bar"
    style={`animation-duration: ${Math.round(basePulseDuration * 0.95)}ms`}
    aria-hidden="true"
  ></div>

  <div class="typing-dots">
    {#each [0, 1, 2] as i}
      <span
        bind:this={dotRefs[i]}
        class="typing-dot {isUser ? 'user' : 'assistant'}"
        style={`--wave-delay: ${i * 180}ms`}
      ></span>
    {/each}
  </div>
</div>

<style>
/* ───────────────────────── Shell ───────────────────────── */

.typing-shell {
  position: relative;
  max-width: 80%;
  padding: 14px 18px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.08),
    0 0 0 1px rgba(var(--accent, 56, 189, 248), 0.07);
  backdrop-filter: blur(14px);
  transition: transform 200ms ease, box-shadow 200ms ease;
  transform-origin: 0% 50%;
  isolation: isolate;
  background:
    radial-gradient(circle at 0% 0%, rgba(15, 23, 42, 0.12), transparent),
    rgba(15, 23, 42, 0.04);
}

.typing-shell.user {
  transform-origin: 100% 50%;
  background:
    radial-gradient(circle at 0% 0%, rgba(15, 23, 42, 0.14), transparent),
    linear-gradient(135deg, rgba(248, 250, 252, 0.92), rgba(226, 232, 240, 0.96));
}

.typing-shell.assistant {
  background:
    radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.25), transparent),
    linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.12));
}

.typing-shell:hover {
  box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.14),
    0 0 0 1px rgba(var(--accent, 56, 189, 248), 0.13);
  transform: translateY(-1px);
}

/* ─────────────────────── Bubble Drift Layer ─────────────────────── */

.bubble-layer {
  position: absolute;
  inset: -12px;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-bubble {
  position: absolute;
  border-radius: 9999px;
  opacity: 0.45;
  filter: blur(0.4px);
  will-change: transform, opacity;
  animation-name: bubble-drift-slow;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.bg-bubble.assistant {
  background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.8), rgba(16,185,129,0.45));
}

.bg-bubble.user {
  background: radial-gradient(circle at 30% 30%, rgba(15,23,42,0.7), rgba(148,163,184,0.5));
}

/* Ambient bubble placement + slow drift durations */
.bubble-0 {
  width: 52px; height: 52px;
  top: 4px; left: -10px;
  animation-duration: 26000ms;
  animation-delay: -4000ms;
}

.bubble-1 {
  width: 34px; height: 34px;
  bottom: 4px; left: 18%;
  animation-duration: 30000ms;
  animation-delay: -9000ms;
}

.bubble-2 {
  width: 60px; height: 60px;
  top: 22%; right: -18px;
  animation-duration: 28000ms;
  animation-delay: -12000ms;
}

.bubble-3 {
  width: 28px; height: 28px;
  bottom: -2px; right: 24%;
  animation-duration: 32000ms;
  animation-delay: -6000ms;
}

/* Slight energy bump while typing */
.typing-shell.is-typing .bg-bubble {
  animation-name: bubble-drift-active-slow;
  opacity: 0.7;
  filter: blur(0.2px);
}

/* Base drift: subtle, ambient */
@keyframes bubble-drift-slow {
  0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
  25%  { transform: translate3d(2px, -3px, 0) scale(1.02); opacity: 0.5; }
  50%  { transform: translate3d(-1px, -2px, 0) scale(1.01); opacity: 0.55; }
  75%  { transform: translate3d(-3px, 1px, 0) scale(0.99); opacity: 0.48; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
}

/* While typing: same drift path but slightly more alive */
@keyframes bubble-drift-active-slow {
  0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0.55; }
  25%  { transform: translate3d(3px, -4px, 0) scale(1.03); opacity: 0.65; }
  50%  { transform: translate3d(-2px, -3px, 0) scale(1.02); opacity: 0.7; }
  75%  { transform: translate3d(-3px, 2px, 0) scale(1); opacity: 0.6; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.55; }
}

/* ───────────────────────── Effects Layer ───────────────────────── */

.typing-halo {
  position: absolute;
  inset: -16px;
  background: radial-gradient(circle at 20% 0%, rgba(16,185,129,0.32), rgba(59,130,246,0.18));
  filter: blur(26px);
  opacity: 0.6;
  animation: haloPulse var(--pulse-duration) ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.glow-bar {
  position: absolute;
  top: 8px; left: 14px; right: 14px;
  height: 2px;
  background: linear-gradient(90deg,transparent,rgba(16,185,129,0.65),rgba(59,130,246,0.6),transparent);
  opacity: 0.55;
  animation: shimmer var(--pulse-duration) ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* ───────────────────────── Dot UI ───────────────────────── */

.typing-dots {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.typing-shell.is-typing .typing-dot {
  animation-duration: calc(var(--pulse-duration) * 1.2);
}

.typing-dot {
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  will-change: transform, opacity;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.35));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.25),
    0 4px 10px rgba(15, 23, 42, 0.12);
  animation:
    pulse-dot var(--pulse-duration) ease-in-out infinite,
    float-dot calc(var(--pulse-duration) * 1.25) ease-in-out infinite,
    bounceWave calc(var(--pulse-duration) * 1.6) ease-in-out infinite;
  animation-delay:
    0ms,
    200ms,
    var(--wave-delay, 0ms);
}

.typing-dot.assistant {
  background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.95), rgba(16,185,129,0.8));
}

.typing-dot.user {
  background: radial-gradient(circle at 30% 30%, rgba(71,85,105,0.9), rgba(148,163,184,0.7));
}

/* ───────────────────────── Dot Animations ───────────────────────── */

@keyframes pulse-dot {
  0%, 100% { opacity: 0.4; transform: scale(0.85) translateY(0); }
  50% { opacity: 0.9; transform: scale(1.08) translateY(-1px); }
}

@keyframes bounce-dot {
  0% { opacity: 0.5; transform: translateY(0) scale(0.9); }
  30% { opacity: 1; transform: translateY(-12px) scale(1.5); }
  60% { opacity: 0.95; transform: translateY(-4px) scale(1.1); }
  100% { opacity: 0.5; transform: translateY(0) scale(0.9); }
}

@keyframes bounceWave {
  0%   { transform: translateY(0) scale(0.9); }
  30%  { transform: translateY(-6px) scale(1.05); }
  60%  { transform: translateY(-2px) scale(1.02); }
  100% { transform: translateY(0) scale(0.92); }
}

/* ───────────────────────── Misc Effects ───────────────────────── */

@keyframes haloPulse {
  0%   { opacity: 0.45; transform: scale(0.98); }
  50%  { opacity: 0.92; transform: scale(1.04); }
  100% { opacity: 0.45; transform: scale(0.99); }
}

@keyframes shimmer {
  0%   { opacity: 0.35; transform: translateX(-6px) scaleX(0.9); }
  50%  { opacity: 0.95; transform: translateX(0) scaleX(1.05); }
  100% { opacity: 0.35; transform: translateX(6px) scaleX(0.92); }
}

@keyframes float-dot {
  0%   { transform: translateY(0) translateX(0) scale(0.9); }
  50%  { transform: translateY(-6px) translateX(4px) scale(1.04); }
  100% { transform: translateY(0) translateX(0) scale(0.92); }
}
</style>
