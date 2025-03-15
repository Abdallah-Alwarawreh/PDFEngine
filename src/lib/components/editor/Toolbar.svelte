<!-- Toolbar.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
		DropdownMenuSeparator
	} from '$lib/components/ui/dropdown-menu';
	import ProjectSettings from './ProjectSettings.svelte';

	export let onSave: () => void;
	export let onSaveAs: () => void;
	export let onLoad: () => void;
	export let onExportPDF: () => void;
	export let onPreviewPDF: () => void;
	export let hasFileSystem: boolean;
	export let gameTitle: string;
	export let canvasWidth: number;
	export let canvasHeight: number;
	export let onSettingsChange: (settings: {
		gameTitle: string;
		canvasWidth: number;
		canvasHeight: number;
	}) => void;
</script>

<div class="mb-4 flex items-center gap-2 border-b bg-muted p-2">
	<div class="flex gap-2">
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="secondary" size="sm">File</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onclick={hasFileSystem ? onSave : onSaveAs}>
					Save
					<div class="ml-auto text-xs text-muted-foreground">Ctrl+S</div>
				</DropdownMenuItem>
				<DropdownMenuItem onclick={onSaveAs}>
					Save As
					<div class="ml-auto text-xs text-muted-foreground">Ctrl+Shift+S</div>
				</DropdownMenuItem>
				<DropdownMenuItem onclick={onLoad}>
					Load
					<div class="ml-auto text-xs text-muted-foreground">Ctrl+O</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onclick={onExportPDF}>
					Download PDF
					<div class="ml-auto text-xs text-muted-foreground">Ctrl+E</div>
				</DropdownMenuItem>
				<DropdownMenuItem onclick={onPreviewPDF}>
					Preview PDF
					<div class="ml-auto text-xs text-muted-foreground">Ctrl+P</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
		<ProjectSettings {gameTitle} {canvasWidth} {canvasHeight} onSave={onSettingsChange} />
	</div>
</div>
