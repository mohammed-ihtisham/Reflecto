<script>
  export let role = 'assistant'; // 'user' | 'assistant'
  export let speed = 1; // Animation speed multiplier (0.5 = slow, 1 = normal, 2.5 = very fast)
  export let keystrokeTrigger = 0; // Increments on each keystroke to trigger bounce
  
  $: isUser = role === 'user';
  
  // Base pulse animation duration - slower for slow typing, faster for fast typing
  $: basePulseDuration = Math.max(800, Math.min(2000, 1200 / speed));
  
  // Bounce duration based on typing speed
  // Fast typing = quick bounce, slow typing = slower bounce
  $: bounceDuration = Math.max(200, Math.min(800, 600 / speed));
  
  // Stagger delays between dots for wave effect
  $: staggerDelay = Math.max(30, Math.min(120, 80 / speed));
  
  let dotRefs = [];
  let lastTrigger = 0;
  
  // Trigger bounce animation when keystrokeTrigger changes
  $: if (keystrokeTrigger !== lastTrigger && keystrokeTrigger > 0) {
    lastTrigger = keystrokeTrigger;
    triggerBounce();
  }
  
  function triggerBounce() {
    // Trigger bounce on each dot with stagger
    dotRefs.forEach((dot, i) => {
      if (dot) {
        const delay = i * staggerDelay;
        setTimeout(() => {
          // Temporarily override with bounce animation
          dot.style.animation = `bounce-dot ${bounceDuration}ms ease-out`;
          
          // After bounce completes, restore pulse animation
          setTimeout(() => {
            if (dot) {
              dot.style.animation = `pulse-dot ${basePulseDuration}ms ease-in-out infinite`;
              dot.style.animationDelay = `${i * 150}ms`;
            }
          }, bounceDuration);
        }, delay);
      }
    });
  }
</script>

<div
  class="max-w-[80%] md:max-w-[70%] rounded-3xl border transition-all duration-300 backdrop-blur-xl will-change-transform
    {isUser ? 'bg-white/90' : 'bg-white/80'}"
  style="
    border-color: rgba(15,23,42,0.08);
    box-shadow:
      0 0 0 1px rgba(var(--accent),0.08),
      0 10px 30px rgba(15,23,42,0.08);
    padding: 16px 20px;
    transform-origin: {isUser ? '100% 50%' : '0% 50%'};
  "
>
  <div class="flex items-center gap-1.5">
    {#each [0, 1, 2] as i}
      <span
        bind:this={dotRefs[i]}
        class="block h-2 w-2 rounded-full {isUser ? 'bg-slate-500/70' : 'bg-emerald-500/80'} drop-shadow-sm typing-dot"
        style="
          animation: pulse-dot {basePulseDuration}ms ease-in-out infinite;
          animation-delay: {i * 150}ms;
        "
      ></span>
    {/each}
  </div>
</div>

<style>
  @keyframes pulse-dot {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.85) translateY(0);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05) translateY(-1px);
    }
  }
  
  @keyframes bounce-dot {
    0% {
      opacity: 0.4;
      transform: scale(0.85) translateY(0);
    }
    30% {
      opacity: 1;
      transform: scale(1.4) translateY(-5px);
    }
    60% {
      opacity: 0.9;
      transform: scale(1.15) translateY(-2px);
    }
    100% {
      opacity: 0.4;
      transform: scale(0.85) translateY(0);
    }
  }
  
  .typing-dot {
    will-change: transform, opacity;
  }
</style>

