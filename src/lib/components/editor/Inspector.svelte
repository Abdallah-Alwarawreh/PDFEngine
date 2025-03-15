<!-- Inspector.svelte -->
<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';

	export let selectedElement: {
		type: string;
		name: string;
		x: number;
		y: number;
		width: number;
		height: number;
		properties: {
			text: string;
			jsAction: string;
			color: string;
			imageData?: string;
		};
	} | null;
	export let onElementUpdate: (element: any) => void;

	function updateElement() {
		if (selectedElement) {
			onElementUpdate({ ...selectedElement });
		}
	}

	async function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length || !selectedElement) return;

		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = () => {
			if (selectedElement && typeof reader.result === 'string') {
				selectedElement.properties.imageData = reader.result;
				updateElement();
			}
		};

		reader.readAsDataURL(file);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Properties</CardTitle>
	</CardHeader>
	<CardContent>
		{#if selectedElement}
			<div class="space-y-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label class="text-right">Name</Label>
					<Input class="col-span-3" bind:value={selectedElement.name} onchange={updateElement} />
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label class="text-right">Position</Label>
					<div class="col-span-3 grid grid-cols-2 gap-2">
						<div class="flex items-center gap-2">
							<Input type="number" bind:value={selectedElement.x} onchange={updateElement} />
						</div>
						<div class="flex items-center gap-2">
							<Input type="number" bind:value={selectedElement.y} onchange={updateElement} />
						</div>
					</div>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label class="text-right">Size</Label>
					<div class="col-span-3 grid grid-cols-2 gap-2">
						<div class="flex items-center gap-2">
							<Input type="number" bind:value={selectedElement.width} onchange={updateElement} />
						</div>
						<div class="flex items-center gap-2">
							<Input type="number" bind:value={selectedElement.height} onchange={updateElement} />
						</div>
					</div>
				</div>

				{#if selectedElement.type === 'image'}
					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Image</Label>
						<div class="col-span-3">
							<Input type="file" accept="image/*" onchange={handleImageUpload} />
							{#if selectedElement.properties.imageData}
								<div class="mt-2">
									<img
										src={selectedElement.properties.imageData}
										alt="Preview"
										class="max-h-32 w-auto"
									/>
								</div>
							{/if}
						</div>
					</div>
				{:else if selectedElement.type !== 'text'}
					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Color</Label>
						<div class="col-span-3 flex gap-2">
							<Input
								type="color"
								bind:value={selectedElement.properties.color}
								onchange={updateElement}
							/>
							<Input
								type="text"
								bind:value={selectedElement.properties.color}
								onchange={updateElement}
							/>
						</div>
					</div>
				{/if}

				{#if selectedElement.type !== 'image'}
					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Text</Label>
						<Input
							class="col-span-3"
							bind:value={selectedElement.properties.text}
							onchange={updateElement}
						/>
					</div>

					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Action</Label>
						<Textarea
							class="col-span-3"
							bind:value={selectedElement.properties.jsAction}
							onchange={updateElement}
							rows={4}
						/>
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Select an element to view its properties</p>
		{/if}
	</CardContent>
</Card>
