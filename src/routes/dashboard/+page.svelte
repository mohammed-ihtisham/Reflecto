<script>
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import MoodAdaptiveLayout from '$lib/components/ui/MoodAdaptiveLayout.svelte';
  import ChatPanel from '$lib/components/journal/ChatPanel.svelte';
  import JournalInput from '$lib/components/journal/JournalInput.svelte';
  import SnapshotModal from '$lib/components/ui/SnapshotModal.svelte';
  import { mood as moodStore } from '$lib/stores/mood.js';
  import { analyzeTone } from '$lib/utils/toneAnalysis.js';

  export let data;

  const PROFILE_KEY = 'reflecto_profile_setup';
  const userName = data?.user?.name || 'User';
  const showNotebookOnly = true;
  const vibeCopy = {
    thoughtful: "You seem thoughtful today—your Journaling Companion is here.",
    steady: 'Steady breaths, steady thoughts. Welcome back.',
    bright: 'Light and curious. Let’s sketch what mattered.',
    gentle: 'Soft focus mode is on. Take your time.'
  };
  
  let allowed = false;
  let messages = [
    {
      role: 'assistant',
      content:
        "Welcome back. Take a slow breath with me. What's one moment from today you'd like to remember or understand a bit better?"
    }
  ];
  let isLoading = false;
  let errorMsg = '';
  let currentMood = 'thoughtful';
  let snapshotMeta = null;
  let selectedPanel = null;
  let isModalOpen = false;
  let snapshots = [];
  let isGeneratingSnapshot = false;
  let snapshotError = '';
  let activeTool = 'calendar';
  let bookMode = false;
  let toolHint = 'Calendar keeps your reflections anchored.';
function shuffledPanelCounts() {
  const counts = [1, 2, 3];
  for (let i = counts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [counts[i], counts[j]] = [counts[j], counts[i]];
  }
  return counts;
}

const TARGET_PANEL_COUNT = 6;
const LAYOUT_DESCRIPTION = 'Row 1: two panels, Row 2: one panel, Row 3: three panels';
let panelCounts = shuffledPanelCounts();
let rowSlotIndices = [];
let activePanelIndex = -1;
let allImagesDone = false;
let showCalendarPopover = false;
let calendarHideTimer = null;
let autoAssistEnabled = false;
let autoAssistPrompt = '';
let showAutoAssistCard = false;
let autoAssistIdleTimer = null;
let autoAssistPeriodicTimer = null;
let showClearModal = false;

$: rowSlotIndices = panelCounts.reduce((acc, count, rowIdx) => {
  const start = acc.flat().length;
  acc[rowIdx] = Array.from({ length: count }, (_, i) => start + i);
  return acc;
}, []);

function panelAspectHint(index) {
  const row = rowSlotIndices.find((slots) => slots.includes(index));
  const cols = row?.length || 0;

  if (cols === 1) return 'cinematic ultra-wide ratio around 3:1';
  if (cols === 2) return 'landscape comic ratio around 3:2';
  if (cols >= 3) return 'square-ish comic ratio around 1:1';

  return 'balanced comic ratio around 4:3';
}

function handleCalendarEnter() {
  if (calendarHideTimer) {
    clearTimeout(calendarHideTimer);
    calendarHideTimer = null;
  }
  showCalendarPopover = true;
}

function handleCalendarLeave() {
  if (calendarHideTimer) {
    clearTimeout(calendarHideTimer);
  }
  calendarHideTimer = setTimeout(() => {
    showCalendarPopover = false;
    calendarHideTimer = null;
  }, 120);
}

function toggleAutoAssist() {
  autoAssistEnabled = !autoAssistEnabled;
  autoAssistPrompt = '';
  showAutoAssistCard = false;
  resetAutoAssistTimers();
  if (autoAssistEnabled) {
    scheduleAutoAssistTimers();
  }
}

function resetAutoAssistTimers() {
  if (autoAssistIdleTimer) {
    clearTimeout(autoAssistIdleTimer);
    autoAssistIdleTimer = null;
  }
  if (autoAssistPeriodicTimer) {
    clearInterval(autoAssistPeriodicTimer);
    autoAssistPeriodicTimer = null;
  }
}

function scheduleAutoAssistTimers() {
  if (!autoAssistEnabled) return;
  resetAutoAssistTimers();
  autoAssistIdleTimer = setTimeout(() => triggerAutoAssist('idle'), 10000);
  autoAssistPeriodicTimer = setInterval(() => triggerAutoAssist('minute'), 60000);
}

