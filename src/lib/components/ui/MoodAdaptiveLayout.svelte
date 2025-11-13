<script>
  import { mood, moodTokens } from '$lib/stores/mood.js';
  import AnimatedGradientBackground from './AnimatedGradientBackground.svelte';
  import { get } from 'svelte/store';

  export let currentMood = undefined; // optional external control

  $: resolvedMood = currentMood || get(mood);
  $: tokens = get(moodTokens);
</script>

<div
  class="relative h-screen overflow-hidden text-slate-100"
  data-mood={resolvedMood}
  style="
    --accent: {tokens.accent};
    --accent2: {tokens.accent2};
    --bg-from: {tokens.bgFrom};
    --bg-to: {tokens.bgTo};
    --glow: {tokens.borderGlow};
    --anim-speed: {tokens.animationSpeed};
  "
>
  <div class="absolute inset-0"
    style="background: linear-gradient(135deg, rgba(var(--bg-from),1), rgba(var(--bg-to),1));"></div>
  <AnimatedGradientBackground />

  <div class="relative mx-auto max-w-8xl px-4 md:px-8 py-4">
    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-8">
      <div class="will-change-transform">
        <slot name="left"></slot>
      </div>
      <div class="will-change-transform">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</div>


