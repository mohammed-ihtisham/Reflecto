<script>
  import { createEventDispatcher } from 'svelte';
  import { getComicLayout } from '$lib/comicLayouts';

  export let panels = [];
  export let interactive = true;
  export let emptyLabel = 'Your comic snapshot will appear here.';

  const dispatch = createEventDispatcher();

  $: safePanels = Array.isArray(panels) ? panels : [];
  $: layout = getComicLayout(safePanels.length);
  $: gridTemplateAreas = layout.areas.map((row) => `'${row}'`).join(' ');

  function handleSelect(panel) {
    if (!panel || !interactive) return;
    dispatch('select', { panel });
  }

  function panelMood(panel) {
    return panel?.subtitle || panel?.mood || 'Moment';
  }
</script>

{#if safePanels.length === 0}
  <div class="h-full w-full rounded-3xl border border-dashed border-white/40 bg-white/10 text-center text-xs md:text-sm text-white/70 grid place-content-center p-6">
    {emptyLabel}
  </div>
{:else}
  <div class="relative w-full max-w-3xl mx-auto">
    <div class="aspect-[3/4]">
      <div
        class="hidden h-full w-full sm:grid gap-3 rounded-[32px] bg-slate-950/80 border border-white/10 p-3 md:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
        style={`grid-template-rows: repeat(${layout.rows}, minmax(0, 1fr)); grid-template-columns: repeat(${layout.cols}, minmax(0, 1fr)); grid-template-areas: ${gridTemplateAreas};`}
      >
        {#each safePanels as panel, index}
          <button
            type="button"
            class="group relative flex h-full w-full items-stretch overflow-hidden rounded-3xl border border-white/10 bg-white/10 text-left shadow-[0_15px_35px_rgba(0,0,0,0.35)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70"
            style={`grid-area: ${layout.panelAreas[index] || 'auto'};`}
            aria-label={`Open panel ${panel.title || panelMood(panel)}`}
            on:click|stopPropagation={() => handleSelect(panel)}
            disabled={!interactive}
          >
            {#if panel?.imageUrl}
              <img src={panel.imageUrl} alt={panel.title} class="absolute inset-0 h-full w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            {:else}
              <div class="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-900/70 to-slate-900">
                <div class="absolute inset-4 rounded-2xl border border-dashed border-white/20 opacity-60"></div>
              </div>
            {/if}
            <div class="relative z-10 flex h-full w-full flex-col justify-between p-3 md:p-4">
              <div class="text-[10px] uppercase tracking-wide text-white/80">{panelMood(panel)}</div>
              <div class="text-base md:text-lg font-semibold font-display text-white drop-shadow-md">{panel?.title || 'Untitled moment'}</div>
            </div>
          </button>
        {/each}
      </div>

      <div class="sm:hidden flex h-full flex-col gap-3">
        {#each safePanels as panel}
          <button
            type="button"
            class="group relative flex h-48 w-full items-stretch overflow-hidden rounded-3xl border border-white/20 bg-white/10 text-left shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70"
            aria-label={`Open panel ${panel.title || panelMood(panel)}`}
            on:click|stopPropagation={() => handleSelect(panel)}
            disabled={!interactive}
          >
            {#if panel?.imageUrl}
              <img src={panel.imageUrl} alt={panel.title} class="absolute inset-0 h-full w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            {:else}
              <div class="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-900/70 to-slate-900">
                <div class="absolute inset-3 rounded-2xl border border-dashed border-white/20 opacity-60"></div>
              </div>
            {/if}
            <div class="relative z-10 flex h-full w-full flex-col justify-between p-3">
              <div class="text-[10px] uppercase tracking-wide text-white/80">{panelMood(panel)}</div>
              <div class="text-base font-semibold font-display text-white drop-shadow-md">{panel?.title || 'Untitled moment'}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.font-display) {
    font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  }
</style>

