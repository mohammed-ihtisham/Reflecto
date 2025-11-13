<script>
  import { onMount } from 'svelte';
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import MoodHeader from '$lib/components/journal/MoodHeader.svelte';
  import ChatPanel from '$lib/components/journal/ChatPanel.svelte';
  import JournalInput from '$lib/components/journal/JournalInput.svelte';
  import SnapshotPreview from '$lib/components/snapshot/SnapshotPreview.svelte';
  
  let messages = [];
  let isLoading = false;
  let errorMsg = '';
  let currentMood = 'thoughtful';

  onMount(() => {});

  async function send(content) {
    const clean = (content || '').trim();
    if (!clean) return;
    messages = [...messages, { role: 'user', content: clean }];
    isLoading = true;
    errorMsg = '';
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: messages })
    });
    const data = await res.json();
    if (!res.ok || data?.error) {
      errorMsg = data?.error || 'Request failed';
      isLoading = false;
      return;
    }
    if (data.assistantMessage) {
      messages = [...messages, { role: 'assistant', content: data.assistantMessage }];
    }
    isLoading = false;
  }

  function handleSubmit(e) {
    send(e.detail.content);
  }
</script>

<AppShell>
  <div slot="left" class="flex flex-col h-[calc(100vh-3rem)] space-y-4">
    <MoodHeader mood={currentMood} emoji="🧠" />

    {#if errorMsg}
      <div class="bg-rose-100 text-rose-900 border border-rose-300 rounded-2xl p-3 text-sm">
        {errorMsg}
      </div>
    {/if}

    <div class="flex-1 min-h-0">
      <ChatPanel {messages} containerClass="h-full" />
    </div>

    {#if isLoading}
      <div class="pl-2 text-slate-400 text-sm">Assistant is typing…</div>
    {/if}

    <JournalInput on:submit={handleSubmit} />
  </div>

  <div slot="right" class="flex flex-col h-[calc(100vh-3rem)] space-y-4">
    <SnapshotPreview title="Snapshot of the day" subtitle="A Day in the Life" />
  </div>
</AppShell>