function triggerAutoAssist(reason = 'idle') {
  if (!autoAssistEnabled) return;
  const clean = (journalText || '').trim();
  const starterPrompts = [
    'What detail keeps replaying from today?',
    'How did that moment make you feel?',
    'What surprised you about your reaction?',
    'What do you want future-you to remember?',
    'If this were a panel, what would be in the frame?'
  ];
  const hint =
    clean.length > 30
      ? `You wrote: "${clean.slice(0, 110)}${clean.length > 110 ? '...' : ''}". What feels unresolved about it?`
      : 'What tiny moment deserves a closer look?';
  autoAssistPrompt = reason === 'minute' ? hint : starterPrompts[Math.floor(Math.random() * starterPrompts.length)];
  showAutoAssistCard = true;
  scheduleAutoAssistTimers();
}
  
  // Typing indicators
  let isUserTyping = false;
  let userTypingSpeed = 1;
  let isAssistantTyping = false;
  let assistantTypingSpeed = 1;
  let typingTimeout = null;
  let keystrokeCount = 0;

// Notepad + navigation
let journalText = '';
const today = new Date();
let selectedDate = today;
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let showAssistant = false;
let isSaving = false;
let saveTimeout = null;
let isLoadingEntry = false;
let saveSuccess = false;

$: monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
  new Date(currentYear, currentMonth)
);
$: monthDays = Array.from(
  { length: new Date(currentYear, currentMonth + 1, 0).getDate() },
  (_, i) => i + 1
);
$: leadingBlank = new Date(currentYear, currentMonth, 1).getDay();

  onMount(() => {
    // User is already authenticated (checked server-side)
    allowed = true;
    moodStore.set(currentMood);
    
    // Check if profile setup is pending
    const profileStatus =
      typeof localStorage !== 'undefined' ? localStorage.getItem(PROFILE_KEY) : null;
    if (profileStatus === 'pending') {
      goto('/depiction');
      return;
    }

    // Load journal entry for today
    loadJournalEntry(selectedDate);
  });

  /**
   * Load journal entry for a specific date
   */
  async function loadJournalEntry(date) {
    if (!data?.user?._id) return;

    isLoadingEntry = true;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/journal?date=${dateStr}`);
      const result = await response.json();

      if (response.ok && result.entry) {
        journalText = result.entry.content || '';
        previousJournalText = journalText; // Update previous to prevent immediate save
        
        // Restore chat messages if they exist
        if (result.entry.chatMessages && Array.isArray(result.entry.chatMessages) && result.entry.chatMessages.length > 0) {
          messages = result.entry.chatMessages;
        } else {
          // Reset to default welcome message if no chat history
          messages = [
            {
              role: 'assistant',
              content:
                "Welcome back. Take a slow breath with me. What's one moment from today you'd like to remember or understand a bit better?"
            }
          ];
        }
      } else {
        journalText = '';
        previousJournalText = '';
        // Reset to default welcome message
        messages = [
          {
            role: 'assistant',
            content:
              "Welcome back. Take a slow breath with me. What's one moment from today you'd like to remember or understand a bit better?"
          }
        ];
      }
    } catch (error) {
      console.error('Error loading journal entry:', error);
      journalText = '';
      previousJournalText = '';
      // Reset to default welcome message on error
      messages = [
        {
          role: 'assistant',
          content:
            "Welcome back. Take a slow breath with me. What's one moment from today you'd like to remember or understand a bit better?"
        }
      ];
    } finally {
      isLoadingEntry = false;
      isInitialLoad = false;
    }
  }

  /**
   * Save journal entry (debounced)
   */
  function saveJournalEntry(date, content) {
    if (!data?.user?._id) return;

    // Clear any pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce: wait 1.5 seconds after user stops typing
    saveTimeout = setTimeout(async () => {
      await performSave(date, content);
    }, 1500); // 1.5 second debounce
  }

  /**
   * Perform the actual save operation
   */
  async function performSave(date, content, includeChat = false) {
    if (!data?.user?._id) return;

    isSaving = true;
    saveSuccess = false;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Prepare chat messages - filter out the initial welcome message if it's the only one
      let chatMessagesToSave = [];
      if (includeChat && messages && messages.length > 0) {
        // Only save if there are actual conversations (more than just the welcome message)
        // Or if there are user messages
        const hasUserMessages = messages.some(m => m.role === 'user');
        if (hasUserMessages || messages.length > 1) {
          chatMessagesToSave = messages;
        }
      }
      
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateStr,
          content: content || '',
          chatMessages: includeChat ? chatMessagesToSave : undefined
        })
      });

      if (response.ok) {
        saveSuccess = true;
        // Update previous text to prevent duplicate saves
        previousJournalText = content;
        // Hide success message after 2 seconds
        setTimeout(() => {
          saveSuccess = false;
        }, 2000);
      } else {
        const error = await response.json();
        console.error('Error saving journal entry:', error);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      isSaving = false;
      saveTimeout = null;
    }
  }

  /**
   * Manual save - "Done for the day" button handler
   */
  async function saveForTheDay() {
    // Clear any pending debounced save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    
    // Immediately save both journal text and chat history
    await performSave(selectedDate, journalText, true);
  }

  // Auto-save when journalText changes (but not when loading)
  let previousJournalText = '';
  let isInitialLoad = true;
  
  $: {
    // Skip auto-save on initial load or when loading an entry
    if (isInitialLoad || isLoadingEntry) {
      if (!isLoadingEntry) {
        isInitialLoad = false;
        previousJournalText = journalText;
      }
    } else {
      // Only save if text actually changed
      if (journalText !== undefined && selectedDate && journalText !== previousJournalText) {
        previousJournalText = journalText;
        saveJournalEntry(selectedDate, journalText);
      }
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    allowed = false;
    goto('/auth');
  }

  function setTool(tool, hint) {
    activeTool = tool;
    toolHint = hint;
  }

  function handleTyping(e) {
    isUserTyping = e.detail.hasText;
    userTypingSpeed = e.detail.speed;
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (e.detail.hasText) {
      typingTimeout = setTimeout(() => {
        isUserTyping = false;
      }, 2000);
    } else {
      isUserTyping = false;
    }

    if (autoAssistEnabled) {
      scheduleAutoAssistTimers();
    }
  }

  function handleKeystroke(e) {
    keystrokeCount++;
    userTypingSpeed = e.detail.speed;
  }

function changeMonth(delta) {
  const next = new Date(currentYear, currentMonth + delta, 1);
  currentMonth = next.getMonth();
  currentYear = next.getFullYear();
}

function selectDate(day) {
  const newDate = new Date(currentYear, currentMonth, day);
  // Save current entry before switching dates
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveJournalEntry(selectedDate, journalText);
  }
  selectedDate = newDate;
  loadJournalEntry(newDate);
}

function reflectWithAI() {
  const clean = (journalText || '').trim();
  if (!clean) {
    showAssistant = true;
    return;
  }
  showAssistant = true;
  send(clean);
}

  async function send(content) {
    const clean = (content || '').trim();
    if (!clean) return;
    
    isUserTyping = false;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    messages = [...messages, { role: 'user', content: clean }];
    isLoading = true;
    isAssistantTyping = true;
    assistantTypingSpeed = analyzeTone(clean);
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
      isAssistantTyping = false;
      return;
    }
    if (data.assistantMessage) {
      assistantTypingSpeed = analyzeTone(data.assistantMessage);
      const agent = data.replierInput?.agent || 'happyNeutral';
      messages = [...messages, { role: 'assistant', content: data.assistantMessage, agent }];
    }
    isLoading = false;
    isAssistantTyping = false;
  }

  $: userMessageCount = messages.filter((m) => m.role === 'user').length;
  $: hasReflection = (journalText || '').trim().length > 0;
  $: canGenerateSnapshot =
    !isGeneratingSnapshot && snapshots.length === 0 && (userMessageCount >= 1 || hasReflection);

  async function generateSnapshot() {
    const reflection = (journalText || '').trim();
    if (isGeneratingSnapshot || (!reflection && userMessageCount < 1)) return;

    isGeneratingSnapshot = true;
    snapshotError = '';
    selectedPanel = null;
    allImagesDone = false;
    panelCounts = shuffledPanelCounts();

    try {
      const historyPayload = reflection
        ? [...messages, { role: 'user', content: `Reflection text: ${reflection}` }]
        : messages;

      const res = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          reflectionText: reflection,
          panelCount: TARGET_PANEL_COUNT,
          layoutDescription: LAYOUT_DESCRIPTION,
          generateImages: false
        })
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        snapshotError = data?.error || 'Snapshot generation failed';
        isGeneratingSnapshot = false;
        return;
      }

      const panels = (data.panels || []).slice(0, TARGET_PANEL_COUNT);
      if (panels.length === 0) {
        snapshotError = 'No panels returned';
        isGeneratingSnapshot = false;
        return;
      }

      // Seed placeholders immediately
      snapshots = panels.map((panel, i) => ({
        id: i + 1,
        index: i,
        title: panel.title,
        subtitle: panel.mood,
        mood: panel.mood,
        imageUrl: null,
        description: panel.description || panel.prompt || '',
        isLoading: false
      }));
      snapshotMeta = {
        title: 'Snapshot of the Day',
        summary: data.summary || 'A reflective moment captured.'
      };

      // Fill panels sequentially
      for (let i = 0; i < snapshots.length; i += 1) {
        activePanelIndex = i;
        snapshots = snapshots.map((p, idx) => (idx === i ? { ...p, isLoading: true } : p));
        const panel = snapshots[i];
        const aspectHint = panelAspectHint(i);
        const basePrompt = panel.description || panel.title || 'comic panel illustration';
        const sizedPrompt = `${basePrompt}. Render it as a ${aspectHint}. Keep key subjects centered so they are not cropped.`;
        const slot = rowSlotIndices.find((row) => row.includes(i));
        const imgRes = await fetch('/api/snapshot/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: sizedPrompt,
            title: panel.title,
            mood: panel.mood,
            slot: {
              index: i,
              rowIndex: rowSlotIndices.findIndex((row) => row.includes(i)),
              columns: slot?.length || null
            }
          })
        });
        const imgData = await imgRes.json();
        if (!imgRes.ok || imgData?.error) {
          console.error('Image generation failed for panel', panel.title, imgData?.error);
          snapshots = snapshots.map((p, idx) => (idx === i ? { ...p, isLoading: false } : p));
          continue;
        }
        snapshots = snapshots.map((p, idx) =>
          idx === i
            ? { ...p, imageUrl: imgData.imageUrl || p.imageUrl, isLoading: false }
            : p
        );
      }
      activePanelIndex = -1;
      allImagesDone = true;
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

  function openPanelModal(panel) {
    if (!panel) return;
    selectedPanel = panel;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    selectedPanel = null;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Shadows+Into+Light&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if allowed}
<MoodAdaptiveLayout {currentMood}>
  <div slot="header" class="relative overflow-visible flex items-center justify-between rounded-3xl border border-slate-200 bg-white/85 backdrop-blur-xl px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
    <div class="flex items-center gap-3">
      <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 border border-white grid place-items-center shadow-inner text-lg">🪶</div>
      <div>
        <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Reflecto</div>
        <div class="text-xl font-semibold text-slate-900">Journal Companion</div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-right">
        <div class="text-slate-500 text-xs">Hi, {userName}!</div>
        <div class="text-slate-900 font-semibold">Warm, reflective space is ready.</div>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 px-4 py-2 text-sm font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-[1px] transition"
        on:click={logout}
        aria-label="Log out"
        title="Log out"
      >
        <span>🚪</span>
        <span>Log out</span>
      </button>
    </div>
  </div>

  <div slot="left" class="flex flex-col h-[calc(100vh-6rem)] space-y-4 pb-6">
    <div
      class="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-indigo-50 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-200/50 via-teal-200/40 to-indigo-200/50 blur-2xl"></div>
      <div class="relative p-5 md:p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-2xl bg-white/70 border border-emerald-100 grid place-items-center text-2xl animate-pulse">
              🌙
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.18em] text-emerald-700">Daily vibe</div>
              <div class="text-lg font-semibold leading-tight text-slate-900">{vibeCopy[currentMood] || vibeCopy.thoughtful}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/80 border border-emerald-100 text-emerald-700">
            <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Gentle presence on</span>
          </div>
        </div>
        <p class="text-sm text-slate-700">
          Let the page feel like a sketchbook. Pause often; notice a detail; invite the AI companion only when you want a mirror.
        </p>
      </div>
    </div>

    {#if errorMsg}
      <div class="bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl p-3 text-sm shadow-sm">
        {errorMsg}
      </div>
    {/if}

    {#if !showNotebookOnly}
      <div class="rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl p-4 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <button
            class={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all border ${activeTool === 'calendar' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-800 border-slate-100 hover:-translate-y-[1px] hover:shadow-md'}`}
            on:click={() => setTool('calendar', 'Calendar keeps your reflections anchored.')}
          >
            📅 Calendar
          </button>
          <button
            class={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all border ${activeTool === 'ai' ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white text-slate-800 border-slate-100 hover:-translate-y-[1px] hover:shadow-md'}`}
            on:click={() => {
              setTool('ai', 'Reflection AI assist stays gentle and optional.');
              reflectWithAI();
            }}
          >
            ✨ AI Assist
          </button>
          <button
            class={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all border ${activeTool === 'chat' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'bg-white text-slate-800 border-slate-100 hover:-translate-y-[1px] hover:shadow-md'}`}
            on:click={() => {
              setTool('chat', 'Chat companion replaces the comic canvas.');
              showAssistant = true;
            }}
          >
            💬 Chat Companion
          </button>
          <button
            class={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all border ${activeTool === 'book' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-white text-slate-800 border-slate-100 hover:-translate-y-[1px] hover:shadow-md'}`}
            on:click={() => {
              setTool('book', 'Book mode frames your text + comic like a spread.');
              bookMode = !bookMode;
            }}
          >
            📖 Journal Book
          </button>
          <button
            class={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all border ${activeTool === 'memory' ? 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-lg shadow-fuchsia-500/20' : 'bg-white text-slate-800 border-slate-100 hover:-translate-y-[1px] hover:shadow-md'}`}
            on:click={() => setTool('memory', 'Memory cloud gathers quotes + artifacts.')}
          >
            ☁️ Memory Cloud
          </button>
        </div>
        <div class="text-xs text-slate-600 flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          {toolHint}
        </div>
      </div>
    {/if}

    <div class={`grid grid-cols-1 ${showNotebookOnly ? '' : 'xl:grid-cols-[0.9fr_1.1fr]'} gap-4 flex-1 min-h-0 pb-4`}>
      {#if !showNotebookOnly}
        <div class="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl p-4 flex flex-col space-y-4">
          <div class="flex items-center justify-between gap-4">
          <div>
              <div class="text-xs uppercase tracking-[0.15em] text-slate-500">Calendar</div>
            <div class="text-sm font-semibold text-slate-800">{monthLabel}</div>
          </div>
            <div class="flex items-center gap-2">
              <button class="h-9 w-9 grid place-items-center rounded-full bg-white text-slate-700 border border-slate-200 hover:-translate-y-[1px] transition" on:click={() => changeMonth(-1)} aria-label="Previous month">
              ‹
            </button>
              <button class="h-9 w-9 grid place-items-center rounded-full bg-white text-slate-700 border border-slate-200 hover:-translate-y-[1px] transition" on:click={() => changeMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
        </div>
          <div class="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
          {#each ['S','M','T','W','T','F','S'] as d}
            <div class="py-1">{d}</div>
          {/each}
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
          {#each Array(leadingBlank) as _, i}
            <div aria-hidden="true" class="py-1.5"></div>
          {/each}
          {#each monthDays as day}
            <button
              class={`py-1.5 rounded-lg text-sm border transition-all ${
                selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'hover:bg-slate-100 border-transparent text-slate-700'
              } ${today.getDate() === day && today.getMonth() === currentMonth ? 'font-semibold' : ''}`}
              on:click={() => selectDate(day)}
            >
              {day}
            </button>
          {/each}
        </div>
          <div class="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
            This page is yours. When ready, tap “Generate snapshot” to illustrate it.
          </div>
        </div>
      {/if}

      <div class="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl p-5 flex flex-col relative overflow-hidden"
        style="background-image: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.96)), repeating-linear-gradient(0deg, rgba(15,23,42,0.02), rgba(15,23,42,0.02) 1px, transparent 1px, transparent 34px);">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-xs uppercase tracking-[0.15em] text-slate-500">Notepad for today</div>
            <div class="text-lg font-semibold text-slate-900" style="font-family: 'Shadows Into Light','Handlee',cursive;">
              {selectedDate.toDateString()}
          </div>
            <p class="text-sm text-slate-500">Let it flow. The assistant joins only when invited.</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <div class="relative flex items-center gap-2 bg-white/80 border border-slate-200 rounded-full px-2 py-1.5 shadow-sm">
              <button
                class="icon-chip"
                aria-label="Calendar"
                title="Calendar — hover to switch entry date"
                on:mouseenter={handleCalendarEnter}
                on:mouseleave={handleCalendarLeave}
              >
                <span class="icon-circle">📅</span>
              </button>
              <div
                class={`calendar-popover ${showCalendarPopover ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'}`}
                on:mouseenter={handleCalendarEnter}
                on:mouseleave={handleCalendarLeave}
                role="presentation"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs font-semibold text-slate-700">{monthLabel}</div>
                  <div class="flex gap-1">
                    <button class="mini-nav" on:click={() => changeMonth(-1)}>‹</button>
                    <button class="mini-nav" on:click={() => changeMonth(1)}>›</button>
                  </div>
                </div>
                <div class="grid grid-cols-7 gap-1 text-[10px] text-slate-400 mb-1">
                  {#each ['S','M','T','W','T','F','S'] as d}
                    <div class="py-1 text-center">{d}</div>
                  {/each}
                </div>
                <div class="grid grid-cols-7 gap-1 text-center">
                  {#each Array(leadingBlank) as _, i}
                    <div aria-hidden="true" class="py-1.5"></div>
                  {/each}
                  {#each monthDays as day}
                    <button
                      class={`py-1.5 rounded-lg text-[11px] border transition-all ${
                        selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
                          : 'hover:bg-slate-100 border-transparent text-slate-700'
                      } ${today.getDate() === day && today.getMonth() === currentMonth ? 'font-semibold' : ''}`}
                      on:click={() => selectDate(day)}
                    >
                      {day}
                    </button>
                  {/each}
                </div>
              </div>
            </div>

            <button
              class={`icon-chip ${autoAssistEnabled ? 'active' : ''}`}
              aria-label="Auto-assist"
              title="Auto-assist — toggle prompts after idle or each minute"
              on:click={toggleAutoAssist}
            >
              <span class="icon-circle">✨</span>
            </button>

            <button
              class={`icon-chip ${showAssistant ? 'active' : ''}`}
              aria-label="Chat-based reflection"
              title="Chat-based reflection — switches right pane to chat"
              on:click={() => {
                setTool('chat', 'Chat companion replaces the comic canvas.');
                showAssistant = true;
              }}
            >
              <span class="icon-circle">💬</span>
            </button>

            <button
              class="icon-chip"
              aria-label="Generate comic"
              title="Generate comic from this entry"
              on:click={generateSnapshot}
              disabled={!canGenerateSnapshot}
            >
              <span class="icon-circle">🎨</span>
            </button>

            <div class="h-6 w-px bg-slate-200 mx-1"></div>

            <button class="icon-chip disabled" aria-label="Journals (coming soon)" disabled title="Journals — coming soon">
              <span class="icon-circle">📓</span>
            </button>
            <button class="icon-chip disabled" aria-label="Comics (coming soon)" disabled title="Comics — coming soon">
              <span class="icon-circle">🖼️</span>
            </button>
            <button class="icon-chip disabled" aria-label="Overall reflections (coming soon)" disabled title="Overall reflections — coming soon">
              <span class="icon-circle">⭐</span>
            </button>

            <div class="h-6 w-px bg-slate-200 mx-1"></div>

            <button class="icon-chip danger" aria-label="Clear entry" title="Reset today’s entry" on:click={() => (showClearModal = true)}>
              <span class="icon-circle">⛔</span>
            </button>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-100 bg-white/80 shadow-inner flex-1 min-h-[375px] relative">
          <textarea
            bind:value={journalText}
            disabled={isLoadingEntry}
            class="w-full h-full min-h-[340px] resize-none rounded-2xl p-4 bg-transparent text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-[17px] leading-8 disabled:opacity-50"
            style="font-family: 'Shadows Into Light', 'Handlee', cursive;"
            placeholder={isLoadingEntry ? 'Loading...' : "How did your day unfold? What detail keeps replaying? Capture it in your own voice."}
          ></textarea>
          <div class="absolute bottom-4 right-4 flex items-center gap-2">
            {#if isSaving}
              <div class="text-xs text-slate-500 flex items-center gap-1">
                <span class="animate-spin">⏳</span>
                <span>Saving...</span>
              </div>
            {:else if saveSuccess}
              <div class="text-xs text-emerald-600 flex items-center gap-1">
                <span>✓</span>
                <span>Saved!</span>
              </div>
            {/if}
            <button
              type="button"
              on:click={saveForTheDay}
              disabled={isSaving || isLoadingEntry}
              class="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-emerald-600 hover:-translate-y-[1px] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span>✓</span>
              <span>Done for the day</span>
            </button>
          </div>
          {#if autoAssistEnabled}
            <button
              class="auto-assist-orb"
              type="button"
              title="Open auto-assist prompt"
              on:click={() => (showAutoAssistCard = !showAutoAssistCard)}
              aria-label="Show auto-assist suggestion"
            >
              <span class="text-lg">🤖</span>
            </button>
            {#if showAutoAssistCard && autoAssistPrompt}
              <div class="auto-assist-card">
                <div class="text-[11px] uppercase tracking-[0.2em] text-emerald-600 mb-1">Auto-assist</div>
                <div class="text-sm text-slate-800 leading-snug">{autoAssistPrompt}</div>
                <div class="flex justify-end mt-2">
                  <button class="mini-nav" on:click={() => (showAutoAssistCard = false)}>Got it</button>
                </div>
              </div>
            {/if}
          {/if}
        </div>
        <div class="pt-3"></div>
      </div>
    </div>
  </div>

  <div slot="right" class="flex flex-col h-[calc(100vh-6rem)] pb-6 space-y-4">
    <div
      class={`h-[98%] rounded-3xl p-5 md:p-6 text-slate-900 flex flex-col gap-5 transition-all duration-300 ${
        showAssistant
          ? 'bg-gradient-to-br from-slate-50 via-white to-slate-50/80'
          : bookMode
            ? 'bg-gradient-to-br from-white via-amber-50/70 to-white'
            : 'bg-white/90'
      }`}
      style="backdrop-filter: blur(20px); border: 1px solid rgba(226,232,240,0.9); box-shadow: 0 24px 48px rgba(15,23,42,0.12), 0 0 0 1px rgba(var(--accent),0.06);"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="text-[11px] uppercase tracking-[0.15em] text-stone-500">
            {showAssistant ? 'Chat companion' : bookMode ? 'Journal book spread' : 'Comic assistant zone'}
          </div>
          <div class="text-lg md:text-xl font-semibold font-display">
            {showAssistant ? 'A calm thread for reflection' : 'Snapshot of the day'}
          </div>
          <p class="text-sm text-stone-500 max-w-xl">
            {showAssistant
              ? 'Focused chat space—just conversation, no comics.'
              : 'Hover to explore panels'}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0 self-start">
          <button
            type="button"
            class={`rounded-full px-3 py-1.5 text-sm border transition ${!showAssistant ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white border-slate-200 text-slate-800 hover:-translate-y-[1px]'}`}
            on:click={() => (showAssistant = false)}
          >
            Comic canvas
          </button>
          <button
            type="button"
            class={`rounded-full px-3 py-1.5 text-sm border transition ${showAssistant ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/30' : 'bg-white border-slate-200 text-slate-800 hover:-translate-y-[1px]'}`}
            on:click={() => (showAssistant = true)}
          >
            Chat companion
          </button>
        </div>
      </div>

      {#if showAssistant}
        <div class="flex-1 min-h-0 flex flex-col gap-3">
          <div class="flex-1 min-h-[360px]">
            <ChatPanel
              {messages}
              containerClass="h-full p-0 border-0 shadow-none bg-transparent"
              {isUserTyping}
              {userTypingSpeed}
              {isAssistantTyping}
              {assistantTypingSpeed}
              keystrokeTrigger={keystrokeCount}
            />
          </div>
          <div class="pt-1">
            <JournalInput
              placeholder="Share what's on your mind..."
              on:submit={handleSubmit}
              on:typing={handleTyping}
              on:keystroke={handleKeystroke}
            />
          </div>
        </div>
      {:else}
        <div class="flex-1 min-h-0 rounded-2xl bg-transparent p-0 flex flex-col">
          {#if snapshotError}
            <div class="bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl p-3 text-sm">
              {snapshotError}
            </div>
          {:else}
            <div class="grid grid-rows-3 gap-3 flex-1 animate-fade-in-fast">
              {#each rowSlotIndices as row}
                <div class={`grid gap-3 w-full`} style={`grid-template-columns: repeat(${row.length}, minmax(0, 1fr));`}>
                  {#each row as idx}
                    {#if snapshots[idx]}
                      <button
                        class="group relative rounded-lg border-[2px] border-slate-900 bg-amber-50/20 overflow-hidden shadow-[4px_6px_0_rgba(15,23,42,0.22)] transition-transform duration-200"
                        type="button"
                        on:click={() => allImagesDone && openPanelModal(snapshots[idx])}
                        aria-disabled={!allImagesDone}
                        tabindex={allImagesDone ? 0 : -1}
                      >
                        {#if snapshots[idx].imageUrl}
                          <img src={snapshots[idx].imageUrl} alt={snapshots[idx].title} class="absolute inset-0 h-full w-full object-cover" />
                          <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/12 to-transparent"></div>
                        {:else}
                          <div class="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50" />
                        {/if}
                        {#if snapshots[idx].isLoading}
                          <div class="absolute inset-0 animate-[pulseFade_1.6s_ease-in-out_infinite] bg-gradient-to-br from-emerald-200/40 via-cyan-200/35 to-indigo-200/35 mix-blend-multiply"></div>
                          <div class="absolute inset-0 bg-gradient-to-r from-white/45 via-white/10 to-white/45 animate-[shimmer_1.4s_infinite] mix-blend-screen"></div>
                          <div class="absolute inset-0 grid place-items-center">
                            <div class="h-10 w-10 rounded-full border-2 border-white/60 border-t-transparent animate-spin"></div>
                          </div>
                        {/if}
                        <div class="absolute inset-0 bg-gradient-to-br from-white/70 to-white/30 opacity-80"></div>
                        {#if allImagesDone}
                          <div class="relative h-full w-full p-3 flex flex-col justify-end">
                            <div class="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                              {snapshots[idx].mood || 'Moment'}
                            </div>
                            <div class="text-sm font-semibold text-stone-800 drop-shadow-sm line-clamp-2">
                              {snapshots[idx].title || 'Untitled moment'}
                            </div>
                          </div>
                        {/if}
                      </button>
                    {:else}
                      <div class="rounded-lg border-[2px] border-slate-900 bg-amber-50/20 relative overflow-hidden shadow-[4px_6px_0_rgba(15,23,42,0.22)]">
                        <div class="absolute inset-0 bg-gradient-to-br from-white to-slate-100 opacity-90"></div>
                        <div class="absolute inset-0 grid place-items-center">
                          <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Panel</div>
                        </div>
                      </div>
                    {/if}
                  {/each}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <SnapshotModal 
      open={isModalOpen}
      title={snapshotMeta?.title || 'Snapshot'}
      summary={snapshotMeta?.summary || 'This space will hold your reflective summary.'}
      panel={selectedPanel}
      on:close={closeModal}
    />
  {#if showClearModal}
    <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center px-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-3">
        <div class="text-lg font-semibold text-slate-900">Reset entry?</div>
        <p class="text-sm text-slate-600">This clears today&apos;s text, chat, and comic placeholders for the selected date.</p>
        <div class="flex justify-end gap-2">
          <button class="mini-nav" on:click={() => (showClearModal = false)}>Cancel</button>
          <button
            class="px-3 py-2 rounded-lg bg-rose-500 text-white font-semibold shadow-sm hover:brightness-105"
            on:click={() => {
              journalText = '';
              messages = [
                {
                  role: 'assistant',
                  content:
                    "Welcome back. Take a slow breath with me. What's one moment from today you'd like to remember or understand a bit better?"
                }
              ];
              snapshots = [];
              snapshotMeta = null;
              selectedPanel = null;
              isModalOpen = false;
              showAssistant = false;
              showClearModal = false;
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  {/if}
  </div>
</MoodAdaptiveLayout>
{:else}
  <div class="h-screen w-full grid place-items-center bg-slate-50 text-slate-600">
    Redirecting to sign in…
  </div>
{/if}

<style>
  .icon-chip {
    height: 44px;
    width: 44px;
    border-radius: 9999px;
    display: grid;
    place-items: center;
    background: #fff;
    border: 1px solid rgba(226, 232, 240, 0.9);
    transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  }
  .icon-chip:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(15,23,42,0.08);
    border-color: rgba(16,185,129,0.35);
  }
  .icon-chip.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .icon-chip.active {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 8px 18px rgba(59,130,246,0.12);
  }
  .icon-chip.danger:hover {
    border-color: rgba(248,113,113,0.6);
    box-shadow: 0 10px 20px rgba(248,113,113,0.18);
  }
  .icon-circle {
    height: 30px;
    width: 30px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(226,232,240,0.9));
    font-size: 17px;
  }
  .calendar-popover {
    position: absolute;
    top: 56px;
    left: 0;
    z-index: 20;
    width: 240px;
    background: #fff;
    border: 1px solid rgba(226,232,240,0.9);
    box-shadow: 0 18px 36px rgba(15,23,42,0.18);
    border-radius: 16px;
    padding: 10px;
    transition: all 150ms ease;
  }
  .mini-nav {
    border: 1px solid rgba(226,232,240,0.9);
    background: #fff;
    border-radius: 10px;
    padding: 6px 10px;
    font-size: 12px;
    color: #0f172a;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .mini-nav:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(15,23,42,0.12);
  }
  .auto-assist-orb {
    position: absolute;
    right: 14px;
    bottom: 14px;
    height: 40px;
    width: 40px;
    border-radius: 9999px;
    border: 1px solid rgba(226,232,240,0.9);
    background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12));
    display: grid;
    place-items: center;
    box-shadow: 0 10px 22px rgba(15,23,42,0.12);
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .auto-assist-orb:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 14px 26px rgba(16,185,129,0.18);
  }
  .auto-assist-card {
    position: absolute;
    right: 14px;
    bottom: 64px;
    width: min(280px, 70vw);
    background: #fff;
    border: 1px solid rgba(226,232,240,0.95);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 18px 36px rgba(15,23,42,0.18);
  }
</style>