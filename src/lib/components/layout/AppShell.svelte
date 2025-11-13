<script>
  // App shell provides the dark background with soft gradients and a 2-column grid
</script>

<div class="relative min-h-screen bg-slate-950 text-slate-100">
  <!-- Background gradients -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(1000px_500px_at_20%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(900px_450px_at_100%_0%,rgba(59,130,246,0.12),transparent)]"></div>
    <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,185,129,0.07),transparent_40%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_62%,rgba(2,6,23,0.75)_100%)]"></div>
  </div>

  <!-- Content -->
  <div class="relative mx-auto max-w-7xl px-4 md:px-6 py-6">
    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8">
      <div>
        <slot name="left"></slot>
      </div>
      <div>
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</div>


