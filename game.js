// AION Browser MMO - Client-side Game Logic

// Game State
const gameState = {
    player: null,
    players: {},
    npcs: {},
    monsters: {},
    items: {},
    quests: [],
    inventory: [],
    socket: null,
    canvas: null,
    ctx: null,
    minimapCanvas: null,
    minimapCtx: null,
    camera: { x: 0, y: 0 },
    currentTarget: null,
    lastUpdateTime: 0,
    isConnected: false,
    gameRunning: false,
    selectedClass: null,
    playerName: '',
    // UI Elements
    uiElements: {},
    // Input State
    keys: {},
    mouse: { x: 0, y: 0 },
    // Animation Frame
    animationFrameId: null
};

// Game Constants
const GAME_CONFIG = {
    TILE_SIZE: 32,
    PLAYER_SIZE: 32,
    NPC_SIZE: 32,
    MONSTER_SIZE: 32,
    ITEM_SIZE: 16,
    MAP_WIDTH: 100,
    MAP_HEIGHT: 100,
    SCALE: 2,
    CLASS_COLORS: {
        warrior: '#8B0000',
        mage: '#483D8B',
        archer: '#228B22'
    },
    CLASS_STATS: {
        warrior: { strength: 15, dexterity: 5, intelligence: 5, attack: 20, defense: 15 },
        mage: { strength: 5, dexterity: 5, intelligence: 15, attack: 10, defense: 5 },
        archer: { strength: 5, dexterity: 15, intelligence: 5, attack: 15, defense: 5 }
    },
    ABILITY_COOLDOWNS: {
        attack: 1000,
        skill1: 5000,
        skill2: 8000,
        skill3: 10000,
        heal: 10000
    }
};

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    // Get DOM elements
    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.minimapCanvas = document.getElementById('minimap-canvas');
    gameState.minimapCtx = gameState.minimapCanvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Get UI elements
    gameState.uiElements = {
        loadingScreen: document.getElementById('loading-screen'),
        loginScreen: document.getElementById('login-screen'),
        gameContainer: document.getElementById('game-container'),
        playerNameInput: document.getElementById('player-name'),
        startGameBtn: document.getElementById('start-game'),
        classOptions: document.querySelectorAll('.class-option'),
        healthBar: document.getElementById('health-bar'),
        manaBar: document.getElementById('mana-bar'),
        expBar: document.getElementById('exp-bar'),
        healthValue: document.getElementById('health-value'),
        manaValue: document.getElementById('mana-value'),
        expValue: document.getElementById('exp-value'),
        playerNameDisplay: document.getElementById('player-name-display'),
        playerLevel: document.getElementById('player-level'),
        playerClass: document.getElementById('player-class'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendChatBtn: document.getElementById('send-chat'),
        targetInfo: document.getElementById('target-info'),
        targetName: document.querySelector('.target-name'),
        targetHealthBar: document.getElementById('target-health-bar'),
        questsContainer: document.getElementById('quests'),
        inventoryScreen: document.getElementById('inventory-screen'),
        inventoryGrid: document.getElementById('inventory-grid'),
        closeInventoryBtn: document.getElementById('close-inventory'),
        characterScreen: document.getElementById('character-screen'),
        closeCharacterBtn: document.getElementById('close-character'),
        statStrength: document.getElementById('stat-strength'),
        statDexterity: document.getElementById('stat-dexterity'),
        statIntelligence: document.getElementById('stat-intelligence'),
        statAttack: document.getElementById('stat-attack'),
        statDefense: document.getElementById('stat-defense'),
        statGold: document.getElementById('stat-gold')
    };
    
    // Setup class selection
    setupClassSelection();
    
    // Setup event listeners
    setupEventListeners();
    
    // Connect to server
    connectToServer();
    
    // Show loading screen initially
    gameState.uiElements.loadingScreen.style.display = 'flex';
    gameState.uiElements.loginScreen.style.display = 'none';
    gameState.uiElements.gameContainer.style.display = 'none';
    
    // Simulate loading
    setTimeout(() => {
        gameState.uiElements.loadingScreen.style.display = 'none';
        gameState.uiElements.loginScreen.style.display = 'flex';
    }, 2000);
}

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    gameState.canvas.width = width;
    gameState.canvas.height = height;
    
    // Center camera
    if (gameState.player) {
        gameState.camera.x = gameState.player.x - width / 2 / GAME_CONFIG.SCALE;
        gameState.camera.y = gameState.player.y - height / 2 / GAME_CONFIG.SCALE;
    }
}

