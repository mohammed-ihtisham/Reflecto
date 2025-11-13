<script>
  export let mood = 'thoughtful';
  export let emoji = '🧠';
  export let statement = 'You seem';
  export let subtitle = 'Journaling companion';
</script>

<div class="flex items-center gap-3 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-3.5">
  <div class="h-11 w-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-inner">
    {emoji}
  </div>
  <div class="flex flex-col">
    <div class="text-xl md:text-2xl font-semibold text-slate-100">
      {statement} <span class="text-emerald-300">{mood}</span> today
    </div>
    {#if subtitle}
      <div class="text-[10px] md:text-xs text-slate-400 uppercase tracking-wide">{subtitle}</div>
    {/if}
  </div>
</div>


