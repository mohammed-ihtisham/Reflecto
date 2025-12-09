<script>
  export let role = 'system'; // 'system' | 'user' | 'assistant'
  export let text = '';
  export let agent = null; // 'happyNeutral' | 'sadSupportive' | 'motivational'

  $: isUser = role === 'user';
  $: isSystemLike = role === 'system' || role === 'assistant';
  $: words = (text || '').split(/\s+/);
  
  // Get gradient background based on agent type
  function getAgentGradient(agentType) {
    if (!agentType) {
      return 'rgba(255,255,255,0.9)';
    }
    
    switch (agentType) {
      case 'happyNeutral':
        // Muted greens and warm yellows - diagonal gradient
        return 'linear-gradient(135deg, rgba(101, 163, 137, 0.15) 0%, rgba(133, 193, 133, 0.12) 50%, rgba(234, 179, 8, 0.15) 100%)';
      case 'sadSupportive':
        // Lavenders and soft purples - diagonal gradient
        return 'linear-gradient(135deg, rgba(196, 181, 253, 0.15) 0%, rgba(167, 139, 250, 0.12) 50%, rgba(147, 51, 234, 0.15) 100%)';
      case 'motivational':
        // Teal and golden tones - diagonal gradient
        return 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(14, 165, 233, 0.12) 50%, rgba(245, 158, 11, 0.15) 100%)';
      default:
        return 'rgba(255,255,255,0.06)';
    }
  }
  
  $: backgroundStyle = isUser ? 'rgba(255,255,255,0.9)' : getAgentGradient(agent);
  
  // Get typography classes based on agent type
  function getAgentTypography(agentType) {
    if (!agentType || isUser) {
      return 'font-sans'; // Default to Inter
    }
    
    switch (agentType) {
      case 'happyNeutral':
        // Inter - clean, modern, friendly
        return 'font-sans';
      case 'sadSupportive':
        // EB Garamond Italic - softer, thoughtful
        return 'font-serif italic';
      case 'motivational':
        // Poppins Semibold - structure, confidence
        return 'font-display font-semibold';
      default:
        return 'font-sans';
    }
  }
  
  $: typographyClass = isUser ? 'font-sans' : getAgentTypography(agent);
</script>

<div
  class="max-w-[74%] md:max-w-[60%] whitespace-pre-wrap leading-6 rounded-2xl border transition-all duration-500 backdrop-blur-lg will-change-transform hover:-translate-y-[1px]"
  style="
    background: {backgroundStyle};
    border-color: rgba(15,23,42,0.08);
    box-shadow:
      0 6px 18px rgba(15,23,42,0.08),
      0 0 0 1px rgba(var(--accent),0.06);
    transform-origin: {isUser ? '100% 50%' : '0% 50%'};
  "
>
  {#if role}
    <div class="px-3 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
      {isUser ? 'you' : role}
    </div>
  {/if}
  <div class="px-3.5 pb-3 md:px-4 md:pb-3 text-[15px] text-slate-800 transition-all duration-500 ease-in-out {typographyClass}">
    {#each words as w, i}
      <span
        class="inline-block animate-fade-delayed"
        style="animation-delay: {Math.min(i * 40, 1200)}ms"
        >{w}{i < words.length - 1 ? ' ' : ''}</span
      >
    {/each}
  </div>
</div>