function setupClassSelection() {
    gameState.uiElements.classOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from all
            gameState.uiElements.classOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selection to clicked
            option.classList.add('selected');
            gameState.selectedClass = option.dataset.class;
        });
    });
}

function setupEventListeners() {
    // Start game button
    gameState.uiElements.startGameBtn.addEventListener('click', startGame);
    
    // Chat
    gameState.uiElements.sendChatBtn.addEventListener('click', sendChatMessage);
    gameState.uiElements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    // Inventory
    gameState.uiElements.closeInventoryBtn.addEventListener('click', () => {
        gameState.uiElements.inventoryScreen.classList.remove('active');
    });
    
    // Character screen
    gameState.uiElements.closeCharacterBtn.addEventListener('click', () => {
        gameState.uiElements.characterScreen.classList.remove('active');
    });
    
    // Keyboard input
    window.addEventListener('keydown', (e) => {
        gameState.keys[e.code] = true;
        
        // Handle ability hotkeys
        if (e.key >= '1' && e.key <= '5') {
            const abilityIndex = parseInt(e.key) - 1;
            useAbility(abilityIndex);
        }
        
        // Open inventory with I
        if (e.code === 'KeyI') {
            gameState.uiElements.inventoryScreen.classList.add('active');
            updateInventoryDisplay();
        }
        
        // Open character screen with C
        if (e.code === 'KeyC') {
            gameState.uiElements.characterScreen.classList.add('active');
            updateCharacterDisplay();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        gameState.keys[e.code] = false;
    });
    
    // Mouse input
    gameState.canvas.addEventListener('mousemove', (e) => {
        const rect = gameState.canvas.getBoundingClientRect();
        gameState.mouse.x = (e.clientX - rect.left) / GAME_CONFIG.SCALE + gameState.camera.x;
        gameState.mouse.y = (e.clientY - rect.top) / GAME_CONFIG.SCALE + gameState.camera.y;
    });
    
    gameState.canvas.addEventListener('click', (e) => {
        // Check for target selection
        const rect = gameState.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / GAME_CONFIG.SCALE + gameState.camera.x;
        const mouseY = (e.clientY - rect.top) / GAME_CONFIG.SCALE + gameState.camera.y;
        
        // Find closest target
        findTarget(mouseX, mouseY);
    });
    
    // Ability buttons
    document.querySelectorAll('.ability').forEach((ability, index) => {
        ability.addEventListener('click', () => {
            useAbility(index);
        });
    });
}

function connectToServer() {
    // Connect to Socket.IO server
    gameState.socket = io();
    
    gameState.socket.on('connect', () => {
        gameState.isConnected = true;
        console.log('Connected to server');
    });
    
    gameState.socket.on('disconnect', () => {
        gameState.isConnected = false;
        console.log('Disconnected from server');
    });
    
    // Handle player join
    gameState.socket.on('playerJoined', (playerData) => {
        gameState.players[playerData.id] = playerData;
        if (playerData.id === gameState.socket.id) {
            gameState.player = playerData;
            initGameWorld();
        }
    });
    
    // Handle player leave
    gameState.socket.on('playerLeft', (playerId) => {
        delete gameState.players[playerId];
    });
    
    // Handle player movement
    gameState.socket.on('playerMoved', (data) => {
        if (gameState.players[data.id]) {
            gameState.players[data.id].x = data.x;
            gameState.players[data.id].y = data.y;
            gameState.players[data.id].direction = data.direction;
            gameState.players[data.id].isMoving = data.isMoving;
        }
    });
    
    // Handle player update (stats, etc.)
    gameState.socket.on('playerUpdate', (data) => {
        if (gameState.players[data.id]) {
            Object.assign(gameState.players[data.id], data);
            
            // Update UI if this is our player
            if (data.id === gameState.socket.id) {
                updatePlayerUI();
            }
        }
    });
    
    // Handle NPCs
    gameState.socket.on('npcsUpdate', (npcs) => {
        gameState.npcs = npcs;
    });
    
    // Handle monsters
    gameState.socket.on('monstersUpdate', (monsters) => {
        gameState.monsters = monsters;
    });
    
    // Handle items
    gameState.socket.on('itemsUpdate', (items) => {
        gameState.items = items;
    });
    
    // Handle quests
    gameState.socket.on('questsUpdate', (quests) => {
        gameState.quests = quests;
        updateQuestDisplay();
    });
    
    // Handle inventory
    gameState.socket.on('inventoryUpdate', (inventory) => {
        gameState.inventory = inventory;
        updateInventoryDisplay();
    });
    
    // Handle chat
    gameState.socket.on('chatMessage', (data) => {
        addChatMessage(data.sender, data.message);
    });
    
    // Handle combat
    gameState.socket.on('combatResult', (data) => {
        handleCombatResult(data);
    });
    
    // Handle ability use
    gameState.socket.on('abilityUsed', (data) => {
        // Show ability effect
        showAbilityEffect(data);
    });
}

function startGame() {
    const name = gameState.uiElements.playerNameInput.value.trim();
    const selectedClass = gameState.selectedClass;
    
    if (!name || !selectedClass) {
        alert('Bitte wähle einen Namen und eine Klasse!');
        return;
    }
    
    gameState.playerName = name;
    
    // Hide login screen
    gameState.uiElements.loginScreen.style.display = 'none';
    gameState.uiElements.gameContainer.style.display = 'block';
    gameState.uiElements.gameContainer.classList.add('active');
    
    // Create player data
    const playerData = {
        name: name,
        class: selectedClass,
        x: 50,
        y: 50,
        ...GAME_CONFIG.CLASS_STATS[selectedClass],
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        level: 1,
        exp: 0,
        gold: 0
    };
    
    // Send player creation to server
    gameState.socket.emit('createPlayer', playerData);
    
    // Start game loop
    gameState.gameRunning = true;
    gameState.lastUpdateTime = Date.now();
    gameLoop();
}

function initGameWorld() {
    // Initialize UI
    updatePlayerUI();
    updateInventoryDisplay();
    updateCharacterDisplay();
    
    // Center camera on player
    gameState.camera.x = gameState.player.x - gameState.canvas.width / 2 / GAME_CONFIG.SCALE;
    gameState.camera.y = gameState.player.y - gameState.canvas.height / 2 / GAME_CONFIG.SCALE;
    
    // Request initial game state
    gameState.socket.emit('requestGameState');
}

function updatePlayerUI() {
    if (!gameState.player) return;
    
    // Update health bar
    const healthPercent = (gameState.player.health / gameState.player.maxHealth) * 100;
    gameState.uiElements.healthBar.style.width = `${healthPercent}%`;
    gameState.uiElements.healthValue.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
    
    // Update mana bar
    const manaPercent = (gameState.player.mana / gameState.player.maxMana) * 100;
    gameState.uiElements.manaBar.style.width = `${manaPercent}%`;
    gameState.uiElements.manaValue.textContent = `${gameState.player.mana}/${gameState.player.maxMana}`;
    
    // Update exp bar
    const expPercent = (gameState.player.exp / (gameState.player.level * 100)) * 100;
    gameState.uiElements.expBar.style.width = `${expPercent}%`;
    gameState.uiElements.expValue.textContent = `${gameState.player.exp}/${gameState.player.level * 100}`;
    
    // Update player info
    gameState.uiElements.playerNameDisplay.textContent = gameState.player.name;
    gameState.uiElements.playerLevel.textContent = `Lv. ${gameState.player.level}`;
    gameState.uiElements.playerClass.textContent = gameState.player.class;
}

function updateInventoryDisplay() {
    if (!gameState.inventory) return;
    
    gameState.uiElements.inventoryGrid.innerHTML = '';
    
    for (let i = 0; i < 40; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        
        if (gameState.inventory[i]) {
            const item = gameState.inventory[i];
            slot.innerHTML = `
                <div class="item-icon" style="background: ${item.color}" title="${item.name}">
                    ${item.icon || '?'}
                </div>
            `;
        } else {
            slot.className = 'inventory-slot empty';
        }
        
        gameState.uiElements.inventoryGrid.appendChild(slot);
    }
}

function updateCharacterDisplay() {
    if (!gameState.player) return;
    
    gameState.uiElements.statStrength.textContent = gameState.player.strength;
    gameState.uiElements.statDexterity.textContent = gameState.player.dexterity;
    gameState.uiElements.statIntelligence.textContent = gameState.player.intelligence;
    gameState.uiElements.statAttack.textContent = gameState.player.attack;
    gameState.uiElements.statDefense.textContent = gameState.player.defense;
    gameState.uiElements.statGold.textContent = gameState.player.gold || 0;
}

function updateQuestDisplay() {
    if (!gameState.quests) return;
    
    gameState.uiElements.questsContainer.innerHTML = '';
    
    gameState.quests.forEach(quest => {
        const questElement = document.createElement('div');
        questElement.className = `quest ${quest.completed ? 'completed' : ''}`;
        
        questElement.innerHTML = `
            <div class="quest-title">${quest.name}</div>
            <div class="quest-progress">${quest.current}/${quest.required} ${quest.description}</div>
        `;
        
        gameState.uiElements.questsContainer.appendChild(questElement);
    });
}

function sendChatMessage() {
    const message = gameState.uiElements.chatInput.value.trim();
    if (!message) return;
    
    // Send to server
    gameState.socket.emit('chatMessage', { message: message });
    
    // Add to local chat
    addChatMessage(gameState.player.name, message);
    
    // Clear input
    gameState.uiElements.chatInput.value = '';
}

function addChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `<span class="sender">${sender}:</span> ${message}`;
    
    gameState.uiElements.chatMessages.appendChild(messageElement);
    gameState.uiElements.chatMessages.scrollTop = gameState.uiElements.chatMessages.scrollHeight;
    
    // Limit chat messages
    while (gameState.uiElements.chatMessages.children.length > 50) {
        gameState.uiElements.chatMessages.removeChild(gameState.uiElements.chatMessages.firstChild);
    }
}

