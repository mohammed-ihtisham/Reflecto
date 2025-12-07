<script>
  import { createEventDispatcher, onMount } from 'svelte';
  export let placeholder = "Type what you're feeling";
  const dispatch = createEventDispatcher();
  let value = '';
  let typingSpeed = 1; // Default speed
  let lastTypingTime = Date.now();
  let keystrokeTimes = [];
  const TYPING_WINDOW = 2000; // Track speed over last 2 seconds

  function calculateTypingSpeed() {
    const now = Date.now();
    const recentKeystrokes = keystrokeTimes.filter(time => now - time < TYPING_WINDOW);
    keystrokeTimes = recentKeystrokes;
    
    if (recentKeystrokes.length < 2) {
      typingSpeed = 1; // Default
      dispatch('typing', { speed: typingSpeed, hasText: value.trim().length > 0 });
      return;
    }
    
    const timeSpan = recentKeystrokes[recentKeystrokes.length - 1] - recentKeystrokes[0];
    const avgInterval = timeSpan / (recentKeystrokes.length - 1);
    
    // Calculate speed as a continuous value based on keystroke interval
    // Very fast: <80ms -> speed 2.5
    // Fast: 80-120ms -> speed 1.8-2.0
    // Normal: 120-250ms -> speed 1.0-1.5
    // Slow: 250-400ms -> speed 0.7-1.0
    // Very slow: >400ms -> speed 0.5
    
    if (avgInterval < 80) {
      typingSpeed = 2.5; // Very fast
    } else if (avgInterval < 120) {
      // Linear interpolation between 2.5 and 1.8
      typingSpeed = 2.5 - ((avgInterval - 80) / 40) * 0.7;
    } else if (avgInterval < 250) {
      // Linear interpolation between 1.8 and 1.0
      typingSpeed = 1.8 - ((avgInterval - 120) / 130) * 0.8;
    } else if (avgInterval < 400) {
      // Linear interpolation between 1.0 and 0.7
      typingSpeed = 1.0 - ((avgInterval - 250) / 150) * 0.3;
    } else {
      typingSpeed = 0.5; // Very slow/thoughtful
    }
    
    // Clamp between 0.5 and 2.5
    typingSpeed = Math.max(0.5, Math.min(2.5, typingSpeed));
    
    dispatch('typing', { speed: typingSpeed, hasText: value.trim().length > 0 });
  }

  function handleInput(e) {
    value = e.target.value;
    const now = Date.now();
    keystrokeTimes.push(now);
    calculateTypingSpeed();
    // Dispatch keystroke event for bounce animation
    dispatch('keystroke', { speed: typingSpeed });
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      submit();
    }
  }

  function submit() {
    const content = value.trim();
    if (!content) return;
    dispatch('submit', { content });
    value = '';
    keystrokeTimes = [];
    typingSpeed = 1;
    dispatch('typing', { speed: 1, hasText: false });
  }
</script>

<div class="mt-4">
  <div class="relative">
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      class="w-full rounded-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400
             px-5 py-3 pr-12 transition-all duration-200 shadow-sm
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      on:input={handleInput}
      on:keydown={handleKeydown}
    />
    <button
      type="button"
      aria-label="Send"
      class="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white grid place-items-center
             hover:brightness-105 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/25
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      on:click={submit}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
        <path d="M2.25 12L21.75 3.75L15 12L21.75 20.25L2.25 12Z" />
      </svg>
    </button>
  </div>
</div>


