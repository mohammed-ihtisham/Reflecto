<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import MoodAdaptiveLayout from '$lib/components/ui/MoodAdaptiveLayout.svelte';
  import { mood as moodStore } from '$lib/stores/mood.js';

  let depictionDescription = '';
  let status = {
    type: 'info',
    message: 'Describe how you want to look in your comic panels. Include details about your appearance, style, and any distinctive features.'
  };
  let isSaving = false;

  onMount(async () => {
    moodStore.set('gentle');
    
    // Check if user is authenticated by trying to fetch their depiction
    try {
      const response = await fetch('/api/depiction', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        depictionDescription = data.depictionDescription || '';
      } else if (response.status === 401) {
        // Not authenticated, redirect to auth
        goto('/auth');
        return;
      } else if (response.status === 404) {
        // User not found - this shouldn't happen if user was just created
        // But we'll allow them to continue and set their description
        console.warn('User not found in depiction endpoint, but allowing to continue');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Don't redirect on error - let them try to save
    }
  });

  async function saveProfile() {
    if (isSaving) return;
    if (!depictionDescription.trim()) {
      status = { type: 'warning', message: 'Please describe how you want to look to continue.' };
      return;
    }
    
    isSaving = true;
    status = { type: 'info', message: 'Saving your description...' };

    try {
      const response = await fetch('/api/depiction', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: depictionDescription.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        status = { type: 'warning', message: data.error || 'Failed to save description. Please try again.' };
        isSaving = false;
        return;
      }

      status = {
        type: 'success',
        message: 'Description saved! Redirecting you to the dashboard…'
      };
      setTimeout(() => goto('/dashboard'), 500);
    } catch (error) {
      console.error('Save error:', error);
      status = { type: 'warning', message: 'Network error. Please check your connection and try again.' };
      isSaving = false;
    }
  }

  $: statusTone =
    status.type === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status.type === 'warning'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-700 border-slate-200';
</script>

<svelte:head>
  <title>Reflecto · Depict yourself</title>
  <meta name="description" content="Add a quick cue so we can depict you in the comic book style." />
</svelte:head>

<MoodAdaptiveLayout currentMood="gentle">
  <div
    slot="header"
    class="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
  >
    <div class="flex items-center gap-3">
      <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 border border-white grid place-items-center shadow-inner text-2xl">
        📸
      </div>
      <div>
        <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Quick setup</div>
        <div class="text-xl font-semibold text-slate-900">Depict yourself</div>
        <p class="text-sm text-slate-500">Keep the same soft gradients while you add your look.</p>
      </div>
    </div>
    <div class="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 text-sm font-semibold shadow-inner">
      1-minute step
    </div>
  </div>

  <div slot="left" class="space-y-4 h-[calc(100vh-6rem)] pb-6">
    <div class="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-6">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-200/40 via-sky-200/30 to-indigo-200/40 blur-3xl pointer-events-none"></div>
      <div class="relative space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-2xl bg-white/80 border border-white grid place-items-center text-2xl">🪶</div>
          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-emerald-700">Feels like the app</div>
            <div class="text-lg font-semibold text-slate-900">We keep the same mood</div>
          </div>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed">
          Describe how you want to appear in your comic spreads. Include details about your appearance—hair, colors, outfit, style, and anything to keep the panels true to you.
        </p>
        <div class="grid grid-cols-1 gap-3">
          <div class="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1">Why this?</div>
            <ul class="text-sm text-slate-700 space-y-1">
              <li>• Keeps your panels personal and consistent.</li>
              <li>• Stored securely in your account.</li>
              <li>• Takes less than a minute—then straight to dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    {#if status?.message}
      <div class={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${statusTone}`}>
        {status.message}
      </div>
    {/if}

  </div>

  <div slot="right" class="h-[calc(100vh-6rem)] pb-6 flex flex-col">
    <div class="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl p-5 md:p-6 flex flex-col gap-4 flex-1">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Depiction</div>
          <div class="text-lg font-semibold text-slate-900">Describe yourself</div>
          <p class="text-sm text-slate-500">Tell us how you want to appear in your comic panels.</p>
        </div>
        <div class="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold shadow-inner">
          Calming mode
        </div>
      </div>

      <div class="flex-1 min-h-0 flex flex-col">
        <div class="rounded-2xl border border-slate-200 bg-white/80 shadow-inner p-4 flex flex-col gap-3 flex-1">
          <div class="flex items-center justify-between">
            <label for="depiction-description" class="text-sm font-semibold text-slate-800">Describe your look</label>
            <span class="text-xs text-slate-500">Required</span>
          </div>
          <textarea
            id="depiction-description"
            class="w-full h-full min-h-[300px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition resize-none"
            placeholder="Example: Curly dark hair, glasses, soft pastel hoodie, loves teal + peach accents. Medium height, warm smile, often wears casual comfortable clothes."
            bind:value={depictionDescription}
          ></textarea>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 justify-end">
        <button
          class="inline-flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:-translate-y-[1px] transition disabled:opacity-70"
          type="button"
          on:click={saveProfile}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save and continue'}
          <span>→</span>
        </button>
      </div>
    </div>
  </div>
</MoodAdaptiveLayout>

