// Enhanced Maze Game with Spectacular Fireworks and Arcade Music
(() => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
    
    function initGame() {
    const canvas = document.getElementById('maze-canvas');
    if (!canvas) {
        console.error('Canvas not found');
        return; // Exit if canvas doesn't exist
    }
    const ctx = canvas.getContext('2d');
    
    // Controls
    const newMazeBtn = document.getElementById('new-maze');
    const rowsInput = document.getElementById('maze-rows');
    const colsInput = document.getElementById('maze-cols');
    const canvasSizeInput = document.getElementById('canvas-size');
    const status = document.getElementById('game-status');
    const timerDisplay = document.getElementById('timer');
    const difficultyDisplay = document.getElementById('difficulty');
    
    if (!newMazeBtn || !rowsInput || !colsInput || !status || !timerDisplay || !difficultyDisplay) {
        console.error('Required DOM elements not found');
        return;
    }

	const MIN_SIZE = 5;
	const MAX_SIZE = 1001;

	let rows = parseInt(rowsInput.value, 10) || 21;
	let cols = parseInt(colsInput.value, 10) || 21;

	// Maze grid: 0 = wall, 1 = passage
	let grid = [];
	let cellSize = 20;
	
	// Game state variables
	let player = { r: 1, c: 1 };
	let goal = { r: rows - 2, c: cols - 2 };
	let backgroundMusic = null;

	// Game state
	let timer = 0;
	let timerInterval = null;
	let timerStarted = false;
	let difficultyLevel = 1;

	// Setup background music (elevator music)
	function setupBackgroundMusic() {
		if (!backgroundMusic) {
			// Using a free elevator/background music track
			// You can replace this URL with your own elevator music file:
			// - Local file: 'videos/elevator-music.mp3' (place your file in the videos folder)
			// - Or use any other URL to an MP3 file
			backgroundMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
			backgroundMusic.loop = true;
			backgroundMusic.volume = 0.25; // Lower volume for background elevator music
			
			// Try to start playing when page loads (may require user interaction in some browsers)
			backgroundMusic.play().catch(e => {
				// Browser requires user interaction - will start on first move instead
				console.log('Background music will start on first move');
			});
		}
	}

	function init() {
		try {
			// Reset timer
			if (timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
			}
			timer = 0;
			timerStarted = false;
			difficultyLevel = 1;
			updateTimerDisplay();
			updateDifficultyDisplay();
			
			// Stop background music if playing
			if (backgroundMusic && !backgroundMusic.paused) {
				backgroundMusic.pause();
				backgroundMusic.currentTime = 0;
			}
			
			// Setup background music if not already set up
			setupBackgroundMusic();
			
		rows = Math.max(MIN_SIZE, Math.min(MAX_SIZE, parseInt(rowsInput.value, 10) || 21));
		cols = Math.max(MIN_SIZE, Math.min(MAX_SIZE, parseInt(colsInput.value, 10) || 21));
			if (rows % 2 === 0) rows++;
			if (cols % 2 === 0) cols++;

		// Update canvas size if specified
		if (canvasSizeInput) {
			const newSize = Math.max(300, Math.min(1200, parseInt(canvasSizeInput.value, 10) || 700));
			canvas.width = newSize;
			canvas.height = newSize;
			// Remove any CSS size constraints to allow canvas to use its actual pixel dimensions
			canvas.style.width = '';
			canvas.style.height = '';
		}

		grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
		generateMaze();
		player = { r: 1, c: 1 };
		goal = { r: rows - 2, c: cols - 2 };
		fitCellSize();
		render();
		
		// Remove fireworks canvas during gameplay so it doesn't block controls
		destroyFireworksCanvas();
		
		if (status) status.textContent = '';
		} catch (error) {
			console.error('Error initializing game:', error);
		}
	}

	function positionFireworksCanvas() {
		if (!fireworksCanvas) return;
		const container = document.getElementById('game-container');
		if (!container) return;
		const canvasRect = canvas.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		fireworksCanvas.style.top = (canvasRect.top - containerRect.top) + 'px';
		fireworksCanvas.style.left = (canvasRect.left - containerRect.left) + 'px';
		fireworksCanvas.width = canvas.width;
		fireworksCanvas.height = canvas.height;
		fireworksCanvas.style.width = canvas.width + 'px';
		fireworksCanvas.style.height = canvas.height + 'px';
	}
	
	function destroyFireworksCanvas() {
		if (fireworksCanvas) {
			fireworksCanvas.remove();
			fireworksCanvas = null;
			fireworksCtx = null;
			animationStarted = false;
		}
	}

	// Create fireworks canvas overlay
	function createFireworksCanvas() {
		const container = document.getElementById('game-container');
		if (!container) return null;
		
		// Remove existing fireworks canvas if present
		const existing = document.getElementById('fireworks-canvas');
		if (existing) existing.remove();
		
		const fireworksCanvas = document.createElement('canvas');
		fireworksCanvas.id = 'fireworks-canvas';
		fireworksCanvas.style.position = 'absolute';
		// Position relative to the maze canvas
		const canvasRect = canvas.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		fireworksCanvas.style.top = (canvasRect.top - containerRect.top) + 'px';
		fireworksCanvas.style.left = (canvasRect.left - containerRect.left) + 'px';
		fireworksCanvas.width = canvas.width;
		fireworksCanvas.height = canvas.height;
		fireworksCanvas.style.width = canvas.width + 'px';
		fireworksCanvas.style.height = canvas.height + 'px';
		fireworksCanvas.style.pointerEvents = 'none';
		fireworksCanvas.style.zIndex = '10';
		
		container.appendChild(fireworksCanvas);
		return fireworksCanvas;
	}

	// Initialize fireworks canvas (will be created after first render)
	let fireworksCanvas = null;
	let fireworksCtx = null;
	
	function ensureFireworksCanvas() {
		if (!fireworksCanvas) {
			fireworksCanvas = createFireworksCanvas();
			if (fireworksCanvas) {
				fireworksCtx = fireworksCanvas.getContext('2d');

			}
		} else {
			positionFireworksCanvas();
		}
	}

	// Fireworks system
	const fireworks = [];
	const particles = [];

	class Firework {
		constructor(x, y, targetX, targetY) {
			this.x = x;
			this.y = y;
			this.targetX = targetX;
			this.targetY = targetY;
			this.speed = 2;
			this.acceleration = 1.05;
			this.brightness = randomBetween(50, 100);
			this.targetRadius = randomBetween(30, 50);
			this.alpha = 1;
			
			// Random color
			const colors = ['#FF69B4', '#00FFFF', '#FFD700', '#FF4500', '#9370DB', '#00FF00', '#FF1493', '#1E90FF'];
			this.color = colors[Math.floor(Math.random() * colors.length)];
		}
		
		update() {
			// Move towards target
			const dx = this.targetX - this.x;
			const dy = this.targetY - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance < this.targetRadius) {
				this.explode();
				return false; // Remove from array
			}
			
			// Update position
			this.x += dx * this.speed / 100;
			this.y += dy * this.speed / 100;
			this.speed *= this.acceleration;
			
			// Add trail particles
			if (Math.random() < 0.3) {
				particles.push(new Particle(
					this.x + randomBetween(-3, 3),
					this.y + randomBetween(-3, 3),
					this.color,
					true
				));
			}
			
			return true;
		}
		
		explode() {
			// Create explosion particles
			const particleCount = 50;
			for (let i = 0; i < particleCount; i++) {
				particles.push(new Particle(
					this.x,
					this.y,
					this.color,
					false,
					randomBetween(2, 6),
					randomBetween(0, Math.PI * 2),
					randomBetween(2, 8)
				));
			}
		}
		
		draw() {
			fireworksCtx.save();
			fireworksCtx.globalCompositeOperation = 'lighter';
			fireworksCtx.shadowBlur = 15;
			fireworksCtx.shadowColor = this.color;
			fireworksCtx.fillStyle = this.color;
			fireworksCtx.globalAlpha = this.alpha;
			
			// Draw the firework
			fireworksCtx.beginPath();
			fireworksCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
			fireworksCtx.fill();
			
			// Draw glow
			fireworksCtx.beginPath();
			fireworksCtx.arc(this.x, this.y, 6, 0, Math.PI * 2);
			fireworksCtx.fill();
			
			fireworksCtx.restore();
		}
	}

	class Particle {
		constructor(x, y, color, isTrail = false, size = 3, angle = 0, speed = 5) {
			this.x = x;
			this.y = y;
			this.color = color;
			this.isTrail = isTrail;
			this.size = size;
			this.vx = isTrail ? 0 : Math.cos(angle) * speed;
			this.vy = isTrail ? 0 : Math.sin(angle) * speed;
			this.alpha = 1;
			this.decay = isTrail ? 0.8 : 0.05;
			this.gravity = isTrail ? 0 : 0.1;
		}
		
		update() {
			this.x += this.vx;
			this.y += this.vy;
			this.vy += this.gravity;
			this.alpha -= this.decay;
			return this.alpha > 0;
		}
		
		draw() {
			fireworksCtx.save();
			fireworksCtx.globalCompositeOperation = 'lighter';
			fireworksCtx.shadowBlur = this.isTrail ? 5 : 10;
			fireworksCtx.shadowColor = this.color;
			fireworksCtx.globalAlpha = this.alpha;
			fireworksCtx.fillStyle = this.color;
			
			fireworksCtx.beginPath();
			fireworksCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			fireworksCtx.fill();
			
			fireworksCtx.restore();
		}
	}

	// Launch fireworks - DISABLED to prevent performance issues
	// Using confetti library instead for lighter celebration
	function launchFireworks() {
		// Function kept for compatibility but does nothing
		// Victory celebration now uses confetti only (see checkWin function)
	}

	// Fireworks animation loop - DISABLED to prevent performance issues
	function animateFireworks() {
		// Animation disabled - using confetti library instead
		// This prevents the heavy canvas animation that was causing crashes
		
		requestAnimationFrame(animateFireworks);
	}

	// Start fireworks animation (will start after canvas is created)
	let animationStarted = false;
	function startFireworksAnimation() {
		if (!animationStarted && fireworksCanvas && fireworksCtx) {
			animationStarted = true;
			animateFireworks();
		}
	}

	function fitCellSize() {
		const padding = 20;
		const available = Math.min(canvas.width, canvas.height) - padding;
		cellSize = Math.floor(available / Math.max(rows, cols));
		if (cellSize < 6) cellSize = 6;
	}

	function generateMaze() {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) grid[r][c] = 0;
		}

		const stack = [];
		const start = { r: 1, c: 1 };
		grid[start.r][start.c] = 1;
		stack.push(start);

		const deltas = [
			{ dr: -2, dc: 0 },
			{ dr: 2, dc: 0 },
			{ dr: 0, dc: -2 },
			{ dr: 0, dc: 2 }
		];

		while (stack.length) {
			const cur = stack[stack.length - 1];
			const neighbors = deltas
				.map(d => ({ r: cur.r + d.dr, c: cur.c + d.dc, dr: d.dr, dc: d.dc }))
				.filter(n => n.r > 0 && n.r < rows - 1 && n.c > 0 && n.c < cols - 1 && grid[n.r][n.c] === 0);

			if (neighbors.length === 0) {
				stack.pop();
				continue;
			}

			const next = neighbors[Math.floor(Math.random() * neighbors.length)];
			const betweenR = cur.r + next.dr / 2;
			const betweenC = cur.c + next.dc / 2;
			grid[betweenR][betweenC] = 1;
			grid[next.r][next.c] = 1;
			stack.push({ r: next.r, c: next.c });
		}
	}

	function render() {
		if (!ctx || !canvas) {
			console.error('Canvas or context not available');
			return;
		}
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const mazeWidth = cols * cellSize;
		const mazeHeight = rows * cellSize;
		const offsetX = Math.floor((canvas.width - mazeWidth) / 2);
		const offsetY = Math.floor((canvas.height - mazeHeight) / 2);

		// Draw background
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw walls and passages
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = offsetX + c * cellSize;
				const y = offsetY + r * cellSize;
				if (grid[r][c] === 0) {
					ctx.fillStyle = '#222';
					ctx.fillRect(x, y, cellSize, cellSize);
				} else {
					ctx.fillStyle = '#f8f8f8';
					ctx.fillRect(x, y, cellSize, cellSize);
				}
			}
		}

		// Draw goal
		ctx.fillStyle = '#2ecc71';
		ctx.fillRect(offsetX + goal.c * cellSize + 2, offsetY + goal.r * cellSize + 2, cellSize - 4, cellSize - 4);

		// Draw player as a watermelon
		const px = offsetX + player.c * cellSize + cellSize / 2;
		const py = offsetY + player.r * cellSize + cellSize / 2;
		const radius = Math.max(3, cellSize * 0.35);
		
		// outer green ring
		ctx.beginPath();
		ctx.arc(px, py, radius, 0, Math.PI * 2);
		ctx.fillStyle = '#43a047';
		ctx.fill();
		// inner red center
		ctx.beginPath();
		ctx.arc(px, py, radius * 0.8, 0, Math.PI * 2);
		ctx.fillStyle = '#e74c3c';
		ctx.fill();
		// draw black seeds
		for (let i = 0; i < 8; i++) {
			const angle = (Math.PI * 2 * i) / 8;
			const sx = px + Math.cos(angle) * radius * 0.55;
			const sy = py + Math.sin(angle) * radius * 0.55;
			ctx.beginPath();
			ctx.ellipse(sx, sy, radius * 0.11, radius * 0.18, angle, 0, Math.PI * 2);
			ctx.fillStyle = '#222';
			ctx.fill();
		}
	}

	function updateTimerDisplay() {
		const min = Math.floor(timer / 60);
		const sec = timer % 60;
		timerDisplay.textContent = `⏱️ Time: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
	}

	function updateDifficultyDisplay() {
		let label = 'Normal';
		if (difficultyLevel === 2) label = 'Hard';
		if (difficultyLevel >= 3) label = 'Extreme';
		difficultyDisplay.textContent = `🎯 Difficulty: ${label}`;
	}

	function tryMove(dr, dc) {
		const nr = player.r + dr;
		const nc = player.c + dc;
		if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
		if (grid[nr][nc] === 1) {
			player.r = nr;
			player.c = nc;
			
			// Start background music on first move if not already playing
			if (!timerStarted && backgroundMusic) {
				if (backgroundMusic.paused) {
					backgroundMusic.currentTime = 0;
					backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
				}
			}
			
			if (!timerStarted) {
				timerStarted = true;
				timerInterval = setInterval(() => {
					timer++;
					updateTimerDisplay();
					if (timer === 15) difficultyLevel = 2;
					if (timer === 30) difficultyLevel = 3;
					updateDifficultyDisplay();
					if (timer === 45) {
						status.textContent = 'Maze regenerated!';
						setTimeout(() => { status.textContent = ''; }, 1200);
						init();
					}
				}, 1000);
			}
			
			render();
			checkWin();
		}
	}

	function checkWin() {
		if (player.r === goal.r && player.c === goal.c) {
			status.textContent = '🎉 MAZE COMPLETED! FIREWORKS INCOMING! 🎉';
			if (timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
			}
			timerStarted = false;
			
			// Stop background music
			if (backgroundMusic && !backgroundMusic.paused) {
				backgroundMusic.pause();
				backgroundMusic.currentTime = 0;
			}
			
			// Play victory sound
			const victorySound = new Audio('https://www.classicgaming.cc/classics/pac-man/sounds/extend.wav');
			victorySound.volume = 0.4;
			victorySound.play().catch(e => console.log('Victory sound failed:', e));
			
			// Simple confetti celebration (no heavy fireworks)
			if (typeof confetti !== 'undefined') {
				try {
					confetti({
						particleCount: 50,
						spread: 70,
						origin: { y: 0.6 }
					});
					
					// One more small burst after a delay
					setTimeout(() => {
						confetti({
							particleCount: 30,
							spread: 60,
							origin: { y: 0.6 }
						});
					}, 400);
				} catch (err) {
					console.warn('Confetti not available', err);
				}
			}
		}
	}

	// Keyboard controls
	window.addEventListener('keydown', (e) => {
		if (status.textContent) return;
		const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
		if (movementKeys.includes(e.key)) {
			e.preventDefault();
		}
		switch (e.key) {
			case 'ArrowUp':
			case 'w':
			case 'W':
				tryMove(-1, 0);
				break;
			case 'ArrowDown':
			case 's':
			case 'S':
				tryMove(1, 0);
				break;
			case 'ArrowLeft':
			case 'a':
			case 'A':
				tryMove(0, -1);
				break;
			case 'ArrowRight':
			case 'd':
			case 'D':
				tryMove(0, 1);
				break;
		}
	});

	if (newMazeBtn) {
		newMazeBtn.addEventListener('click', () => {
			status.textContent = '';
			fireworks.length = 0; // Clear fireworks
			particles.length = 0; // Clear particles
			init();
		});
	}
	
	// Size adjustment buttons
	const sizeUpBtn = document.getElementById('size-up');
	const sizeDownBtn = document.getElementById('size-down');
	
	if (sizeUpBtn && canvasSizeInput) {
		sizeUpBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			const currentSize = parseInt(canvasSizeInput.value) || 700;
			const newSize = Math.min(1200, currentSize + 50);
			canvasSizeInput.value = newSize;
			console.log('Size up clicked, new size:', newSize);
			init(); // Regenerate maze with new size
		});
	} else {
		console.log('Size up button not found:', sizeUpBtn);
	}
	
	if (sizeDownBtn && canvasSizeInput) {
		sizeDownBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			const currentSize = parseInt(canvasSizeInput.value) || 700;
			const newSize = Math.max(300, currentSize - 50);
			canvasSizeInput.value = newSize;
			console.log('Size down clicked, new size:', newSize);
			init(); // Regenerate maze with new size
		});
	} else {
		console.log('Size down button not found:', sizeDownBtn);
	}

	// Handle window resize
	window.addEventListener('resize', () => {
		fitCellSize();
		render();
		
		// Update fireworks canvas size and position to match maze canvas
		positionFireworksCanvas();
	});

	// Utility function
	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	// Setup background music on page load
	setupBackgroundMusic();
	
	// Initialize first maze
	init();
    } // End of initGame function

})();
