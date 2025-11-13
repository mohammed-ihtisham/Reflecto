<script>
  export let role = 'system'; // 'system' | 'user' | 'assistant'
  export let text = '';

  $: isUser = role === 'user';
  $: isSystemLike = role === 'system' || role === 'assistant';
  $: words = (text || '').split(/\s+/);
</script>

<div
  class="max-w-[80%] md:max-w-[70%] whitespace-pre-wrap leading-relaxed rounded-3xl border transition-all duration-300 backdrop-blur-xl will-change-transform hover:-translate-y-[2px]
    {isSystemLike ? 'self-start' : ''}
    {isUser ? 'self-end' : ''}"
  style="
    background: {isUser ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)'};
    border-color: rgba(255,255,255,0.12);
    box-shadow:
      0 0 0 1px rgba(var(--accent),0.10),
      0 10px 30px rgba(0,0,0,0.30),
      0 0 24px rgba(var(--glow),0.12);
    transform-origin: {isUser ? '100% 50%' : '0% 50%'};
  "
>
  {#if role}
    <div class="px-4 pt-3 text-[10px] uppercase tracking-wide text-slate-400">{isUser ? 'you' : role}</div>
  {/if}
  <div class="px-4 pb-3 md:px-5 md:pb-4 font-sans text-slate-100">
    {#each words as w, i}
      <span
        class="inline-block animate-fade-delayed"
        style="animation-delay: {Math.min(i * 40, 1200)}ms"
        >{w}{i < words.length - 1 ? ' ' : ''}</span
      >
    {/each}
  </div>
</div>


