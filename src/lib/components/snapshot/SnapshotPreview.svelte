<script>
  import ComicSnapshot from './ComicSnapshot.svelte';

  export let title = 'Snapshot of the Day';
  export let subtitle = 'A Day in the Life';

  const moods = ['Anticipatory', 'Awe', 'Dreamy', 'Reflective', 'Grateful', 'Thoughtful'];
  const titles = [
    'Exhibit Entrance',
    'Ferrari Dream',
    'Wishful Thinking',
    'Vintage Cool',
    'Car Enthusiast',
    'City Lights'
  ];

  function createPanels(count) {
    return Array.from({ length: count }, (_, index) => ({
      id: `${count}-${index}`,
      title: titles[index % titles.length],
      subtitle: moods[index % moods.length],
      mood: moods[index % moods.length],
      imageUrl: `https://picsum.photos/seed/reflecto-${count}-${index}/600/800`,
      description: 'Sample reflection to visualize the comic layout.'
    }));
  }

  const sampleSets = [1, 2, 3, 4, 5, 6].map((count) => ({
    count,
    panels: createPanels(count)
  }));
</script>

<div class="flex h-full flex-col rounded-3xl border border-white/80 bg-white/70 p-4 text-slate-900 shadow-2xl transition-all duration-200 hover:scale-[1.01]">
  <div class="mb-4">
    <div class="text-xs uppercase tracking-wide text-stone-500">{subtitle}</div>
    <div class="text-lg font-semibold">{title}</div>
  </div>

  <div class="flex-1 overflow-y-auto space-y-8 pr-2">
    {#each sampleSets as sample}
      <div class="space-y-3">
        <div class="text-[11px] uppercase tracking-wide text-stone-500">
          Example layout with {sample.count} panel{sample.count === 1 ? '' : 's'}
        </div>
        <ComicSnapshot panels={sample.panels} interactive={false} emptyLabel="Panel preview" />
      </div>
    {/each}
  </div>
</div>


