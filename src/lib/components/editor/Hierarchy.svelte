<!-- Hierarchy.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	export let gameElements: Array<{
		type: string;
		name: string;
	}>;
	export let selectedElement: number | null;
	export let onElementSelect: (index: number) => void;
	export let onAddElement: (type: string) => void;
</script>

<div class="flex h-full flex-col">
	<Card class="flex-1">
		<CardHeader>
			<CardTitle>Hierarchy</CardTitle>
		</CardHeader>
		<CardContent class="p-0">
			<ScrollArea class="h-[calc(100%-2rem)] px-4">
				<div class="space-y-2 py-2">
					{#each gameElements as element, index}
						<div
							class="cursor-pointer rounded p-2 transition-colors {selectedElement === index
								? 'bg-accent text-accent-foreground'
								: 'hover:bg-muted'}"
							on:click={() => onElementSelect(index)}
							role="button"
							tabindex="0"
							on:keydown={(e) => e.key === 'Enter' && onElementSelect(index)}
						>
							{element.name}
						</div>
					{/each}
				</div>
			</ScrollArea>
		</CardContent>
	</Card>

	<Card class="mt-4">
		<CardHeader>
			<CardTitle>Add Elements</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-2">
				<Button
					variant="secondary"
					class="w-full justify-start"
					onclick={() => onAddElement('button')}
				>
					Add Button
				</Button>
				<Button
					variant="secondary"
					class="w-full justify-start"
					onclick={() => onAddElement('text')}
				>
					Add Text
				</Button>
				<Button
					variant="secondary"
					class="w-full justify-start"
					onclick={() => onAddElement('field')}
				>
					Add Input Field
				</Button>
				<Button
					variant="secondary"
					class="w-full justify-start"
					onclick={() => onAddElement('image')}
				>
					Add Image
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
