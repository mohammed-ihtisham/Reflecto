<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import MoodAdaptiveLayout from '$lib/components/ui/MoodAdaptiveLayout.svelte';
  import { mood as moodStore } from '$lib/stores/mood.js';

  const AUTH_KEY = 'reflecto_auth';
  const PROFILE_KEY = 'reflecto_profile_setup';
  const PROFILE_DATA_KEY = 'reflecto_depiction_profile';

  let depictionDescription = '';
  let photoPreview = '';
  let status = {
    type: 'info',
    message: 'Add a quick cue so we can depict you in the comic: a selfie or a short description.'
  };
  let isSaving = false;

  onMount(() => {
    moodStore.set('gentle');
    const authed =
      typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_KEY) : null;
    if (!authed) {
      goto('/auth');
      return;
    }
    const saved =
      typeof localStorage !== 'undefined' ? localStorage.getItem(PROFILE_DATA_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        depictionDescription = parsed?.description || '';
        photoPreview = parsed?.photoData || '';
      } catch (err) {
        console.warn('Failed to load saved depiction data', err);
      }
    }
  });

  function handleFileChange(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      status = { type: 'warning', message: 'Please choose an image file.' };
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      photoPreview = reader.result?.toString() || '';
      status = {
        type: 'success',
        message: 'Preview loaded. This stays on your device until we wire the backend.'
      };
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    photoPreview = '';
  }

  function skipForNow() {
    localStorage.setItem(PROFILE_KEY, 'skipped');
    goto('/dashboard');
  }

  function saveProfile() {
    if (isSaving) return;
    if (!photoPreview && !depictionDescription.trim()) {
      status = { type: 'warning', message: 'Add a photo or a short description to continue.' };
      return;
    }
    isSaving = true;
    const payload = {
      description: depictionDescription.trim(),
      photoData: photoPreview || null,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(payload));
    localStorage.setItem(PROFILE_KEY, 'complete');
    status = {
      type: 'success',
      message: 'Saved locally. Redirecting you to the dashboard…'
    };
    setTimeout(() => goto('/dashboard'), 220);
    isSaving = false;
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
          Share how you want to appear in your comic spreads. Upload a recent photo or describe your vibe—hair, colors, outfit, and anything to keep the panels true to you.
        </p>
        <div class="grid grid-cols-1 gap-3">
          <div class="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1">Why this?</div>
            <ul class="text-sm text-slate-700 space-y-1">
              <li>• Keeps your panels personal without a long setup.</li>
              <li>• Stored locally until backend storage is ready.</li>
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

    <div class="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200 shadow-xl p-5 space-y-3">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <div class="text-sm font-semibold text-slate-800">Private preview</div>
      </div>
      <p class="text-sm text-slate-600">
        Everything here stays on this device. When the backend is live, we will prompt you to sync it securely.
      </p>
      <button
        class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm shadow-lg shadow-slate-900/10 hover:-translate-y-[1px] transition"
        type="button"
        on:click={skipForNow}
      >
        Skip for now
        <span>→</span>
      </button>
    </div>
  </div>

  <div slot="right" class="h-[calc(100vh-6rem)] pb-6 flex flex-col">
    <div class="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl p-5 md:p-6 flex flex-col gap-4 flex-1">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Depiction</div>
          <div class="text-lg font-semibold text-slate-900">Upload or describe yourself</div>
          <p class="text-sm text-slate-500">Keep it simple—a single photo or a few words is enough.</p>
        </div>
        <div class="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold shadow-inner">
          Calming mode
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <label
          class="relative group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 hover:border-emerald-300 hover:bg-emerald-50/60 transition p-4 flex flex-col justify-center items-center text-center cursor-pointer"
          for="photo-upload"
        >
          {#if photoPreview}
            <img
              src={photoPreview}
              alt="Your selected depiction"
              class="absolute inset-0 h-full w-full object-cover rounded-xl opacity-90"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent rounded-xl"></div>
            <div class="relative z-10 flex flex-col items-center gap-2 text-white">
              <div class="text-sm font-semibold">Photo attached</div>
              <div class="text-xs text-white/80">Click to replace or remove below.</div>
            </div>
          {:else}
            <div class="h-12 w-12 rounded-2xl bg-white text-slate-800 border border-slate-200 grid place-items-center shadow-sm text-xl mb-2">
              📷
            </div>
            <div class="text-sm font-semibold text-slate-800">Upload a photo</div>
            <p class="text-xs text-slate-500">Face-forward, good lighting helps the comic capture you.</p>
          {/if}
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            class="hidden"
            on:change={handleFileChange}
          />
        </label>

        <div class="rounded-2xl border border-slate-200 bg-white/80 shadow-inner p-4 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <label for="depiction-description" class="text-sm font-semibold text-slate-800">Describe your look</label>
            <span class="text-xs text-slate-500">Optional but helpful</span>
          </div>
          <textarea
            id="depiction-description"
            class="w-full h-full min-h-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            placeholder="Example: Curly dark hair, glasses, soft pastel hoodie, loves teal + peach accents."
            bind:value={depictionDescription}
          ></textarea>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 justify-between">
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 px-4 py-2 text-sm border border-slate-200 shadow-sm hover:-translate-y-[1px] transition disabled:opacity-60"
            type="button"
            on:click={clearPhoto}
            disabled={!photoPreview}
          >
            Remove photo
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 px-4 py-2 text-sm border border-slate-200 shadow-sm hover:-translate-y-[1px] transition"
            type="button"
            on:click={skipForNow}
          >
            Skip for now
          </button>
        </div>
        <button
          class="inline-flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:-translate-y-[1px] transition disabled:opacity-70"
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