function findTarget(x, y) {
    let closestTarget = null;
    let closestDistance = Infinity;
    
    // Check monsters
    for (const id in gameState.monsters) {
        const monster = gameState.monsters[id];
        const distance = Math.sqrt(Math.pow(x - monster.x, 2) + Math.pow(y - monster.y, 2));
        
        if (distance < closestDistance && distance < 50) {
            closestDistance = distance;
            closestTarget = { type: 'monster', id: id, ...monster };
        }
    }
    
    // Check NPCs
    for (const id in gameState.npcs) {
        const npc = gameState.npcs[id];
        const distance = Math.sqrt(Math.pow(x - npc.x, 2) + Math.pow(y - npc.y, 2));
        
        if (distance < closestDistance && distance < 50) {
            closestDistance = distance;
            closestTarget = { type: 'npc', id: id, ...npc };
        }
    }
    
    // Check players
    for (const id in gameState.players) {
        if (id === gameState.socket.id) continue;
        const player = gameState.players[id];
        const distance = Math.sqrt(Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2));
        
        if (distance < closestDistance && distance < 50) {
            closestDistance = distance;
            closestTarget = { type: 'player', id: id, ...player };
        }
    }
    
    if (closestTarget) {
        gameState.currentTarget = closestTarget;
        updateTargetInfo();
    } else {
        gameState.currentTarget = null;
        gameState.uiElements.targetInfo.classList.remove('active');
    }
}

