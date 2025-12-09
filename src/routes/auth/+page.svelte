<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import MoodAdaptiveLayout from '$lib/components/ui/MoodAdaptiveLayout.svelte';
  import { mood as moodStore } from '$lib/stores/mood.js';

  const PROFILE_KEY = 'reflecto_profile_setup';
  const PROFILE_ROUTE = '/depiction';

  let mode = 'login';
  let isLoading = false;
  let loginForm = { username: '', password: '' };
  let signupForm = { name: '', email: '', password: '', confirm: '' };
  let status = {
    type: 'info',
    message: 'Sign in or create an account to get started.'
  };

  onMount(() => {
    moodStore.set('thoughtful');
  });

  async function finishAuth(user) {
    status = {
      type: 'success',
      message: `Welcome back, ${user.name || user.username}! Redirecting to dashboard...`
    };
    // Small delay to show success message
    setTimeout(() => goto('/dashboard'), 500);
  }

  $: statusTone =
    status.type === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status.type === 'warning'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-700 border-slate-200';

  function switchMode(next) {
    mode = next;
    status = {
      type: 'info',
      message: next === 'login' 
        ? 'Sign in to your account.'
        : 'Create a new account to get started.'
    };
  }

  async function handleLogin(event) {
    event.preventDefault();
    const user = loginForm.username.trim();
    const pass = loginForm.password;

    if (!user || !pass) {
      status = { type: 'warning', message: 'Please enter both username/email and password.' };
      return;
    }

    isLoading = true;
    status = { type: 'info', message: 'Signing in...' };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: user, password: pass })
      });

      const data = await response.json();

      if (!response.ok) {
        status = { type: 'warning', message: data.error || 'Login failed. Please try again.' };
        isLoading = false;
        return;
      }

      if (data.success && data.user) {
        await finishAuth(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      status = { type: 'warning', message: 'Network error. Please check your connection and try again.' };
      isLoading = false;
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      status = { type: 'warning', message: 'Please fill in name, email, and password.' };
      return;
    }
    if (signupForm.password !== signupForm.confirm) {
      status = { type: 'warning', message: 'Passwords do not match.' };
      return;
    }
    if (signupForm.password.length < 6) {
      status = { type: 'warning', message: 'Password must be at least 6 characters long.' };
      return;
    }

    isLoading = true;
    status = { type: 'info', message: 'Creating your account...' };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          username: signupForm.email.split('@')[0] // Use email prefix as default username
        })
      });

      const data = await response.json();

      if (!response.ok) {
        status = { type: 'warning', message: data.error || 'Signup failed. Please try again.' };
        isLoading = false;
        return;
      }

      if (data.success && data.user) {
        status = {
          type: 'success',
          message: `Account created! Welcome, ${data.user.name}. Redirecting...`
        };
        setTimeout(() => goto('/dashboard'), 500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      status = { type: 'warning', message: 'Network error. Please check your connection and try again.' };
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Reflecto · Sign up / Login</title>
  <meta name="description" content="Gentle, journal-themed sign-in for Reflecto." />
</svelte:head>

<MoodAdaptiveLayout currentMood="thoughtful">
  <div
    slot="header"
    class="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
  >
    <div class="flex items-center gap-3">
      <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 border border-white grid place-items-center shadow-inner text-lg">
        🔒
      </div>
      <div>
        <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Reflecto Access</div>
        <div class="text-xl font-semibold text-slate-900">Sign up / Login</div>
        <p class="text-sm text-slate-500">Soft paper gradients, no harsh edges—just a gentle gate.</p>
      </div>
    </div>
    <div class="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 text-sm font-semibold shadow-inner">
      Private beta
    </div>
  </div>

  <div slot="left" class="space-y-4 h-[calc(100vh-6rem)] pb-6">
    <div class="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-6">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-200/40 via-sky-200/30 to-indigo-200/40 blur-3xl pointer-events-none"></div>
      <div class="relative space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-2xl bg-white/80 border border-white grid place-items-center text-2xl">🪶</div>
          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-emerald-700">Feels like the main app</div>
            <div class="text-lg font-semibold text-slate-900">Stay in the journal mood</div>
          </div>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed">
          Your secure gateway to Reflecto. The layout, gradients, and typography mirror the core Reflecto workspace so the transition feels seamless.
        </p>
        <div class="grid grid-cols-1 gap-3">
          <div class="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1">Security</div>
            <ul class="text-sm text-slate-700 space-y-1">
              <li>• Passwords are securely hashed</li>
              <li>• Sessions are encrypted with JWT</li>
              <li>• Your data is stored safely in MongoDB</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1">What to expect</div>
            <ul class="text-sm text-slate-700 space-y-1">
              <li>• Create an account or sign in</li>
              <li>• Same typography + gradients as the notebook</li>
              <li>• Jump back to the canvas once you authenticate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200 shadow-xl p-5 space-y-3">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <div class="text-sm font-semibold text-slate-800">Soft-guarded space</div>
      </div>
      <p class="text-sm text-slate-600">
        We keep the same gentle tone here: minimal friction, calming colors, and clear next steps. Sign in or create an account to get started.
      </p>
    </div>
  </div>

  <div slot="right" class="h-[calc(100vh-6rem)] pb-6 flex flex-col">
    <div class="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl p-5 md:p-6 flex flex-col gap-4 flex-1">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Account</div>
          <div class="text-lg font-semibold text-slate-900">Welcome back to your space</div>
          <p class="text-sm text-slate-500">Sign in or create an account to continue.</p>
        </div>
        <div class="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold shadow-inner">
          Secure
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        <button
          class={`rounded-xl py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          type="button"
          on:click={() => switchMode('login')}
        >
          Login
        </button>
        <button
          class={`rounded-xl py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          type="button"
          on:click={() => switchMode('signup')}
        >
          Sign up
        </button>
      </div>

      {#if status?.message}
        <div class={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${statusTone}`}>
          {status.message}
        </div>
      {/if}

      {#if mode === 'login'}
        <form class="space-y-4 flex-1 flex flex-col" on:submit={handleLogin}>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-slate-800" for="username">Username</label>
            <input
              id="username"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              placeholder="yourname"
              bind:value={loginForm.username}
            />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-slate-800" for="password">Password</label>
            <input
              id="password"
              type="password"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              placeholder="••••••••"
              bind:value={loginForm.password}
            />
          </div>
          <div class="flex flex-col gap-3 mt-auto">
            <button
              type="submit"
              disabled={isLoading}
              class="inline-flex justify-center items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold shadow-lg shadow-slate-900/15 hover:-translate-y-[1px] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <span class="animate-spin">⏳</span>
                Signing in...
              {:else}
                Login
              {/if}
            </button>
          </div>
        </form>
      {:else}
        <form class="space-y-4 flex-1 flex flex-col" on:submit={handleSignup}>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-slate-800" for="name">Full name</label>
            <input
              id="name"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              placeholder="Your name"
              bind:value={signupForm.name}
            />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-slate-800" for="email">Email</label>
            <input
              id="email"
              type="email"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              placeholder="you@example.com"
              bind:value={signupForm.email}
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-sm font-semibold text-slate-800" for="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                placeholder="••••••••"
                bind:value={signupForm.password}
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-semibold text-slate-800" for="signup-confirm">Confirm</label>
              <input
                id="signup-confirm"
                type="password"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                placeholder="Re-enter password"
                bind:value={signupForm.confirm}
              />
            </div>
          </div>
          <p class="text-xs text-slate-500">
            By creating an account, you agree to our terms of service. Your data is securely stored.
          </p>
          <div class="flex flex-col gap-3 mt-auto">
            <button
              type="submit"
              disabled={isLoading}
              class="inline-flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:-translate-y-[1px] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <span class="animate-spin">⏳</span>
                Creating account...
              {:else}
                Create Account
              {/if}
            </button>
            <button
              type="button"
              class="inline-flex justify-center items-center gap-2 rounded-2xl bg-white text-slate-800 px-4 py-3 text-sm font-semibold border border-slate-200 shadow-sm hover:-translate-y-[1px] transition"
              on:click={() => switchMode('login')}
            >
              Already have an account? Login instead
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</MoodAdaptiveLayout>

