<script>
  import { onMount } from 'svelte';
  import MoodAdaptiveLayout from '$lib/components/ui/MoodAdaptiveLayout.svelte';
  import MoodHeader from '$lib/components/journal/MoodHeader.svelte';
  import ChatPanel from '$lib/components/journal/ChatPanel.svelte';
  import JournalInput from '$lib/components/journal/JournalInput.svelte';
  import SuggestionChips from '$lib/components/ui/SuggestionChips.svelte';
  import BreathingTypingIndicator from '$lib/components/ui/BreathingTypingIndicator.svelte';
  import SnapshotPanel from '$lib/components/ui/SnapshotPanel.svelte';
  import SnapshotModal from '$lib/components/ui/SnapshotModal.svelte';
  import { mood as moodStore } from '$lib/stores/mood.js';
  
  let messages = [
    {
      role: 'assistant',
      content:
        "Welcome back. Take a slow breath with me. What’s one moment from today you’d like to remember or understand a bit better?"
    }
  ];
  let isLoading = false;
  let errorMsg = '';
  let currentMood = 'thoughtful';
  let selectedSnapshot = null;
  let isModalOpen = false;
  let suggestions = [
    'One moment that felt meaningful today?',
    'What surprised you about your reactions?',
    'What do you want to carry into tomorrow?'
  ];
  let snapshots = [];
  let isGeneratingSnapshot = false;
  let snapshotError = '';

  onMount(() => {
    moodStore.set(currentMood);
  });

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
    
    // Generate snapshot after a few messages (3+ user messages)
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 3 && snapshots.length === 0) {
      generateSnapshot();
    }
  }

  async function generateSnapshot() {
    if (isGeneratingSnapshot || messages.length < 2) return;
    
    isGeneratingSnapshot = true;
    snapshotError = '';
    
    try {
      const res = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages })
      });
      
      const data = await res.json();
      
      if (!res.ok || data?.error) {
        snapshotError = data?.error || 'Snapshot generation failed';
        isGeneratingSnapshot = false;
        return;
      }
      
      if (data.panels && data.panels.length > 0) {
        snapshots = data.panels.map((panel, i) => ({
          id: i + 1,
          title: panel.title,
          subtitle: panel.mood,
          imageUrl: panel.imageUrl,
          mood: panel.mood
        }));
        // Store the full snapshot data for the modal
        selectedSnapshot = { 
          title: 'Snapshot of the Day',
          summary: data.summary, 
          panels: data.panels 
        };
      }
    } catch (err) {
      snapshotError = 'Failed to generate snapshot';
      console.error('Snapshot generation error:', err);
    } finally {
      isGeneratingSnapshot = false;
    }
  }

  function handleSubmit(e) {
    send(e.detail.content);
  }

  function handleSuggestion(e) {
    send(e.detail.value);
  }

  function openSnapshot(s) {
    // Use the stored snapshot data (already set when snapshot was generated)
    // If not available, create a basic one
    if (!selectedSnapshot || !selectedSnapshot.panels) {
      selectedSnapshot = {
        title: 'Snapshot of the Day',
        summary: 'A moment captured in reflection.',
        panels: []
      };
    }
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    selectedSnapshot = null;
  }
</script>

<MoodAdaptiveLayout {currentMood}>
  <div slot="left" class="flex flex-col h-[calc(100vh-2rem)] space-y-3">
    <MoodHeader mood={currentMood} emoji="🧠" />

    {#if errorMsg}
      <div class="bg-rose-100 text-rose-900 border border-rose-300 rounded-2xl p-3 text-sm">
        {errorMsg}
      </div>
    {/if}

    <SuggestionChips {suggestions} on:select={handleSuggestion} />

    <div class="flex-1 min-h-0">
      <ChatPanel {messages} containerClass="h-full" />
    </div>

    {#if isLoading}
      <div class="pl-2">
        <BreathingTypingIndicator label="Reflecting" />
      </div>
    {/if}

    <JournalInput on:submit={handleSubmit} />
  </div>

  <div slot="right" class="flex flex-col h-[calc(100vh-2rem)]">
    <div class="flex-1 min-h-0 rounded-3xl p-4 md:p-6 text-slate-900 flex flex-col"
         style="background: rgba(255,255,255,0.80); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.85); box-shadow: 0 20px 40px rgba(0,0,0,0.20), 0 0 0 1px rgba(var(--accent),0.08);">
      <div class="mb-3 md:mb-4">
        <div class="text-xs uppercase tracking-wide text-stone-500">A Day in the Life</div>
        <div class="text-lg md:text-xl font-semibold font-display">Snapshot of the day</div>
      </div>
      <div class="flex-1 min-h-0 overflow-auto pr-1">
        {#if isGeneratingSnapshot}
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <BreathingTypingIndicator label="Creating snapshot" />
              <p class="text-sm text-stone-500 mt-2">Generating your comic-style snapshot...</p>
            </div>
          </div>
        {:else if snapshotError}
          <div class="bg-rose-100 text-rose-900 border border-rose-300 rounded-2xl p-3 text-sm">
            {snapshotError}
          </div>
        {:else if snapshots.length > 0}
          <div class="grid grid-cols-2 sm:grid-cols-3 content-start gap-2 sm:gap-3">
            {#each snapshots as s, i}
              <div class="animate-fade-delayed" style="animation-delay: {i * 60}ms">
                <SnapshotPanel 
                  title={s.title} 
                  subtitle={s.subtitle} 
                  imageUrl={s.imageUrl}
                  tilt={(i % 2 === 0 ? -0.8 : 0.6)} 
                  onClick={() => openSnapshot(s)} 
                />
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex items-center justify-center h-full text-center">
            <div class="text-stone-400 text-sm">
              <p>Your snapshot will appear here</p>
              <p class="text-xs mt-1">Keep chatting to generate your comic-style snapshot</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
    <SnapshotModal 
      open={isModalOpen} 
      title={selectedSnapshot?.title || 'Snapshot'} 
      summary={selectedSnapshot?.summary || 'This space will hold your reflective summary.'}
      panels={selectedSnapshot?.panels || []}
      on:close={closeModal} 
    />
  </div>
</MoodAdaptiveLayout>
