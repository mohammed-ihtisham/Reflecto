<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/auth');
  });
</script>

<div class="h-screen w-full grid place-items-center text-slate-600 bg-slate-50">
  Redirecting to sign in…
</div>
