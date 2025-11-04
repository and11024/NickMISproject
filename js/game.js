// Enhanced Maze Game with Spectacular Fireworks and Arcade Music
(() => {
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas.getContext('2d');
    let backgroundMusic = null;

    // Setup background music
    function setupBackgroundMusic() {
        backgroundMusic = new Audio('https://www.classicgaming.cc/classics/pac-man/sounds/beginning.wav');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
    }

    // Controls
    const newMazeBtn = document.getElementById('new-maze');
    const rowsInput = document.getElementById('maze-rows');
    const colsInput = document.getElementById('maze-cols');
    const status = document.getElementById('game-status');

	let rows = parseInt(rowsInput.value, 10) || 21;
	let cols = parseInt(colsInput.value, 10) || 21;

	// Maze grid: 0 = wall, 1 = passage
	let grid = [];
	let cellSize = 20;
	// Game state variables
let player = { x: 1, y: 1 };
let maze = [];
let gameStarted = false;
let gameTimer = null;
let startTime = null;
let backgroundMusic = null;

// Create background music
function setupBackgroundMusic() {
    backgroundMusic = new Audio('https://www.classicgaming.cc/classics/pac-man/sounds/beginning.wav');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
}
	let goal = { r: rows - 2, c: cols - 2 };

	// Game state
	let timer = 0;
	let timerInterval = null;
	let timerStarted = false;
	let difficultyLevel = 1;
	const timerDisplay = document.getElementById('timer');
	const difficultyDisplay = document.getElementById('difficulty');

	function init() {
		// Setup background music if not already set up
		if (!backgroundMusic) {
			setupBackgroundMusic();
		}
		
		rows = Math.max(5, parseInt(rowsInput.value, 10) || 21);
		cols = Math.max(5, parseInt(colsInput.value, 10) || 21);
		if (rows % 2 === 0) rows++;
		if (cols % 2 === 0) cols++;

		grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
		generateMaze();
		player = { r: 1, c: 1 };
		goal = { r: rows - 2, c: cols - 2 };
		fitCellSize();
		render();
		status.textContent = '';
	}

	// Create fireworks canvas overlay
	function createFireworksCanvas() {
		const container = document.getElementById('game-container');
		const fireworksCanvas = document.createElement('canvas');
		fireworksCanvas.id = 'fireworks-canvas';
		fireworksCanvas.style.position = 'absolute';
		fireworksCanvas.style.top = '0';
		fireworksCanvas.style.left = '0';
		fireworksCanvas.style.pointerEvents = 'none';
		fireworksCanvas.style.zIndex = '10';
		
		const gameSection = document.getElementById('game-section');
		const rect = gameSection.getBoundingClientRect();
		fireworksCanvas.width = rect.width - 80; // Account for padding
		fireworksCanvas.height = rect.height - 200; // Account for controls
		
		container.appendChild(fireworksCanvas);
		return fireworksCanvas;
	}

	// Initialize fireworks canvas
	const fireworksCanvas = createFireworksCanvas();
	const fireworksCtx = fireworksCanvas.getContext('2d');

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

	// Launch fireworks from maze center to multiple random positions
	function launchFireworks() {
		const mazeCanvas = document.getElementById('maze-canvas');
		const rect = mazeCanvas.getBoundingClientRect();
		const containerRect = document.getElementById('game-container').getBoundingClientRect();
		
		const centerX = rect.left - containerRect.left + rect.width / 2;
		const centerY = rect.top - containerRect.top + rect.height / 2;
		
		// Launch multiple fireworks from center to random positions
		const fireworkCount = 8;
		for (let i = 0; i < fireworkCount; i++) {
			setTimeout(() => {
				const targetX = randomBetween(fireworksCanvas.width * 0.2, fireworksCanvas.width * 0.8);
				const targetY = randomBetween(fireworksCanvas.height * 0.2, fireworksCanvas.height * 0.8);
				fireworks.push(new Firework(centerX, centerY, targetX, targetY));
			}, i * 200);
		}
		
		// Also add some ground fireworks
		setTimeout(() => {
			for (let i = 0; i < 6; i++) {
				const x = randomBetween(50, fireworksCanvas.width - 50);
				const y = fireworksCanvas.height - 20;
				const targetY = randomBetween(fireworksCanvas.height * 0.3, fireworksCanvas.height * 0.6);
				fireworks.push(new Firework(x, y, x + randomBetween(-30, 30), targetY));
			}
		}, 1600);
		
		// Big finale
		setTimeout(() => {
			for (let i = 0; i < 12; i++) {
				const angle = (Math.PI * 2 * i) / 12;
				const x = fireworksCanvas.width / 2;
				const y = fireworksCanvas.height / 2;
				const targetX = x + Math.cos(angle) * 200;
				const targetY = y + Math.sin(angle) * 200;
				fireworks.push(new Firework(x, y, targetX, targetY));
			}
		}, 3000);
	}

	// Fireworks animation loop
	function animateFireworks() {
		fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
		fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
		
		// Update and draw fireworks
		for (let i = fireworks.length - 1; i >= 0; i--) {
			const firework = fireworks[i];
			if (!firework.update()) {
				fireworks.splice(i, 1);
			} else {
				firework.draw();
			}
		}
		
		// Update and draw particles
		for (let i = particles.length - 1; i >= 0; i--) {
			const particle = particles[i];
			if (!particle.update()) {
				particles.splice(i, 1);
			} else {
				particle.draw();
			}
		}
		
		// Limit particle count
		if (particles.length > 1000) {
			particles.splice(0, particles.length - 1000);
		}
		
		requestAnimationFrame(animateFireworks);
	}

	// Start fireworks animation
	animateFireworks();

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
				backgroundMusic.currentTime = 0;
				backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
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
			if (timerInterval) clearInterval(timerInterval);
			
			// Play victory sound
			const victorySound = new Audio('https://www.classicgaming.cc/classics/pac-man/sounds/extend.wav');
			victorySound.volume = 0.4;
			victorySound.play().catch(e => console.log('Victory sound failed:', e));
			
			launchFireworks();
			
			// Also try confetti as backup
			try {
				confetti({
					particleCount: 100,
					spread: 100,
					origin: { y: 0.6 }
				});
				
				// Add more confetti for a bigger celebration
				setTimeout(() => {
					confetti({
						particleCount: 50,
						spread: 120,
						origin: { y: 0.7, x: 0.3 }
					});
					confetti({
						particleCount: 50,
						spread: 120,
						origin: { y: 0.7, x: 0.7 }
					});
				}, 500);
			} catch (err) {
				console.warn('Confetti not available', err);
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

	newMazeBtn.addEventListener('click', () => {
		status.textContent = '';
		fireworks.length = 0; // Clear fireworks
		particles.length = 0; // Clear particles
		init();
	});

	// Handle window resize
	window.addEventListener('resize', () => {
		// Update fireworks canvas size
		const gameSection = document.getElementById('game-section');
		const rect = gameSection.getBoundingClientRect();
		fireworksCanvas.width = rect.width - 80;
		fireworksCanvas.height = rect.height - 200;
		
		fitCellSize();
		render();
	});

	// Utility function
	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	// Initialize first maze
	init();

})();
