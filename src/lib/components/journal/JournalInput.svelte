<script>
  import { createEventDispatcher } from 'svelte';
  export let placeholder = "Type what you’re feeling";
  const dispatch = createEventDispatcher();
  let value = '';

  function submit() {
    const content = value.trim();
    if (!content) return;
    dispatch('submit', { content });
    value = '';
  }
</script>

<div class="mt-4">
  <div class="relative">
    <input
      type="text"
      bind:value
      placeholder={placeholder}
      class="w-full rounded-full bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-400
             px-5 py-3 pr-12 transition-all duration-200
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      on:keydown={(e) => e.key === 'Enter' && submit()}
    />
    <button
      type="button"
      aria-label="Send"
      class="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white grid place-items-center
             hover:brightness-105 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/25
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      on:click={submit}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
        <path d="M2.25 12L21.75 3.75L15 12L21.75 20.25L2.25 12Z" />
      </svg>
    </button>
  </div>
</div>