function updateTargetInfo() {
    if (!gameState.currentTarget) return;
    
    gameState.uiElements.targetInfo.classList.add('active');
    gameState.uiElements.targetName.textContent = `Ziel: ${gameState.currentTarget.name}`;
    
    if (gameState.currentTarget.health !== undefined) {
        const healthPercent = (gameState.currentTarget.health / gameState.currentTarget.maxHealth) * 100;
        gameState.uiElements.targetHealthBar.style.width = `${healthPercent}%`;
    }
}

function useAbility(index) {
    if (!gameState.player || !gameState.isConnected) return;
    
    const abilities = ['attack', 'skill1', 'skill2', 'skill3', 'heal'];
    const ability = abilities[index];
    
    // Check cooldown
    const now = Date.now();
    if (gameState.player.cooldowns && gameState.player.cooldowns[ability] > now) {
        return;
    }
    
    // Send ability use to server
    gameState.socket.emit('useAbility', {
        ability: ability,
        target: gameState.currentTarget ? gameState.currentTarget.id : null
    });
    
    // Start cooldown
    startCooldown(index);
}

function startCooldown(index) {
    const abilities = ['attack', 'skill1', 'skill2', 'skill3', 'heal'];
    const ability = abilities[index];
    const cooldown = GAME_CONFIG.ABILITY_COOLDOWNS[ability];
    
    const abilityElement = document.querySelectorAll('.ability')[index];
    const cooldownElement = abilityElement.querySelector('.cooldown');
    
    cooldownElement.classList.add('active');
    abilityElement.classList.add('active');
    
    setTimeout(() => {
        cooldownElement.classList.remove('active');
        abilityElement.classList.remove('active');
    }, cooldown);
}

