<script lang="ts">
	import { onMount } from 'svelte';
	import { PDFHelper } from '$lib/PDFHelper';
	import { PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import CodeMirror from 'svelte-codemirror-editor';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';
	import Toolbar from '$lib/components/editor/Toolbar.svelte';
	import Hierarchy from '$lib/components/editor/Hierarchy.svelte';
	import Inspector from '$lib/components/editor/Inspector.svelte';

	let isMobile = false;
	let showMobileWarning = false;
	let canvasWidth = 800;
	let canvasHeight = 600;
	let gameTitle = 'My PDF Game';
	let currentFileName: string | null = null;
	let currentFileHandle: FileSystemFileHandle | null = null;
	let hasFileSystem = false;

	// Global script
	let globalScript = `// Game initialization and update cycle
const WIDTH = ${canvasWidth};
const HEIGHT = ${canvasHeight};
const fps = 60;

// Access game elements by their field names
// Example: let ball = this.getField("field_ball");

// Game state variables
let gameState = {};

function initGame() {
  if (global.initialized) return;
  global.initialized = true;
  
  // Initialize your game here
  
  // Start game loop
  app.setInterval("updateGame()", 1000 / fps);
}

function updateGame() {
  // Update game state here
  
  // Update field positions
}

// Helper functions
function getPositionFromRect(rect) {
  const x = (rect[0] + rect[2]) / 2;
  const y = (rect[1] + rect[3]) / 2;
  return { x, y };
}

function setRectPosition(rect, position, width = 16, height = 16) {
  const newRect = rect.slice();
  newRect[0] = position.x - width / 2;
  newRect[1] = position.y - height / 2;
  newRect[2] = position.x + width / 2;
  newRect[3] = position.y + height / 2;
  return newRect;
}

// Start the game
initGame();`;

	// Code editor extensions
	const extensions = [javascript(), oneDark];

	// Game elements
	let gameElements: Array<{
		type: string;
		x: number;
		y: number;
		width: number;
		height: number;
		name: string;
		properties: Record<string, any>;
	}> = [];

	// Selected element
	let selectedElement: number | null = null;
	let activeTab = 'canvas';

	// Drag state
	let isDragging = false;
	let isResizing = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let elementStartX = 0;
	let elementStartY = 0;
	let elementStartWidth = 0;
	let elementStartHeight = 0;
	let resizeHandle = '';

	function handleShortcuts(event: KeyboardEvent) {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		// Save (Ctrl+S)
		if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 's') {
			event.preventDefault();
			if (hasFileSystem) {
				saveProject();
			} else {
				fallbackSave();
			}
		}
		// Save As (Ctrl+Shift+S)
		else if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
			event.preventDefault();
			saveProjectAs();
		}
		// Load (Ctrl+O)
		else if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'o') {
			event.preventDefault();
			loadProject();
		}
		// Export PDF (Ctrl+E)
		else if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'e') {
			event.preventDefault();
			exportToPDF();
		}
	}

	// Check if device is mobile
	function checkMobile() {
		isMobile = window.innerWidth < 768;
		showMobileWarning = isMobile;
	}

	onMount(() => {
		checkMobile();
		window.addEventListener('resize', checkMobile);
		window.addEventListener('keydown', handleShortcuts);

		// Check for File System Access API support
		hasFileSystem = 'showSaveFilePicker' in window;

		// Add event listeners for drag and resize
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', handleTouchEnd);

		// Add keyboard event listener for delete
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('keydown', handleShortcuts);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Handle keyboard events
	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

		if (
			event.key === 'Delete' &&
			selectedElement !== null &&
			activeTab === 'canvas' &&
			!isInputField
		) {
			// Remove the selected element
			gameElements = gameElements.filter((_, index) => index !== selectedElement);
			selectedElement = null;
		}
	}

	// Handle canvas background click
	function handleCanvasClick(event: MouseEvent | KeyboardEvent) {
		// Only deselect if clicking directly on the canvas background, not on elements
		if (event.target === event.currentTarget) {
			selectedElement = null;
		}
	}

	// Add a new element to the game
	function addElement(type: string) {
		const newElement = {
			type,
			x: 50,
			y: 50,
			width: 100,
			height: 50,
			name: `${type}_${gameElements.length + 1}`,
			properties: {
				color: '#e6e6e6',
				text: type === 'button' ? 'Click Me' : type === 'text' ? 'New Text' : '',
				jsAction: '',
				imageData: type === 'image' ? '' : undefined
			}
		};

		gameElements = [...gameElements, newElement];
		selectedElement = gameElements.length - 1;
	}

	// Start dragging an element
	function startDrag(index: number, event: MouseEvent | TouchEvent) {
		event.preventDefault();
		selectedElement = index;
		isDragging = true;
		isResizing = false;

		const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		dragStartX = clientX;
		dragStartY = clientY;
		elementStartX = gameElements[index].x;
		elementStartY = gameElements[index].y;
	}

	// Start resizing an element
	function startResize(index: number, handle: string, event: MouseEvent | TouchEvent) {
		event.preventDefault();
		event.stopPropagation();
		selectedElement = index;
		isDragging = false;
		isResizing = true;
		resizeHandle = handle;

		const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		dragStartX = clientX;
		dragStartY = clientY;
		elementStartX = gameElements[index].x;
		elementStartY = gameElements[index].y;
		elementStartWidth = gameElements[index].width;
		elementStartHeight = gameElements[index].height;
	}

	// Handle mouse move during drag or resize
	function handleMouseMove(event: MouseEvent) {
		if ((!isDragging && !isResizing) || selectedElement === null) return;

		const deltaX = event.clientX - dragStartX;
		const deltaY = event.clientY - dragStartY;

		if (isDragging) {
			// Update element position
			gameElements[selectedElement].x = Math.max(
				0,
				Math.min(canvasWidth - gameElements[selectedElement].width, elementStartX + deltaX)
			);
			gameElements[selectedElement].y = Math.max(
				0,
				Math.min(canvasHeight - gameElements[selectedElement].height, elementStartY + deltaY)
			);
			gameElements = [...gameElements];
		} else if (isResizing) {
			// Update element size based on resize handle
			const minSize = 20;
			let newWidth = elementStartWidth;
			let newHeight = elementStartHeight;
			let newX = elementStartX;
			let newY = elementStartY;

			if (resizeHandle.includes('e')) {
				newWidth = Math.max(minSize, elementStartWidth + deltaX);
				newWidth = Math.min(newWidth, canvasWidth - elementStartX);
			}
			if (resizeHandle.includes('w')) {
				const maxDeltaX = elementStartWidth - minSize;
				const clampedDeltaX = Math.max(-maxDeltaX, Math.min(elementStartX, deltaX));
				newWidth = elementStartWidth - clampedDeltaX;
				newX = elementStartX + clampedDeltaX;
			}
			if (resizeHandle.includes('s')) {
				newHeight = Math.max(minSize, elementStartHeight + deltaY);
				newHeight = Math.min(newHeight, canvasHeight - elementStartY);
			}
			if (resizeHandle.includes('n')) {
				const maxDeltaY = elementStartHeight - minSize;
				const clampedDeltaY = Math.max(-maxDeltaY, Math.min(elementStartY, deltaY));
				newHeight = elementStartHeight - clampedDeltaY;
				newY = elementStartY + clampedDeltaY;
			}

			gameElements[selectedElement].width = newWidth;
			gameElements[selectedElement].height = newHeight;
			gameElements[selectedElement].x = newX;
			gameElements[selectedElement].y = newY;
			gameElements = [...gameElements];
		}
	}

	// Handle touch move during drag or resize
	function handleTouchMove(event: TouchEvent) {
		if ((!isDragging && !isResizing) || selectedElement === null) return;
		event.preventDefault();

		const touch = event.touches[0];
		const deltaX = touch.clientX - dragStartX;
		const deltaY = touch.clientY - dragStartY;

		if (isDragging) {
			// Update element position
			gameElements[selectedElement].x = Math.max(
				0,
				Math.min(canvasWidth - gameElements[selectedElement].width, elementStartX + deltaX)
			);
			gameElements[selectedElement].y = Math.max(
				0,
				Math.min(canvasHeight - gameElements[selectedElement].height, elementStartY + deltaY)
			);
			gameElements = [...gameElements];
		} else if (isResizing) {
			// Same resize logic as mouse move
			const minSize = 20;
			let newWidth = elementStartWidth;
			let newHeight = elementStartHeight;
			let newX = elementStartX;
			let newY = elementStartY;

			if (resizeHandle.includes('e')) {
				newWidth = Math.max(minSize, elementStartWidth + deltaX);
				newWidth = Math.min(newWidth, canvasWidth - elementStartX);
			}
			if (resizeHandle.includes('w')) {
				const maxDeltaX = elementStartWidth - minSize;
				const clampedDeltaX = Math.max(-maxDeltaX, Math.min(elementStartX, deltaX));
				newWidth = elementStartWidth - clampedDeltaX;
				newX = elementStartX + clampedDeltaX;
			}
			if (resizeHandle.includes('s')) {
				newHeight = Math.max(minSize, elementStartHeight + deltaY);
				newHeight = Math.min(newHeight, canvasHeight - elementStartY);
			}
			if (resizeHandle.includes('n')) {
				const maxDeltaY = elementStartHeight - minSize;
				const clampedDeltaY = Math.max(-maxDeltaY, Math.min(elementStartY, deltaY));
				newHeight = elementStartHeight - clampedDeltaY;
				newY = elementStartY + clampedDeltaY;
			}

			gameElements[selectedElement].width = newWidth;
			gameElements[selectedElement].height = newHeight;
			gameElements[selectedElement].x = newX;
			gameElements[selectedElement].y = newY;
			gameElements = [...gameElements];
		}
	}

	// End drag or resize
	function handleMouseUp() {
		isDragging = false;
		isResizing = false;
	}

	function handleTouchEnd() {
		isDragging = false;
		isResizing = false;
	}

	// Export the game to PDF
	async function exportToPDF() {
		try {
			const pdfDoc = await PDFDocument.create();

			// Add global script as document-level JavaScript
			const page = PDFHelper.createPage(pdfDoc, canvasWidth, canvasHeight);

			if (globalScript) {
				PDFHelper.addGlobalJSAction(pdfDoc, page, globalScript);
			}
			// Create an array to hold all annotations
			const annotations = [];

			// Add a hidden field to handle the whole document
			const wholeField = PDFHelper.createField(
				pdfDoc,
				'whole',
				0,
				0,
				canvasWidth,
				canvasHeight,
				'',
				'Tx'
			);
			wholeField.set(PDFName.of('F'), PDFNumber.of(2)); // Hidden
			annotations.push(wholeField);

			// Add game elements to PDF
			for (const element of gameElements) {
				if (element.type === 'button') {
					const jsActions = element.properties.jsAction
						? {
								U: element.properties.jsAction
							}
						: undefined;

					const button = PDFHelper.createButton(
						pdfDoc,
						element.name,
						element.x,
						canvasHeight - element.y - element.height,
						element.width,
						element.height,
						element.properties.text,
						jsActions,
						element.properties.color
					);

					annotations.push(button);
				} else if (element.type === 'text') {
					const textField = PDFHelper.createField(
						pdfDoc,
						element.name,
						element.x,
						canvasHeight - element.y - element.height,
						element.width,
						element.height,
						element.properties.text,
						'Tx'
					);

					textField.set(PDFName.of('Ff'), PDFNumber.of(1));
					annotations.push(textField);
				} else if (element.type === 'field') {
					const jsActions = element.properties.jsAction
						? {
								K: element.properties.jsAction
							}
						: undefined;

					const field = PDFHelper.createField(
						pdfDoc,
						element.name,
						element.x,
						canvasHeight - element.y - element.height,
						element.width,
						element.height,
						element.properties.text,
						'Tx',
						jsActions,
						element.properties.color
					);

					annotations.push(field);
				} else if (element.type === 'image' && element.properties.imageData) {
					try {
						// Extract the actual base64 data (remove data URL prefix)
						const base64Data = element.properties.imageData.split(',')[1];
						if (!base64Data) {
							console.error('Invalid image data format');
							continue;
						}

						// Convert base64 to binary array
						const binaryString = atob(base64Data);
						const imageBytes = new Uint8Array(binaryString.length);
						for (let i = 0; i < binaryString.length; i++) {
							imageBytes[i] = binaryString.charCodeAt(i);
						}

						const jsActions = element.properties.jsAction
							? {
									U: element.properties.jsAction
								}
							: undefined;

						const imageAnnotation = await PDFHelper.createImage(
							pdfDoc,
							element.x,
							canvasHeight - element.y - element.height,
							element.width,
							element.height,
							imageBytes,
							jsActions
						);

						if (imageAnnotation) {
							annotations.push(imageAnnotation);
						}
					} catch (error) {
						console.error('Error creating image:', error);
						// Continue with other elements if one image fails
					}
				}
			}

			// Add all annotations to the page
			if (annotations.length > 0) {
				page.node.set(PDFName.of('Annots'), pdfDoc.context.obj(annotations));
			}

			// Save the PDF
			const pdfBytes = await pdfDoc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);

			// Open in new tab instead of downloading
			window.open(url, '_blank');

			// Clean up the URL after a delay to ensure it's loaded
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		} catch (error) {
			console.error('Error exporting PDF:', error);
			alert('Failed to export PDF. See console for details.');
		}
	}

	// Save project to file
	async function saveProject() {
		const projectData = {
			gameTitle,
			canvasWidth,
			canvasHeight,
			globalScript,
			gameElements
		};

		const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });

		try {
			if (!currentFileHandle) {
				// If no file is open, show save dialog
				currentFileHandle = await window.showSaveFilePicker({
					suggestedName: `${gameTitle.replace(/\s+/g, '_')}.pdfengine`,
					types: [
						{
							description: 'Based Engine Project',
							accept: {
								'application/json': ['.pdfengine']
							}
						}
					]
				});
			}

			// Get a writable stream and write the file
			const writable = await currentFileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
		} catch (err) {
			if (err instanceof Error && err.name !== 'AbortError') {
				console.error('Failed to save file:', err);
				alert('Failed to save file. See console for details.');
			}
		}
	}

	// Save project with a new filename
	async function saveProjectAs() {
		currentFileHandle = null;
		await saveProject();
	}

	// Load project from file
	async function loadProject() {
		try {
			const [fileHandle] = await window.showOpenFilePicker({
				types: [
					{
						description: 'Based Engine Project',
						accept: {
							'application/json': ['.pdfengine']
						}
					}
				]
			});

			currentFileHandle = fileHandle;
			const file = await fileHandle.getFile();
			const text = await file.text();

			const projectData = JSON.parse(text);
			gameTitle = projectData.gameTitle;
			canvasWidth = projectData.canvasWidth;
			canvasHeight = projectData.canvasHeight;
			globalScript = projectData.globalScript;
			gameElements = projectData.gameElements;
			selectedElement = null;
		} catch (err) {
			if (err instanceof Error && err.name !== 'AbortError') {
				console.error('Error loading project:', err);
				alert('Failed to load project. See console for details.');
			}
		}
	}

	// Fallback save function for unsupported browsers
	function fallbackSave() {
		const projectData = {
			gameTitle,
			canvasWidth,
			canvasHeight,
			globalScript,
			gameElements
		};

		const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${gameTitle.replace(/\s+/g, '_')}.pdfengine`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Update element handler
	function updateElement(updatedElement: any) {
		if (selectedElement !== null) {
			gameElements[selectedElement] = updatedElement;
			gameElements = [...gameElements];
		}
	}
</script>

<svelte:head>
	<title>PDFEngine - Make PDF Games</title>
</svelte:head>

{#if showMobileWarning}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle>Desktop Only</CardTitle>
				<CardDescription>This PDF Game Editor is designed for desktop use only.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Please access this application from a desktop computer for the best experience.</p>
			</CardContent>
			<CardFooter>
				<Button onclick={() => (showMobileWarning = false)}>Continue Anyway</Button>
			</CardFooter>
		</Card>
	</div>
{/if}

<div class="flex h-screen flex-col">
	<Toolbar
		{hasFileSystem}
		onSave={saveProject}
		onSaveAs={saveProjectAs}
		onLoad={loadProject}
		onExportPDF={exportToPDF}
		{gameTitle}
		{canvasWidth}
		{canvasHeight}
		onSettingsChange={(settings) => {
			gameTitle = settings.gameTitle;
			canvasWidth = settings.canvasWidth;
			canvasHeight = settings.canvasHeight;
			// Update the global script with new dimensions
			globalScript = globalScript.replace(
				/const WIDTH = \d+/,
				`const WIDTH = ${settings.canvasWidth}`
			);
			globalScript = globalScript.replace(
				/const HEIGHT = \d+/,
				`const HEIGHT = ${settings.canvasHeight}`
			);
		}}
	/>

	<div class="flex flex-1">
		<!-- Left sidebar -->
		<div class="w-64 overflow-y-auto border-r p-4">
			<Hierarchy
				{gameElements}
				{selectedElement}
				onElementSelect={(index) => (selectedElement = index)}
				onAddElement={addElement}
			/>
		</div>

		<!-- Main content -->
		<div class="flex-1 overflow-hidden">
			<Tabs bind:value={activeTab} class="flex h-full flex-col">
				<TabsList class="w-full">
					<TabsTrigger value="canvas" class="flex-1">Canvas</TabsTrigger>
					<TabsTrigger value="script" class="flex-1">Global Script</TabsTrigger>
				</TabsList>

				<TabsContent value="canvas" class="flex-1 overflow-auto">
					<div class="m-4 overflow-hidden rounded-lg border bg-white" id="canvas-container">
						<div class="flex items-center justify-center">
							<div
								class="relative border bg-white"
								style="width: {canvasWidth}px; height: {canvasHeight}px;"
								on:click={handleCanvasClick}
								on:keydown={(e) => e.key === 'Enter' && handleCanvasClick(e)}
								role="button"
								tabindex="0"
							>
								<!-- Game elements -->
								{#each gameElements as element, index}
									<div
										class="absolute {selectedElement === index ? 'z-10' : 'z-0'}"
										style="left: {element.x}px; top: {element.y}px; width: {element.width}px; height: {element.height}px;"
									>
										<!-- Element content -->
										<div
											class="absolute inset-0 cursor-move border-2 {selectedElement === index
												? 'border-primary'
												: 'border-border'}"
											on:mousedown={(e) => startDrag(index, e)}
											on:touchstart={(e) => startDrag(index, e)}
											role="button"
											aria-label="Draggable element"
											tabindex="0"
										>
											{#if element.type === 'button'}
												<div
													class="flex h-full w-full items-center justify-center text-sm text-muted-foreground"
													style="background-color: {element.properties.color};"
												>
													{element.properties.text}
												</div>
											{:else if element.type === 'text'}
												<div
													class="flex h-full w-full items-center justify-center text-sm text-black"
												>
													{element.properties.text}
												</div>
											{:else if element.type === 'field'}
												<div
													class="h-full w-full border"
													style="background-color: {element.properties.color};"
												></div>
											{:else if element.type === 'image' && element.properties.imageData}
												<img
													src={element.properties.imageData}
													alt={element.name}
													class="h-full w-full object-contain"
												/>
											{/if}
										</div>

										<!-- Resize handles -->
										{#if selectedElement === index}
											<!-- Corner handles -->
											<div
												class="absolute -left-1 -top-1 h-3 w-3 cursor-nwse-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'nw', e)}
												on:touchstart={(e) => startResize(index, 'nw', e)}
												role="button"
												aria-label="Resize northwest"
												tabindex="0"
											></div>
											<div
												class="absolute -right-1 -top-1 h-3 w-3 cursor-nesw-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'ne', e)}
												on:touchstart={(e) => startResize(index, 'ne', e)}
												role="button"
												aria-label="Resize northeast"
												tabindex="0"
											></div>
											<div
												class="absolute -bottom-1 -left-1 h-3 w-3 cursor-nesw-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'sw', e)}
												on:touchstart={(e) => startResize(index, 'sw', e)}
												role="button"
												aria-label="Resize southwest"
												tabindex="0"
											></div>
											<div
												class="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'se', e)}
												on:touchstart={(e) => startResize(index, 'se', e)}
												role="button"
												aria-label="Resize southeast"
												tabindex="0"
											></div>

											<!-- Edge handles -->
											<div
												class="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-ns-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'n', e)}
												on:touchstart={(e) => startResize(index, 'n', e)}
												role="button"
												aria-label="Resize north"
												tabindex="0"
											></div>
											<div
												class="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-ns-resize bg-primary"
												on:mousedown={(e) => startResize(index, 's', e)}
												on:touchstart={(e) => startResize(index, 's', e)}
												role="button"
												aria-label="Resize south"
												tabindex="0"
											></div>
											<div
												class="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 cursor-ew-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'w', e)}
												on:touchstart={(e) => startResize(index, 'w', e)}
												role="button"
												aria-label="Resize west"
												tabindex="0"
											></div>
											<div
												class="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 cursor-ew-resize bg-primary"
												on:mousedown={(e) => startResize(index, 'e', e)}
												on:touchstart={(e) => startResize(index, 'e', e)}
												role="button"
												aria-label="Resize east"
												tabindex="0"
											></div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="script" class="flex-1">
					<div class="m-4">
						<Card>
							<CardHeader>
								<CardTitle>Global JavaScript</CardTitle>
								<CardDescription>
									Define game initialization, update cycle, and helper functions
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div class="h-[600px] overflow-auto border">
									<CodeMirror
										bind:value={globalScript}
										{extensions}
										theme={oneDark}
										styles={{
											'&': {
												height: '100%'
											}
										}}
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>

		<!-- Right sidebar -->
		<div class="w-80 overflow-y-auto border-l p-4">
			<Inspector
				selectedElement={selectedElement !== null ? (gameElements[selectedElement] as any) : null}
				onElementUpdate={updateElement}
			/>
		</div>
	</div>
</div>

<style>
	:global(#canvas-container) {
		all: revert;
	}
</style>
