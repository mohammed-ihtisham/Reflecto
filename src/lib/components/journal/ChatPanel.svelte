<script>
  import ReflectiveChatBubble from '$lib/components/ui/ReflectiveChatBubble.svelte';
  export let messages = [];
  export let containerClass = '';

  const exampleMessages = [
    { role: 'system', content: "Welcome back. What’s on your mind?" },
    { role: 'user', content: "I feel thoughtful about a conversation I had today." },
    { role: 'assistant', content: "Tell me more about what stood out to you." }
  ];
</script>

<div class={`rounded-3xl p-4 md:p-6 flex flex-col h-full ${containerClass}`}
     style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(var(--accent),0.08); backdrop-filter: blur(16px);">
  <div class="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    {#if messages?.length}
      {#each messages as m, i}
        <div class="animate-fade-delayed" style="animation-delay: {Math.min(i * 70, 900)}ms">
          <ReflectiveChatBubble role={m.role} text={m.content} />
        </div>
      {/each}
    {:else}
      {#each exampleMessages as ex, i}
        <div class="animate-fade-delayed" style="animation-delay: {i * 80}ms">
          <ReflectiveChatBubble role={ex.role} text={ex.content} />
        </div>
      {/each}
    {/if}
  </div>
</div>


