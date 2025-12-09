<script>
  import { afterUpdate, tick } from 'svelte';
  import ReflectiveChatBubble from '$lib/components/ui/ReflectiveChatBubble.svelte';
  import TypingChatBubble from '$lib/components/ui/TypingChatBubble.svelte';
  export let messages = [];
  export let containerClass = '';
  export let isUserTyping = false;
  export let userTypingSpeed = 1;
  export let isAssistantTyping = false;
  export let assistantTypingSpeed = 1;
  export let keystrokeTrigger = 0;

  let chatContainer;
  let bottomAnchor;
  let lastMessageCount = 0;
  let lastKeystrokeTrigger = 0;
  let wasAssistantTyping = false;

  afterUpdate(async () => {
    const messageCount = messages?.length ?? 0;
    const messageChanged = messageCount !== lastMessageCount;
    const typingStarted = isAssistantTyping && !wasAssistantTyping;
    const keystrokeChanged = keystrokeTrigger !== lastKeystrokeTrigger;

    if ((messageChanged || typingStarted || keystrokeChanged) && chatContainer) {
      await tick();
      bottomAnchor?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    lastMessageCount = messageCount;
    wasAssistantTyping = isAssistantTyping;
    lastKeystrokeTrigger = keystrokeTrigger;
  });

  const exampleMessages = [
    { role: 'system', content: "Welcome back. What's on your mind?" },
    { role: 'user', content: "I feel thoughtful about a conversation I had today." },
    { role: 'assistant', content: "Tell me more about what stood out to you." }
  ];
</script>

<div class={`flex flex-col h-full ${containerClass}`}>
  <div
    bind:this={chatContainer}
    class="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
  >
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

    {#if isAssistantTyping}
      <div class="flex justify-start pt-1">
        <TypingChatBubble
          role="assistant"
          speed={assistantTypingSpeed}
          keystrokeTrigger={keystrokeTrigger}
        />
      </div>
    {/if}
    <div aria-hidden="true" bind:this={bottomAnchor}></div>
  </div>
</div>


