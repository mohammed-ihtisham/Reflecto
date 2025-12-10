<script>
  import { mood, moodTokens } from '$lib/stores/mood.js';
  import AnimatedGradientBackground from './AnimatedGradientBackground.svelte';
  import { get } from 'svelte/store';

  export let currentMood = undefined; // optional external control
  export let singleColumn = false;

  $: resolvedMood = currentMood || get(mood);
  $: tokens = get(moodTokens);
</script>

<div
  class="relative h-screen overflow-hidden text-slate-900 pb-4"
  data-mood={resolvedMood}
  style="
    --accent: {tokens.accent};
    --accent2: {tokens.accent2};
    --bg-from: {tokens.bgFrom};
    --bg-to: {tokens.bgTo};
    --glow: {tokens.borderGlow};
    --anim-speed: {tokens.animationSpeed};
    font-family: var(--font-body);
    font-style: var(--font-style-body);
    font-weight: var(--font-weight-body);
    transition:
      background 800ms ease,
      color 450ms ease,
      font-family 450ms ease,
      font-style 450ms ease,
      font-weight 350ms ease;
  "
>
  <div class="absolute inset-0"
    style="background: linear-gradient(135deg, rgba(var(--bg-from),1), rgba(var(--bg-to),1));"></div>
  <AnimatedGradientBackground />

  <div class="relative mx-auto max-w-8xl px-4 md:px-8 py-4 space-y-6">
    <div class="will-change-transform">
      <slot name="header"></slot>
    </div>
    <div class={`grid grid-cols-1 gap-8 ${singleColumn ? '' : 'xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'}`}>
      {#if singleColumn}
        <div class="will-change-transform max-w-5xl mx-auto w-full">
          <slot name="main"></slot>
        </div>
      {:else}
        <div class="will-change-transform">
          <slot name="left"></slot>
        </div>
        <div class="will-change-transform">
          <slot name="right"></slot>
        </div>
      {/if}
    </div>
  </div>
</div>


