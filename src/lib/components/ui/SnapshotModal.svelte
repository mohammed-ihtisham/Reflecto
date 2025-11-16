<script>
  import { createEventDispatcher } from 'svelte';
  export let open = false;
  export let title = 'Snapshot';
  export let summary = 'A reflective summary will appear here.';
  export let panel = null;
  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto">
    <button class="absolute inset-0 bg-black/60" type="button" aria-label="Close snapshot modal" on:click={close}></button>
    <div class="relative w-full max-w-2xl rounded-3xl bg-white text-slate-900 p-5 md:p-6 border border-white/90 shadow-2xl animate-fade-delayed my-8">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <div class="text-xs uppercase tracking-wide text-stone-500">Snapshot of the day</div>
          <div class="text-xl font-semibold font-display">{title}</div>
        </div>
        <button class="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center" on:click={close} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="rounded-2xl bg-gradient-to-br from-accent/10 to-accent2/10 border border-slate-200 p-4 mb-4">
        <div class="font-serif italic text-slate-800 leading-relaxed">{summary}</div>
      </div>

      {#if panel}
        <div class="rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-2">
          {#if panel.imageUrl}
            <img src={panel.imageUrl} alt={panel.title} class="w-full aspect-[4/3] object-cover" />
          {:else}
            <div class="w-full aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span class="text-slate-400 text-xs">Image unavailable</span>
            </div>
          {/if}
          <div class="p-4 bg-white space-y-2">
            {#if panel.mood}
              <div class="text-xs uppercase tracking-wide text-stone-500">{panel.mood}</div>
            {/if}
            <div class="text-lg font-semibold">{panel.title}</div>
            <p class="text-sm text-slate-600 leading-relaxed">{panel.description || 'A reflective note about this panel.'}</p>
          </div>
        </div>
      {:else}
        <div class="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
          Select a panel to explore the thought behind it.
        </div>
      {/if}
    </div>
  </div>
{/if}


