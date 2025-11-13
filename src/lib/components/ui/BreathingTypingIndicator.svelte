<script>
  export let label = 'Reflecting';
</script>

<div class="flex items-center gap-2 text-slate-300">
  <div class="flex items-center gap-1.5">
    <span class="block h-2 w-2 rounded-full bg-accent/80 drop-shadow-glow animate-breathing" style="animation-delay: 0ms"></span>
    <span class="block h-2 w-2 rounded-full bg-accent/70 drop-shadow-glow animate-breathing" style="animation-delay: 200ms"></span>
    <span class="block h-2 w-2 rounded-full bg-accent/60 drop-shadow-glow animate-breathing" style="animation-delay: 400ms"></span>
  </div>
  <span class="text-xs">{label}…</span>
  <span class="sr-only">Assistant is typing</span>
</div>


