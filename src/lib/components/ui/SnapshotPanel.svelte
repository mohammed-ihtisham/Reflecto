<script>
  export let title = 'Moment';
  export let subtitle = '';
  export let mood = 'thoughtful';
  export let onClick = undefined;
  export let tilt = 0;
</script>

<button
  type="button"
  class="group aspect-[4/3] rounded-2xl bg-white text-slate-900 border border-stone-200 shadow-[0_6px_30px_rgba(0,0,0,0.15)] overflow-hidden relative
         transition-transform duration-300 focus:outline-none"
  data-mood={mood}
  on:click|stopPropagation={() => onClick && onClick()}
  style="transform: translateZ(0) rotate({tilt}deg)"
>
  <div class="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent2/10 opacity-60"></div>
  <div class="absolute inset-0 animate-parallax"
       style="background: radial-gradient(80% 60% at 30% 10%, rgba(0,0,0,0.05), transparent 60%);"></div>
  <div class="relative h-full w-full p-2 grid grid-rows-[auto_1fr]">
    <div class="text-[10px] uppercase tracking-wide text-stone-500">{subtitle}</div>
    <div class="self-end text-sm font-semibold font-display">{title}</div>
  </div>
  <span class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style="box-shadow: inset 0 0 0 2px rgba(var(--accent),0.25); border-radius: 1rem;"></span>
</button>


