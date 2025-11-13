<script>
  import { createEventDispatcher } from 'svelte';
  export let suggestions = [
    'One moment that felt meaningful today?',
    'What surprised you about your reactions?',
    'What do you want to carry into tomorrow?'
  ];
  const dispatch = createEventDispatcher();
  function choose(s) {
    dispatch('select', { value: s });
  }
</script>

<div class="flex flex-wrap gap-2 mb-2">
  {#each suggestions as s}
    <button
      type="button"
      class="group relative rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-slate-200
             hover:border-accent/40 hover:bg-white/10 transition-all duration-300 focus:outline-none shadow-sm"
      on:click={() => choose(s)}
    >
      <span class="relative z-10">{s}</span>
      <span class="pointer-events-none absolute inset-0 rounded-full opacity-0 group-active:opacity-100 animate-ripple bg-accent/30"></span>
    </button>
  {/each}
</div>


