<!-- ProjectSettings.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger,
		DialogClose
	} from '$lib/components/ui/dialog';

	export let gameTitle: string;
	export let canvasWidth: number;
	export let canvasHeight: number;
	export let onSave: (settings: {
		gameTitle: string;
		canvasWidth: number;
		canvasHeight: number;
	}) => void;

	let tempTitle = gameTitle;
	let tempWidth = canvasWidth;
	let tempHeight = canvasHeight;

	function handleSave() {
		onSave({
			gameTitle: tempTitle,
			canvasWidth: Number(tempWidth),
			canvasHeight: Number(tempHeight)
		});
	}

	$: {
		tempTitle = gameTitle;
		tempWidth = canvasWidth;
		tempHeight = canvasHeight;
	}
</script>

<Dialog>
	<DialogTrigger>
		<Button variant="secondary" size="sm">Settings</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Project Settings</DialogTitle>
			<DialogDescription>
				Configure your game project settings. Changes will affect the exported PDF.
			</DialogDescription>
		</DialogHeader>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Game Title</Label>
				<Input bind:value={tempTitle} class="col-span-3" placeholder="Enter game title" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Canvas Width</Label>
				<Input type="number" bind:value={tempWidth} class="col-span-3" min="100" max="2000" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Canvas Height</Label>
				<Input type="number" bind:value={tempHeight} class="col-span-3" min="100" max="2000" />
			</div>
		</div>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline">Cancel</Button>
			</DialogClose>
			<DialogClose>
				<Button onclick={handleSave}>Save Changes</Button>
			</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
