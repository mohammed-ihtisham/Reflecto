<script>
  export let mood = 'thoughtful';
  export let emoji = '🧠';
  export let statement = 'You seem';
  export let subtitle = 'Journaling companion';
</script>

<div class="flex items-center gap-3 rounded-3xl p-3.5"
     style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(16px); box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(var(--accent),0.08);">
  <div class="h-11 w-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-inner drop-shadow-glow">
    {emoji}
  </div>
  <div class="flex flex-col">
    <div class="text-xl md:text-2xl font-semibold text-slate-100">
      {statement} <span class="font-serif italic text-accent">{mood}</span> today
    </div>
    {#if subtitle}
      <div class="text-[10px] md:text-xs text-slate-400 uppercase tracking-wide">{subtitle}</div>
    {/if}
  </div>
</div>


