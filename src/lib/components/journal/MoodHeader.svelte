<script>
  export let mood = 'thoughtful';
  export let emoji = '🧠';
  export let statement = 'You seem';
  export let subtitle = 'Journaling companion';
</script>

<div class="flex items-center gap-3 rounded-3xl p-4"
     style="background: rgba(255,255,255,0.85); border: 1px solid rgba(15,23,42,0.08); backdrop-filter: blur(10px); box-shadow: 0 14px 30px rgba(15,23,42,0.08);">
  <div class="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-emerald-100 border border-white flex items-center justify-center text-xl shadow-inner">
    {emoji}
  </div>
  <div class="flex flex-col">
    <div class="text-xl md:text-2xl font-semibold text-slate-900">
      {statement} <span class="font-serif italic text-accent">{mood}</span> today
    </div>
    {#if subtitle}
      <div class="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">{subtitle}</div>
    {/if}
  </div>
</div>


