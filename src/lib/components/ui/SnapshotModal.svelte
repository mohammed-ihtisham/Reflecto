<script>
  import { createEventDispatcher } from 'svelte';
  export let open = false;
  export let title = 'Snapshot';
  export let summary = 'A reflective summary will appear here.';
  export let tags = ['😊', '🤔', '🌿', '⚖️', '✨'];
  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 grid place-items-center">
    <button class="absolute inset-0 bg-black/60" type="button" aria-label="Close snapshot modal" on:click={close}></button>
    <div class="relative w-[90vw] max-w-lg rounded-3xl bg-white text-slate-900 p-5 md:p-6 border border-white/90 shadow-2xl animate-fade-delayed">
      <div class="flex items-start justify-between gap-4 mb-3">
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

      <div class="rounded-2xl bg-gradient-to-br from-accent/10 to-accent2/10 border border-slate-200 p-3 mb-3">
        <div class="font-serif italic text-slate-800 leading-relaxed">{summary}</div>
      </div>

      <div class="flex items-center flex-wrap gap-2">
        {#each tags as t}
          <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-1 text-sm">
            <span class="text-base">{t}</span>
          </span>
        {/each}
      </div>
    </div>
  </div>
{/if}


