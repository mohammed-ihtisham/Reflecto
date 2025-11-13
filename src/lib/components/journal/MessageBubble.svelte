<script>
  export let role = 'system'; // 'system' | 'user' | 'assistant'
  export let text = '';

  $: isUser = role === 'user';
  $: isSystemLike = role === 'system' || role === 'assistant';
</script>

<div
  class="max-w-[80%] md:max-w-[70%] whitespace-pre-wrap leading-relaxed p-3.5 md:p-4 rounded-3xl border shadow-sm transition-all duration-200
    {isSystemLike ? 'self-start bg-emerald-400/10 border-emerald-300/20 text-slate-100 shadow-emerald-500/10' : ''}
    {isUser ? 'self-end bg-white/10 border-white/10 text-slate-100 shadow-black/10' : ''}">
  {#if role}
    <div class="text-[10px] uppercase tracking-wide text-slate-400 mb-1">{isUser ? 'you' : role}</div>
  {/if}
  <div>{text}</div>
</div>


