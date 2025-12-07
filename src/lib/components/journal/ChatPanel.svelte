<script>
  import ReflectiveChatBubble from '$lib/components/ui/ReflectiveChatBubble.svelte';
  import TypingChatBubble from '$lib/components/ui/TypingChatBubble.svelte';
  export let messages = [];
  export let containerClass = '';
  export let isUserTyping = false;
  export let userTypingSpeed = 1;
  export let isAssistantTyping = false;
  export let assistantTypingSpeed = 1;
  export let keystrokeTrigger = 0;

  const exampleMessages = [
    { role: 'system', content: "Welcome back. What's on your mind?" },
    { role: 'user', content: "I feel thoughtful about a conversation I had today." },
    { role: 'assistant', content: "Tell me more about what stood out to you." }
  ];
</script>

<div class={`rounded-3xl p-4 md:p-6 flex flex-col h-full ${containerClass}`}
     style="background: rgba(255,255,255,0.92); border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 20px 35px rgba(15,23,42,0.10); backdrop-filter: blur(12px);">
  <div class="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    {#if messages?.length}
      {#each messages as m, i}
        <div class="animate-fade-delayed flex {(m.role === 'user' ? 'justify-end' : 'justify-start')}" style="animation-delay: {Math.min(i * 70, 900)}ms">
          <ReflectiveChatBubble role={m.role} text={m.content} agent={m.agent} />
        </div>
      {/each}
    {:else}
      {#each exampleMessages as ex, i}
        <div class="animate-fade-delayed flex {(ex.role === 'user' ? 'justify-end' : 'justify-start')}" style="animation-delay: {i * 80}ms">
          <ReflectiveChatBubble role={ex.role} text={ex.content} />
        </div>
      {/each}
    {/if}
    
    {#if isUserTyping}
      <div class="flex justify-end">
        <TypingChatBubble role="user" speed={userTypingSpeed} keystrokeTrigger={keystrokeTrigger} />
      </div>
    {/if}
    
    {#if isAssistantTyping}
      <div class="flex justify-start">
        <TypingChatBubble role="assistant" speed={assistantTypingSpeed} />
      </div>
    {/if}
  </div>
</div>


