<script>
  export let className = '';
</script>

<div class={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
  <div
    class="absolute inset-0 will-change-transform"
    style="
      background-image: radial-gradient(1000px 500px at 20% -10%, rgba(var(--accent),0.18), transparent),
                        radial-gradient(900px 450px at 100% 0%, rgba(var(--accent2),0.14), transparent);
      "
  ></div>
  <div
    class="absolute inset-0 opacity-80 animate-drift"
    style="
      background: linear-gradient(120deg, rgba(var(--accent),0.08), rgba(var(--accent2),0.06), rgba(255,255,255,0));
      background-size: 200% 200%;
    "
  ></div>
  <div
    class="absolute inset-0"
    style="background: radial-gradient(120% 120% at 50% 50%, transparent 65%, rgba(255,255,255,0.85) 100%)"
  ></div>
</div>