function handleCombatResult(data) {
    // Show damage numbers
    showDamageNumber(data.targetId, data.damage);
    
    // Update target health if it's our target
    if (gameState.currentTarget && gameState.currentTarget.id === data.targetId) {
        updateTargetInfo();
    }
    
    // Check if we were hit
    if (data.targetId === gameState.socket.id) {
        updatePlayerUI();
    }
}

function showDamageNumber(targetId, damage) {
    // Find target position
    let target = null;
    
    if (gameState.players[targetId]) {
        target = gameState.players[targetId];
    } else if (gameState.monsters[targetId]) {
        target = gameState.monsters[targetId];
    } else if (gameState.npcs[targetId]) {
        target = gameState.npcs[targetId];
    }
    
    if (!target) return;
    
    // Create damage number
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = `-${damage}`;
    damageElement.style.position = 'absolute';
    damageElement.style.left = `${(target.x - gameState.camera.x) * GAME_CONFIG.SCALE}px`;
    damageElement.style.top = `${(target.y - gameState.camera.y - 30) * GAME_CONFIG.SCALE}px`;
    damageElement.style.color = '#ff4444';
    damageElement.style.fontSize = '16px';
    damageElement.style.fontWeight = 'bold';
    damageElement.style.textShadow = '0 0 5px #000';
    damageElement.style.pointerEvents = 'none';
    damageElement.style.zIndex = '100';
    
    document.body.appendChild(damageElement);
    
    // Animate
    let position = 0;
    const animate = () => {
        position -= 1;
        damageElement.style.top = `${(target.y - gameState.camera.y - 30 + position) * GAME_CONFIG.SCALE}px`;
        damageElement.style.opacity = Math.max(0, 1 - Math.abs(position) / 20);
        
        if (position > -20) {
            requestAnimationFrame(animate);
        } else {
            damageElement.remove();
        }
    };
    
    requestAnimationFrame(animate);
}

