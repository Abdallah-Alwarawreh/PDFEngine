<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	let isMobile = false;

	// Grid configuration for shape distribution
	const GRID_COLS = 5;
	const GRID_ROWS = 3;
	const shapes = Array(GRID_COLS * GRID_ROWS)
		.fill(null)
		.map((_, i) => {
			const col = i % GRID_COLS;
			const row = Math.floor(i / GRID_COLS);

			// Calculate base position with some randomness within the cell
			const baseX = (col / GRID_COLS) * 100;
			const baseY = (row / GRID_ROWS) * 100;
			const randomOffset = 10; // % offset within cell

			return {
				x: baseX + (Math.random() * randomOffset - randomOffset / 2),
				y: baseY + (Math.random() * randomOffset - randomOffset / 2),
				size: Math.random() * 100 + 100,
				rotation: Math.random() * 360,
				delay: Math.random() * 10,
				duration: Math.random() * 5 + 15
			};
		});

	onMount(() => {
		isMobile = window.innerWidth <= 768;
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth <= 768;
		});
	});
</script>

<svelte:head>
	<title>PDFEngine - Make PDF Games</title>
</svelte:head>

{#if isMobile}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-6 text-white"
	>
		<div class="rounded-lg bg-red-900/50 p-6 text-center">
			<h2 class="mb-4 text-2xl font-bold">Mobile Access Restricted</h2>
			<p>PDFEngine is designed for desktop use only. Please access from a computer.</p>
		</div>
	</div>
{:else}
	<main
		class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white"
	>
		<!-- Background SVG Decorations -->
		<div class="absolute inset-0 z-0">
			<svg class="h-full w-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
				<defs>
					<linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#9333EA;stop-opacity:1" />
					</linearGradient>
				</defs>
				<pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
					<path d="M 4 0 L 0 0 0 4" fill="none" stroke="url(#grid-gradient)" stroke-width="0.5" />
				</pattern>
				<rect width="100" height="100" fill="url(#grid)" />
			</svg>
		</div>

		<!-- Floating Shapes -->
		<div class="absolute inset-0 z-0 overflow-hidden">
			{#each shapes as shape, i}
				<div
					class="animate-float absolute"
					style="
						left: {shape.x}%;
						top: {shape.y}%;
						width: {shape.size}px;
						height: {shape.size}px;
						animation-delay: -{shape.delay}s;
						animation-duration: {shape.duration}s;
					"
				>
					<svg viewBox="0 0 100 100" class="h-full w-full opacity-15">
						{#if i % 3 === 0}
							<!-- Hexagon -->
							<polygon
								points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
								fill="url(#grid-gradient)"
								transform="rotate({shape.rotation})"
							/>
						{:else if i % 3 === 1}
							<!-- Circle with inner ring -->
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="url(#grid-gradient)"
								stroke-width="2"
							/>
							<circle
								cx="50"
								cy="50"
								r="35"
								fill="none"
								stroke="url(#grid-gradient)"
								stroke-width="1"
							/>
						{:else}
							<!-- Square with diagonal lines -->
							<rect
								x="25"
								y="25"
								width="50"
								height="50"
								fill="none"
								stroke="url(#grid-gradient)"
								stroke-width="2"
								transform="rotate({shape.rotation}, 50, 50)"
							/>
							<line x1="25" y1="25" x2="75" y2="75" stroke="url(#grid-gradient)" stroke-width="1" />
							<line x1="75" y1="25" x2="25" y2="75" stroke="url(#grid-gradient)" stroke-width="1" />
						{/if}
					</svg>
				</div>
			{/each}
		</div>

		<div class="relative z-10 text-center">
			<!-- Logo SVG -->
			<div class="mb-8 flex justify-center">
				<img src="/PDFEngine.svg" alt="PDFEngine Logo" class="h-24 w-24" />
			</div>

			<h1 class="mb-4 text-6xl font-bold tracking-tighter">
				<span class="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
					>PDFEngine</span
				>
			</h1>
			<p class="mb-12 text-xl text-gray-300">Transform PDFs into Interactive Games</p>
			<div class="flex justify-center space-x-4">
				<Button href="/editor" class="animate-bounce-subtle">Get Started</Button>
				<Button
					href="https://github.com/Abdallah-Alwarawreh/PDFEngine/docs/scripting-guide.md"
					variant="outline"
					class="backdrop-blur-sm">Documentation</Button
				>
			</div>
		</div>

		<!-- Footer -->
		<div class="absolute bottom-0 left-0 right-0 z-10 flex justify-between p-6 text-gray-400">
			<!-- Copyright -->
			<div class="flex items-center space-x-2">
				<span class="text-sm">© 2025 Made with ❤️ by</span>
				<span
					class="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text font-semibold text-transparent transition-opacity hover:opacity-80"
				>
					Hexium
				</span>
			</div>

			<!-- Social Links -->
			<div class="flex items-center space-x-4">
				<a
					href="https://discord.gg/SxTjmsS2g9"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-opacity hover:opacity-80"
					title="Join our Discord"
					aria-label="Join our Discord"
				>
					<svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
						<path
							d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
						/>
					</svg>
				</a>
				<a
					href="https://youtube.com/@HexiumDev"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-opacity hover:opacity-80"
					title="Subscribe to our YouTube"
					aria-label="Subscribe to our YouTube"
				>
					<svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
						<path
							d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
						/>
					</svg>
				</a>
			</div>
		</div>
	</main>
{/if}

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0) rotate(0deg) scale(1);
		}
		25% {
			transform: translateY(-30px) rotate(5deg) scale(1.05);
		}
		75% {
			transform: translateY(20px) rotate(-3deg) scale(0.95);
		}
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 1000;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes bounce-subtle {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	.animate-float {
		animation: float var(--float-duration, 20s) ease-in-out infinite;
		will-change: transform;
	}
</style>
