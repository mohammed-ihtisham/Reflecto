<script>
  import MessageBubble from './MessageBubble.svelte';
  export let messages = [];
  export let containerClass = '';

  const exampleMessages = [
    { role: 'system', content: "Welcome back. What’s on your mind?" },
    { role: 'user', content: "I feel thoughtful about a conversation I had today." },
    { role: 'assistant', content: "Tell me more about what stood out to you." }
  ];
</script>

<div class={`bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-4 md:p-6 flex flex-col h-full ${containerClass}`}>
  <div class="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    {#if messages?.length}
      {#each messages as m}
        <MessageBubble role={m.role} text={m.content} />
      {/each}
    {:else}
      {#each exampleMessages as ex}
        <MessageBubble role={ex.role} text={ex.content} />
      {/each}
    {/if}
  </div>
</div>