function showAbilityEffect(data) {
    // Could implement visual effects for abilities
    console.log('Ability effect:', data);
}

function gameLoop() {
    if (!gameState.gameRunning) return;
    
    const now = Date.now();
    const deltaTime = (now - gameState.lastUpdateTime) / 1000;
    gameState.lastUpdateTime = now;
    
    // Update game
    update(deltaTime);
    
    // Render game
    render();
    
    // Render minimap
    renderMinimap();
    
    // Continue loop
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    if (!gameState.player || !gameState.isConnected) return;
    
    // Handle player movement
    let isMoving = false;
    let direction = gameState.player.direction || 'down';
    
    if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) {
        gameState.player.y -= 2;
        direction = 'up';
        isMoving = true;
    }
    if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) {
        gameState.player.y += 2;
        direction = 'down';
        isMoving = true;
    }
    if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
        gameState.player.x -= 2;
        direction = 'left';
        isMoving = true;
    }
    if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
        gameState.player.x += 2;
        direction = 'right';
        isMoving = true;
    }
    
    // Update camera
    const cameraSpeed = 5;
    const targetCameraX = gameState.player.x - gameState.canvas.width / 2 / GAME_CONFIG.SCALE;
    const targetCameraY = gameState.player.y - gameState.canvas.height / 2 / GAME_CONFIG.SCALE;
    
    gameState.camera.x += (targetCameraX - gameState.camera.x) * cameraSpeed * deltaTime;
    gameState.camera.y += (targetCameraY - gameState.camera.y) * cameraSpeed * deltaTime;
    
    // Send movement to server
    if (isMoving) {
        gameState.socket.emit('movePlayer', {
            x: gameState.player.x,
            y: gameState.player.y,
            direction: direction,
            isMoving: isMoving
        });
        
        gameState.player.direction = direction;
        gameState.player.isMoving = isMoving;
    } else {
        gameState.socket.emit('movePlayer', {
            x: gameState.player.x,
            y: gameState.player.y,
            direction: direction,
            isMoving: false
        });
        
        gameState.player.isMoving = false;
    }
}

function render() {
    if (!gameState.ctx) return;
    
    // Clear canvas
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Save context
    gameState.ctx.save();
    
    // Scale for pixel art
    gameState.ctx.scale(GAME_CONFIG.SCALE, GAME_CONFIG.SCALE);
    
    // Translate for camera
    gameState.ctx.translate(-gameState.camera.x, -gameState.camera.y);
    
    // Draw background
    drawBackground();
    
    // Draw game objects
    drawGameObjects();
    
    // Restore context
    gameState.ctx.restore();
}

function drawBackground() {
    // Draw gradient background
    const gradient = gameState.ctx.createLinearGradient(
        gameState.camera.x, gameState.camera.y,
        gameState.camera.x + gameState.canvas.width / GAME_CONFIG.SCALE,
        gameState.camera.y + gameState.canvas.height / GAME_CONFIG.SCALE
    );
    
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#0a0a1a');
    
    gameState.ctx.fillStyle = gradient;
    gameState.ctx.fillRect(
        gameState.camera.x,
        gameState.camera.y,
        gameState.canvas.width / GAME_CONFIG.SCALE,
        gameState.canvas.height / GAME_CONFIG.SCALE
    );
    
    // Draw grid (for development)
    gameState.ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
    gameState.ctx.lineWidth = 1;
    
    const startX = Math.floor(gameState.camera.x / GAME_CONFIG.TILE_SIZE) * GAME_CONFIG.TILE_SIZE;
    const startY = Math.floor(gameState.camera.y / GAME_CONFIG.TILE_SIZE) * GAME_CONFIG.TILE_SIZE;
    const endX = startX + Math.ceil(gameState.canvas.width / GAME_CONFIG.SCALE / GAME_CONFIG.TILE_SIZE) * GAME_CONFIG.TILE_SIZE;
    const endY = startY + Math.ceil(gameState.canvas.height / GAME_CONFIG.SCALE / GAME_CONFIG.TILE_SIZE) * GAME_CONFIG.TILE_SIZE;
    
    for (let x = startX; x <= endX; x += GAME_CONFIG.TILE_SIZE) {
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(x, startY);
        gameState.ctx.lineTo(x, endY);
        gameState.ctx.stroke();
    }
    
    for (let y = startY; y <= endY; y += GAME_CONFIG.TILE_SIZE) {
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(startX, y);
        gameState.ctx.lineTo(endX, y);
        gameState.ctx.stroke();
    }
}

