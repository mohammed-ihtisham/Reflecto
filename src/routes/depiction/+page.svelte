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

<MoodAdaptiveLayout currentMood="gentle" singleColumn={true}>
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

  <div slot="main" class="pb-6">
    <div class="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4">
      <div class="space-y-1">
        <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Depiction</div>
        <div class="text-lg font-semibold text-slate-900">Describe yourself</div>
        <p class="text-sm text-slate-500">Tell us how you want to appear in your comic panels.</p>
      </div>

      {#if status?.message}
        <div class={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${statusTone}`}>
          {status.message}
        </div>
      {/if}

      <div class="flex-1 min-h-0 flex flex-col gap-4">
        <div class="rounded-2xl border border-slate-200 bg-white/80 shadow-inner p-4 flex flex-col gap-3 flex-1">
          <div class="flex items-center justify-between">
            <label for="depiction-description" class="text-sm font-semibold text-slate-800">Describe your look</label>
            <span class="text-xs text-slate-500">Required</span>
          </div>
          <textarea
            id="depiction-description"
            class="w-full h-full min-h-[280px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition resize-none"
            placeholder="Example: Curly dark hair, glasses, soft pastel hoodie, loves teal + peach accents. Medium height, warm smile, often wears casual comfortable clothes."
            bind:value={depictionDescription}
          ></textarea>
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
  </div>
</MoodAdaptiveLayout>

