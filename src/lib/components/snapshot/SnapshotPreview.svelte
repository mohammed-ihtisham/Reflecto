<script>
  export let title = 'Snapshot of the day';
  export let subtitle = 'A Day in the Life';
</script>

<div
  class="h-full flex flex-col bg-white/70 backdrop-blur-xl text-slate-900 border border-white/80 shadow-2xl rounded-3xl p-4 md:p-6 transition-all duration-200 hover:scale-[1.01]">
  <div class="mb-3 md:mb-4">
    <div class="text-xs uppercase tracking-wide text-stone-500">{subtitle}</div>
    <div class="text-lg md:text-xl font-semibold">{title}</div>
  </div>

  <div class="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 content-start gap-2 sm:gap-3">
    <div class="aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 shadow-sm grid place-items-center text-stone-400 text-xs">
      panel
    </div>
    <div class="aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 shadow-sm grid place-items-center text-stone-400 text-xs">
      panel
    </div>
    <div class="aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 shadow-sm grid place-items-center text-stone-400 text-xs">
      panel
    </div>
    <div class="aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 shadow-sm grid place-items-center text-stone-400 text-xs">
      panel
    </div>
    <div class="aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 shadow-sm grid place-items-center text-stone-400 text-xs">
      panel
    </div>
    <div class="aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 shadow-sm grid place-items-center text-stone-400 text-xs">
      panel
    </div>
  </div>
</div>