function drawGameObjects() {
    // Draw items
    for (const id in gameState.items) {
        const item = gameState.items[id];
        drawItem(item);
    }
    
    // Draw NPCs
    for (const id in gameState.npcs) {
        const npc = gameState.npcs[id];
        drawNPC(npc);
    }
    
    // Draw monsters
    for (const id in gameState.monsters) {
        const monster = gameState.monsters[id];
        drawMonster(monster);
    }
    
    // Draw other players
    for (const id in gameState.players) {
        if (id === gameState.socket.id) continue;
        const player = gameState.players[id];
        drawPlayer(player);
    }
    
    // Draw our player
    if (gameState.player) {
        drawPlayer(gameState.player);
    }
}

function drawPlayer(player) {
    const size = GAME_CONFIG.PLAYER_SIZE;
    const x = player.x - size / 2;
    const y = player.y - size / 2;
    
    // Draw player body
    gameState.ctx.fillStyle = GAME_CONFIG.CLASS_COLORS[player.class] || '#d4af37';
    gameState.ctx.fillRect(x, y, size, size);
    
    // Draw player direction indicator
    const directionColors = {
        up: '#44ff44',
        down: '#ff4444',
        left: '#4444ff',
        right: '#ffff44'
    };
    
    gameState.ctx.fillStyle = directionColors[player.direction] || '#ffffff';
    
    // Draw direction arrow
    if (player.isMoving) {
        const arrowSize = size / 3;
        const arrowX = x + size / 2 - arrowSize / 2;
        const arrowY = y + size / 2 - arrowSize / 2;
        
        gameState.ctx.fillRect(arrowX, arrowY, arrowSize, arrowSize);
    }
    
    // Draw player name
    gameState.ctx.fillStyle = '#ffffff';
    gameState.ctx.font = '8px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(player.name, x + size / 2, y - 5);
    
    // Draw health bar above player
    if (player.health < player.maxHealth) {
        const barWidth = size;
        const barHeight = 3;
        const barX = x;
        const barY = y - 10;
        
        gameState.ctx.fillStyle = '#ff0000';
        gameState.ctx.fillRect(barX, barY, barWidth * (player.health / player.maxHealth), barHeight);
        gameState.ctx.strokeStyle = '#880000';
        gameState.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

function drawNPC(npc) {
    const size = GAME_CONFIG.NPC_SIZE;
    const x = npc.x - size / 2;
    const y = npc.y - size / 2;
    
    // Draw NPC body
    gameState.ctx.fillStyle = '#448844';
    gameState.ctx.fillRect(x, y, size, size);
    
    // Draw NPC name
    gameState.ctx.fillStyle = '#ffffff';
    gameState.ctx.font = '8px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(npc.name, x + size / 2, y - 5);
    
    // Draw quest indicator if NPC has quest
    if (npc.hasQuest) {
        gameState.ctx.fillStyle = '#ffaa00';
        gameState.ctx.beginPath();
        gameState.ctx.arc(x + size / 2, y - 10, 5, 0, Math.PI * 2);
        gameState.ctx.fill();
    }
}

function drawMonster(monster) {
    const size = GAME_CONFIG.MONSTER_SIZE;
    const x = monster.x - size / 2;
    const y = monster.y - size / 2;
    
    // Draw monster body
    gameState.ctx.fillStyle = '#880000';
    gameState.ctx.fillRect(x, y, size, size);
    
    // Draw monster name
    gameState.ctx.fillStyle = '#ff0000';
    gameState.ctx.font = '8px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(monster.name, x + size / 2, y - 5);
    
    // Draw health bar
    const barWidth = size;
    const barHeight = 3;
    const barX = x;
    const barY = y - 10;
    
    gameState.ctx.fillStyle = '#ff0000';
    gameState.ctx.fillRect(barX, barY, barWidth * (monster.health / monster.maxHealth), barHeight);
    gameState.ctx.strokeStyle = '#880000';
    gameState.ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function drawItem(item) {
    const size = GAME_CONFIG.ITEM_SIZE;
    const x = item.x - size / 2;
    const y = item.y - size / 2;
    
    // Draw item
    gameState.ctx.fillStyle = item.color || '#ffff00';
    gameState.ctx.fillRect(x, y, size, size);
    
    // Draw item icon
    gameState.ctx.fillStyle = '#000000';
    gameState.ctx.font = '6px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(item.icon || '?', x + size / 2, y + size / 2 + 2);
}

function renderMinimap() {
    if (!gameState.minimapCtx) return;
    
    // Clear minimap
    gameState.minimapCtx.clearRect(0, 0, gameState.minimapCanvas.width, gameState.minimapCanvas.height);
    
    // Draw background
    gameState.minimapCtx.fillStyle = '#0a0a1a';
    gameState.minimapCtx.fillRect(0, 0, gameState.minimapCanvas.width, gameState.minimapCanvas.height);
    
    // Calculate scale
    const scaleX = gameState.minimapCanvas.width / (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE);
    const scaleY = gameState.minimapCanvas.height / (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE);
    
    // Draw player
    if (gameState.player) {
        gameState.minimapCtx.fillStyle = '#d4af37';
        gameState.minimapCtx.beginPath();
        gameState.minimapCtx.arc(
            gameState.player.x * scaleX,
            gameState.player.y * scaleY,
            3,
            0,
            Math.PI * 2
        );
        gameState.minimapCtx.fill();
    }
    
    // Draw other players
    for (const id in gameState.players) {
        if (id === gameState.socket.id) continue;
        const player = gameState.players[id];
        gameState.minimapCtx.fillStyle = GAME_CONFIG.CLASS_COLORS[player.class] || '#ffffff';
        gameState.minimapCtx.beginPath();
        gameState.minimapCtx.arc(
            player.x * scaleX,
            player.y * scaleY,
            2,
            0,
            Math.PI * 2
        );
        gameState.minimapCtx.fill();
    }
    
    // Draw NPCs
    for (const id in gameState.npcs) {
        const npc = gameState.npcs[id];
        gameState.minimapCtx.fillStyle = '#448844';
        gameState.minimapCtx.beginPath();
        gameState.minimapCtx.arc(
            npc.x * scaleX,
            npc.y * scaleY,
            2,
            0,
            Math.PI * 2
        );
        gameState.minimapCtx.fill();
    }
    
    // Draw monsters
    for (const id in gameState.monsters) {
        const monster = gameState.monsters[id];
        gameState.minimapCtx.fillStyle = '#880000';
        gameState.minimapCtx.beginPath();
        gameState.minimapCtx.arc(
            monster.x * scaleX,
            monster.y * scaleY,
            2,
            0,
            Math.PI * 2
        );
        gameState.minimapCtx.fill();
    }
    
    // Draw viewport
    gameState.minimapCtx.strokeStyle = '#d4af37';
    gameState.minimapCtx.lineWidth = 1;
    gameState.minimapCtx.strokeRect(
        gameState.camera.x * scaleX,
        gameState.camera.y * scaleY,
        (gameState.canvas.width / GAME_CONFIG.SCALE) * scaleX,
        (gameState.canvas.height / GAME_CONFIG.SCALE) * scaleY
    );
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (gameState.socket) {
        gameState.socket.disconnect();
    }
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
    }
});
