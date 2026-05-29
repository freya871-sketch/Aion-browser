// AION Browser MMO - Enhanced Client-side Game Logic

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
    particleCanvas: null,
    particleCtx: null,
    minimapCanvas: null,
    minimapCtx: null,
    camera: { x: 0, y: 0 },
    currentTarget: null,
    lastUpdateTime: 0,
    isConnected: false,
    gameRunning: false,
    selectedClass: null,
    playerName: '',
    // New features
    timeOfDay: 'day',
    currentWeather: 'sunny',
    isFlying: false,
    isMounted: false,
    currentMount: null,
    flyLevel: 0,
    guild: null,
    inDungeon: false,
    inArena: false,
    currentDungeon: null,
    currentArenaOpponent: null,
    craftingRecipes: [],
    // UI Elements
    uiElements: {},
    // Systems
    spriteManager: null,
    particleSystem: null,
    soundManager: null,
    // Input State
    keys: {},
    mouse: { x: 0, y: 0 },
    // Animation Frame
    animationFrameId: null,
    // Time tracking
    lastTimeUpdate: 0,
    lastWeatherUpdate: 0,
    lastParticleUpdate: 0
};

// Game Configuration
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
        heal: 10000,
        mount: 3000,
        fly: 5000
    },
    // Dungeon configuration
    DUNGEONS: {
        'goblin_cave': {
            name: 'Goblin-Höhle',
            minLevel: 1,
            monsters: ['Goblin', 'Goblin', 'Ork'],
            boss: 'Goblin King',
            reward: { exp: 500, gold: 200, item: 'Goblin Sword' },
            mapSize: { width: 50, height: 50 }
        },
        'ork_fortress': {
            name: 'Ork-Festung',
            minLevel: 5,
            monsters: ['Ork', 'Ork', 'Ork', 'Wolf'],
            boss: 'Ork Warlord',
            reward: { exp: 1000, gold: 500, item: 'Ork Armor' },
            mapSize: { width: 60, height: 60 }
        },
        'undead_tomb': {
            name: 'Verlassene Gruft',
            minLevel: 10,
            monsters: ['Skelett', 'Skelett', 'Skelett', 'Zombie'],
            boss: 'Death Knight',
            reward: { exp: 1500, gold: 800, item: 'Soul Stone' },
            mapSize: { width: 70, height: 70 }
        }
    },
    // Mount configuration
    MOUNTS: {
        horse: { name: 'Pferd', speed: 8, fly: false, icon: '🐴', color: '#8B4513' },
        dragon: { name: 'Drache', speed: 10, fly: true, icon: '🐉', color: '#FF4500' },
        phoenix: { name: 'Phönix', speed: 12, fly: true, icon: '🔥', color: '#FFD700' },
        griffin: { name: 'Greif', speed: 9, fly: true, icon: '🦅', color: '#DAA520' }
    },
    // Weather types
    WEATHER_TYPES: ['sunny', 'cloudy', 'rain', 'snow', 'fog'],
    // Time of day
    TIME_OF_DAY: ['day', 'dusk', 'night', 'dawn']
};

// Crafting Recipes
const CRAFTING_RECIPES = [
    {
        id: 'health_potion',
        name: 'Heiltrank',
        type: 'potion',
        effect: 'heal',
        value: 50,
        requiredItems: { 'Herb': 3, 'Water': 1 },
        requiredLevel: 1,
        color: '#FF4444',
        icon: '❤'
    },
    {
        id: 'mana_potion',
        name: 'Manatrank',
        type: 'potion',
        effect: 'mana',
        value: 50,
        requiredItems: { 'Mana Herb': 3, 'Water': 1 },
        requiredLevel: 1,
        color: '#4444FF',
        icon: '⚡'
    },
    {
        id: 'sword',
        name: 'Eisenschwert',
        type: 'weapon',
        attack: 10,
        requiredItems: { 'Iron': 5, 'Wood': 2 },
        requiredLevel: 3,
        color: '#C0C0C0',
        icon: '⚔'
    },
    {
        id: 'shield',
        name: 'Eisenschild',
        type: 'armor',
        defense: 8,
        requiredItems: { 'Iron': 8, 'Wood': 3 },
        requiredLevel: 3,
        color: '#8B4513',
        icon: '🛡'
    },
    {
        id: 'bow',
        name: 'Langbogen',
        type: 'weapon',
        attack: 12,
        requiredItems: { 'Wood': 10, 'String': 1 },
        requiredLevel: 5,
        color: '#8B4513',
        icon: '🏹'
    }
];

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    // Get DOM elements
    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.particleCanvas = document.getElementById('particle-canvas');
    gameState.particleCtx = gameState.particleCanvas.getContext('2d');
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
        statGold: document.getElementById('stat-gold'),
        statFlyLevel: document.getElementById('stat-fly-level'),
        timeIcon: document.getElementById('time-icon'),
        timeDisplay: document.getElementById('time-display'),
        weatherIcon: document.getElementById('weather-icon'),
        weatherDisplay: document.getElementById('weather-display'),
        guildIndicator: document.getElementById('guild-indicator'),
        guildName: document.getElementById('guild-name'),
        guildScreen: document.getElementById('guild-screen'),
        guildNameDisplay: document.getElementById('guild-name-display'),
        guildMembers: document.getElementById('guild-members'),
        guildRank: document.getElementById('guild-rank'),
        guildGold: document.getElementById('guild-gold'),
        createGuildBtn: document.getElementById('create-guild'),
        leaveGuildBtn: document.getElementById('leave-guild'),
        guildChatBtn: document.getElementById('guild-chat'),
        closeGuildBtn: document.getElementById('close-guild'),
        guildsContainer: document.getElementById('guilds'),
        craftingScreen: document.getElementById('crafting-screen'),
        craftingRecipesContainer: document.getElementById('crafting-recipes'),
        closeCraftingBtn: document.getElementById('close-crafting'),
        arenaScreen: document.getElementById('arena-screen'),
        arenaWins: document.getElementById('arena-wins'),
        arenaLosses: document.getElementById('arena-losses'),
        arenaRank: document.getElementById('arena-rank'),
        startArenaFightBtn: document.getElementById('start-arena-fight'),
        leaveArenaBtn: document.getElementById('leave-arena'),
        closeArenaBtn: document.getElementById('close-arena'),
        arenaOpponentsContainer: document.getElementById('arena-opponents'),
        dungeonScreen: document.getElementById('dungeon-screen'),
        dungeonListContainer: document.getElementById('dungeon-list'),
        closeDungeonBtn: document.getElementById('close-dungeon'),
        enterArenaBtn: document.getElementById('enter-arena'),
        enterDungeonBtn: document.getElementById('enter-dungeon'),
        settingsScreen: document.getElementById('settings-screen'),
        musicToggle: document.getElementById('music-toggle'),
        soundToggle: document.getElementById('sound-toggle'),
        volumeSlider: document.getElementById('volume-slider'),
        particlesToggle: document.getElementById('particles-toggle'),
        spritesToggle: document.getElementById('sprites-toggle'),
        saveSettingsBtn: document.getElementById('save-settings'),
        closeSettingsBtn: document.getElementById('close-settings'),
        backgroundMusic: document.getElementById('background-music')
    };
    
    // Initialize systems
    initSystems();
    
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

function initSystems() {
    // Initialize Sprite Manager
    gameState.spriteManager = SpriteManager;
    gameState.spriteManager.init(gameState.canvas);
    
    // Initialize Particle System
    gameState.particleSystem = ParticleSystem;
    gameState.particleSystem.init(gameState.particleCanvas);
    gameState.particleCanvas.width = window.innerWidth;
    gameState.particleCanvas.height = window.innerHeight;
    gameState.particleCanvas.style.position = 'absolute';
    gameState.particleCanvas.style.top = '0';
    gameState.particleCanvas.style.left = '0';
    gameState.particleCanvas.style.pointerEvents = 'none';
    gameState.particleCanvas.style.zIndex = '10';
    
    // Initialize Sound Manager
    gameState.soundManager = SoundManager;
    gameState.soundManager.init();
    gameState.soundManager.setMusicEnabled(true);
    gameState.soundManager.setSoundEnabled(true);
    
    // Load crafting recipes
    gameState.craftingRecipes = CRAFTING_RECIPES;
}

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    gameState.canvas.width = width;
    gameState.canvas.height = height;
    gameState.particleCanvas.width = width;
    gameState.particleCanvas.height = height;
    
    // Center camera
    if (gameState.player) {
        gameState.camera.x = gameState.player.x - width / 2 / GAME_CONFIG.SCALE;
        gameState.camera.y = gameState.player.y - height / 2 / GAME_CONFIG.SCALE;
    }
}

function setupClassSelection() {
    gameState.uiElements.classOptions.forEach(option => {
        option.addEventListener('click', () => {
            gameState.uiElements.classOptions.forEach(opt => opt.classList.remove('selected'));
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
    
    // Guild screen
    gameState.uiElements.createGuildBtn.addEventListener('click', createGuild);
    gameState.uiElements.leaveGuildBtn.addEventListener('click', leaveGuild);
    gameState.uiElements.guildChatBtn.addEventListener('click', () => {
        gameState.uiElements.chatInput.value = '/g ';
        gameState.uiElements.chatInput.focus();
    });
    gameState.uiElements.closeGuildBtn.addEventListener('click', () => {
        gameState.uiElements.guildScreen.classList.remove('active');
    });
    
    // Crafting screen
    gameState.uiElements.closeCraftingBtn.addEventListener('click', () => {
        gameState.uiElements.craftingScreen.classList.remove('active');
    });
    
    // Arena screen
    gameState.uiElements.startArenaFightBtn.addEventListener('click', startArenaFight);
    gameState.uiElements.leaveArenaBtn.addEventListener('click', leaveArena);
    gameState.uiElements.closeArenaBtn.addEventListener('click', () => {
        gameState.uiElements.arenaScreen.classList.remove('active');
    });
    
    // Dungeon screen
    gameState.uiElements.closeDungeonBtn.addEventListener('click', () => {
        gameState.uiElements.dungeonScreen.classList.remove('active');
    });
    
    // Enter arena button
    gameState.uiElements.enterArenaBtn.addEventListener('click', () => {
        gameState.uiElements.arenaScreen.classList.add('active');
        updateArenaDisplay();
    });
    
    // Enter dungeon button
    gameState.uiElements.enterDungeonBtn.addEventListener('click', () => {
        gameState.uiElements.dungeonScreen.classList.add('active');
        updateDungeonDisplay();
    });
    
    // Settings screen
    gameState.uiElements.musicToggle.addEventListener('change', (e) => {
        gameState.soundManager.setMusicEnabled(e.target.checked);
    });
    gameState.uiElements.soundToggle.addEventListener('change', (e) => {
        gameState.soundManager.setSoundEnabled(e.target.checked);
    });
    gameState.uiElements.volumeSlider.addEventListener('input', (e) => {
        gameState.soundManager.setVolume(e.target.value / 100);
    });
    gameState.uiElements.particlesToggle.addEventListener('change', (e) => {
        // Toggle particle system
        if (e.target.checked) {
            gameState.particleSystem.init(gameState.particleCanvas);
        }
    });
    gameState.uiElements.spritesToggle.addEventListener('change', (e) => {
        // Toggle sprite rendering
    });
    gameState.uiElements.saveSettingsBtn.addEventListener('click', () => {
        gameState.uiElements.settingsScreen.classList.remove('active');
    });
    gameState.uiElements.closeSettingsBtn.addEventListener('click', () => {
        gameState.uiElements.settingsScreen.classList.remove('active');
    });
    
    // Keyboard input
    window.addEventListener('keydown', (e) => {
        gameState.keys[e.code] = true;
        
        // Handle ability hotkeys
        if (e.key >= '1' && e.key <= '7') {
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
        
        // Open guild screen with G
        if (e.code === 'KeyG') {
            gameState.uiElements.guildScreen.classList.add('active');
            updateGuildDisplay();
        }
        
        // Open crafting screen with K
        if (e.code === 'KeyK') {
            gameState.uiElements.craftingScreen.classList.add('active');
            updateCraftingDisplay();
        }
        
        // Open settings with S
        if (e.code === 'KeyS' && !gameState.uiElements.chatInput.matches(':focus')) {
            gameState.uiElements.settingsScreen.classList.add('active');
        }
        
        // Fly mode with F
        if (e.code === 'KeyF' && gameState.flyLevel > 0) {
            toggleFlyMode();
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
        const rect = gameState.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / GAME_CONFIG.SCALE + gameState.camera.x;
        const mouseY = (e.clientY - rect.top) / GAME_CONFIG.SCALE + gameState.camera.y;
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
            gameState.players[data.id].isFlying = data.isFlying;
            gameState.players[data.id].isMounted = data.isMounted;
        }
    });
    
    // Handle player update
    gameState.socket.on('playerUpdate', (data) => {
        if (gameState.players[data.id]) {
            Object.assign(gameState.players[data.id], data);
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
        showAbilityEffect(data);
        gameState.soundManager.playAbilitySound(data.playerClass, data.ability);
    });
    
    // Handle guild updates
    gameState.socket.on('guildUpdate', (data) => {
        gameState.guild = data.guild;
        updateGuildDisplay();
    });
    
    // Handle guild list
    gameState.socket.on('guildList', (data) => {
        updateGuildList(data.guilds);
    });
    
    // Handle guild chat
    gameState.socket.on('guildChat', (data) => {
        addChatMessage(`[Gilde] ${data.sender}`, data.message);
    });
    
    // Handle time of day update
    gameState.socket.on('timeUpdate', (data) => {
        gameState.timeOfDay = data.time;
        updateTimeDisplay();
        gameState.soundManager.updateMusicForTimeOfDay(data.time);
    });
    
    // Handle weather update
    gameState.socket.on('weatherUpdate', (data) => {
        gameState.currentWeather = data.weather;
        updateWeatherDisplay();
        gameState.soundManager.playWeatherSound(data.weather);
        gameState.particleSystem.weather.start(data.weather);
    });
    
    // Handle dungeon updates
    gameState.socket.on('dungeonUpdate', (data) => {
        gameState.inDungeon = data.inDungeon;
        gameState.currentDungeon = data.dungeon;
        if (data.inDungeon) {
            gameState.soundManager.playBackgroundMusic('dungeon');
        } else {
            gameState.soundManager.updateMusicForTimeOfDay(gameState.timeOfDay);
        }
    });
    
    // Handle arena updates
    gameState.socket.on('arenaUpdate', (data) => {
        gameState.inArena = data.inArena;
        gameState.currentArenaOpponent = data.opponent;
        if (data.inArena) {
            gameState.soundManager.playBackgroundMusic('arena');
        } else {
            gameState.soundManager.updateMusicForTimeOfDay(gameState.timeOfDay);
        }
        updateArenaDisplay();
    });
    
    // Handle fly level update
    gameState.socket.on('flyLevelUpdate', (data) => {
        gameState.flyLevel = data.flyLevel;
        updateCharacterDisplay();
    });
    
    // Handle mount update
    gameState.socket.on('mountUpdate', (data) => {
        gameState.isMounted = data.isMounted;
        gameState.currentMount = data.mount;
        if (gameState.player) {
            gameState.player.isMounted = data.isMounted;
            gameState.player.mount = data.mount;
        }
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
    
    gameState.uiElements.loginScreen.style.display = 'none';
    gameState.uiElements.gameContainer.style.display = 'block';
    gameState.uiElements.gameContainer.classList.add('active');
    
    const playerData = {
        name: name,
        class: selectedClass,
        x: GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE,
        y: GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE,
        ...GAME_CONFIG.CLASS_STATS[selectedClass],
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        level: 1,
        exp: 0,
        gold: 0,
        flyLevel: 0,
        isFlying: false,
        isMounted: false
    };
    
    gameState.socket.emit('createPlayer', playerData);
    
    gameState.gameRunning = true;
    gameState.lastUpdateTime = Date.now();
    gameState.lastTimeUpdate = Date.now();
    gameState.lastWeatherUpdate = Date.now();
    
    gameLoop();
}

function initGameWorld() {
    updatePlayerUI();
    updateInventoryDisplay();
    updateCharacterDisplay();
    updateGuildDisplay();
    updateCraftingDisplay();
    updateDungeonDisplay();
    
    gameState.camera.x = gameState.player.x - gameState.canvas.width / 2 / GAME_CONFIG.SCALE;
    gameState.camera.y = gameState.player.y - gameState.canvas.height / 2 / GAME_CONFIG.SCALE;
    
    gameState.socket.emit('requestGameState');
    gameState.socket.emit('requestGuildList');
    
    // Start time and weather updates
    setInterval(() => {
        const now = Date.now();
        if (now - gameState.lastTimeUpdate > 30000) {
            gameState.socket.emit('requestTimeUpdate');
            gameState.lastTimeUpdate = now;
        }
        if (now - gameState.lastWeatherUpdate > 60000) {
            gameState.socket.emit('requestWeatherUpdate');
            gameState.lastWeatherUpdate = now;
        }
    }, 1000);
    
    // Start background music
    gameState.soundManager.playBackgroundMusic('day');
}

function updatePlayerUI() {
    if (!gameState.player) return;
    
    const healthPercent = (gameState.player.health / gameState.player.maxHealth) * 100;
    gameState.uiElements.healthBar.style.width = `${healthPercent}%`;
    gameState.uiElements.healthValue.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
    
    const manaPercent = (gameState.player.mana / gameState.player.maxMana) * 100;
    gameState.uiElements.manaBar.style.width = `${manaPercent}%`;
    gameState.uiElements.manaValue.textContent = `${gameState.player.mana}/${gameState.player.maxMana}`;
    
    const expPercent = (gameState.player.exp / (gameState.player.level * 100)) * 100;
    gameState.uiElements.expBar.style.width = `${expPercent}%`;
    gameState.uiElements.expValue.textContent = `${gameState.player.exp}/${gameState.player.level * 100}`;
    
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
            slot.addEventListener('click', () => useItem(i));
        } else {
            slot.className = 'inventory-slot empty';
        }
        
        gameState.uiElements.inventoryGrid.appendChild(slot);
    }
}

function updateCharacterDisplay() {
    if (!gameState.player) return;
    
    gameState.uiElements.statStrength.textContent = gameState.player.strength || 0;
    gameState.uiElements.statDexterity.textContent = gameState.player.dexterity || 0;
    gameState.uiElements.statIntelligence.textContent = gameState.player.intelligence || 0;
    gameState.uiElements.statAttack.textContent = gameState.player.attack || 0;
    gameState.uiElements.statDefense.textContent = gameState.player.defense || 0;
    gameState.uiElements.statGold.textContent = gameState.player.gold || 0;
    gameState.uiElements.statFlyLevel.textContent = gameState.flyLevel || 0;
}

function updateQuestDisplay() {
    if (!gameState.quests) return;
    gameState.uiElements.questsContainer.innerHTML = '';
    
    gameState.quests.forEach(quest => {
        const questElement = document.createElement('div');
        questElement.className = `quest ${quest.completed ? 'completed' : ''}`;
        questElement.innerHTML = `
            <div class="quest-title">${quest.name}</div>
            <div class="quest-progress">${quest.current || 0}/${quest.required || 1} ${quest.description}</div>
        `;
        gameState.uiElements.questsContainer.appendChild(questElement);
    });
}

function updateGuildDisplay() {
    if (!gameState.guild) {
        gameState.uiElements.guildIndicator.style.display = 'none';
        gameState.uiElements.guildNameDisplay.textContent = 'Keine Gilde';
        gameState.uiElements.guildMembers.textContent = '0';
        gameState.uiElements.guildRank.textContent = '-';
        gameState.uiElements.guildGold.textContent = '0';
        gameState.uiElements.leaveGuildBtn.style.display = 'none';
    } else {
        gameState.uiElements.guildIndicator.style.display = 'block';
        gameState.uiElements.guildName.textContent = `Gilde: ${gameState.guild.name}`;
        gameState.uiElements.guildNameDisplay.textContent = gameState.guild.name;
        gameState.uiElements.guildMembers.textContent = gameState.guild.members?.length || 0;
        gameState.uiElements.guildRank.textContent = gameState.guild.rank || 'Mitglied';
        gameState.uiElements.guildGold.textContent = gameState.guild.gold || 0;
        gameState.uiElements.leaveGuildBtn.style.display = 'inline-block';
    }
}

function updateGuildList(guilds) {
    gameState.uiElements.guildsContainer.innerHTML = '';
    
    guilds.forEach(guild => {
        const guildElement = document.createElement('div');
        guildElement.className = 'guild';
        guildElement.innerHTML = `
            <div class="guild-name">${guild.name} (${guild.members.length}/50)</div>
            <div class="guild-level">Level ${guild.level}</div>
            <button class="join-guild" data-id="${guild.id}">Beitreten</button>
        `;
        
        guildElement.querySelector('.join-guild').addEventListener('click', () => {
            joinGuild(guild.id);
        });
        
        gameState.uiElements.guildsContainer.appendChild(guildElement);
    });
}

function updateCraftingDisplay() {
    gameState.uiElements.craftingRecipesContainer.innerHTML = '';
    
    gameState.craftingRecipes.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'crafting-recipe';
        
        const canCraft = gameState.inventory && 
            recipe.requiredItems && 
            Object.entries(recipe.requiredItems).every(([item, count]) => {
                const itemCount = gameState.inventory.filter(i => i && i.name === item).length;
                return itemCount >= count;
            });
        
        recipeElement.innerHTML = `
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-requirements">
                ${Object.entries(recipe.requiredItems || {}).map(([item, count]) => 
                    `${count}x ${item}`
                ).join(', ')}
            </div>
            <div class="recipe-level">Benötigt Level ${recipe.requiredLevel}</div>
            <button class="craft-button" ${!canCraft ? 'disabled' : ''} data-id="${recipe.id}">
                ${canCraft ? 'Herstellen' : 'Fehlende Materialien'}
            </button>
        `;
        
        const craftButton = recipeElement.querySelector('.craft-button');
        if (canCraft) {
            craftButton.addEventListener('click', () => {
                craftItem(recipe.id);
            });
        }
        
        gameState.uiElements.craftingRecipesContainer.appendChild(recipeElement);
    });
}

function updateDungeonDisplay() {
    gameState.uiElements.dungeonListContainer.innerHTML = '';
    
    Object.entries(GAME_CONFIG.DUNGEONS).forEach(([id, dungeon]) => {
        const canEnter = gameState.player && gameState.player.level >= dungeon.minLevel;
        
        const dungeonElement = document.createElement('div');
        dungeonElement.className = 'dungeon';
        dungeonElement.innerHTML = `
            <div class="dungeon-name">${dungeon.name}</div>
            <div class="dungeon-info">Level ${dungeon.minLevel}+ | ${dungeon.boss}</div>
            <button class="enter-dungeon-btn" ${!canEnter ? 'disabled' : ''} data-id="${id}">
                ${canEnter ? 'Betreten' : `Benötigt Level ${dungeon.minLevel}`}
            </button>
        `;
        
        const enterButton = dungeonElement.querySelector('.enter-dungeon-btn');
        if (canEnter) {
            enterButton.addEventListener('click', () => {
                enterDungeon(id);
            });
        }
        
        gameState.uiElements.dungeonListContainer.appendChild(dungeonElement);
    });
}

function updateArenaDisplay() {
    if (!gameState.inArena) {
        gameState.uiElements.arenaWins.textContent = gameState.player?.arenaWins || 0;
        gameState.uiElements.arenaLosses.textContent = gameState.player?.arenaLosses || 0;
        gameState.uiElements.arenaRank.textContent = getArenaRank(gameState.player?.arenaWins || 0);
        
        // Update opponents list
        gameState.uiElements.arenaOpponentsContainer.innerHTML = '';
        
        for (const id in gameState.players) {
            if (id === gameState.socket.id) continue;
            
            const opponent = gameState.players[id];
            const opponentElement = document.createElement('div');
            opponentElement.className = 'opponent';
            opponentElement.innerHTML = `
                <div class="opponent-name">${opponent.name} (Lv. ${opponent.level})</div>
                <div class="opponent-class">${opponent.class}</div>
                <button class="challenge-btn" data-id="${id}">Herausfordern</button>
            `;
            
            opponentElement.querySelector('.challenge-btn').addEventListener('click', () => {
                challengePlayer(id);
            });
            
            gameState.uiElements.arenaOpponentsContainer.appendChild(opponentElement);
        }
    } else {
        // In arena
        if (gameState.currentArenaOpponent) {
            const opponent = gameState.players[gameState.currentArenaOpponent];
            gameState.uiElements.arenaOpponentsContainer.innerHTML = `
                <div class="arena-fight">
                    <h3>Kampf gegen ${opponent?.name || 'Unbekannt'}</h3>
                    <div class="fight-actions">
                        <button id="arena-attack">Angreifen</button>
                        <button id="arena-skill1">Fertigkeit 1</button>
                        <button id="arena-skill2">Fertigkeit 2</button>
                        <button id="arena-flee">Flüchten</button>
                    </div>
                </div>
            `;
            
            document.getElementById('arena-attack').addEventListener('click', () => {
                useArenaAbility('attack');
            });
            document.getElementById('arena-skill1').addEventListener('click', () => {
                useArenaAbility('skill1');
            });
            document.getElementById('arena-skill2').addEventListener('click', () => {
                useArenaAbility('skill2');
            });
            document.getElementById('arena-flee').addEventListener('click', leaveArena);
        }
    }
}

function updateTimeDisplay() {
    const timeIcons = {
        day: '☀️',
        dusk: '🌅',
        night: '🌙',
        dawn: '🌅'
    };
    
    const timeNames = {
        day: 'Tag',
        dusk: 'Abenddämmerung',
        night: 'Nacht',
        dawn: 'Morgengrauen'
    };
    
    gameState.uiElements.timeIcon.textContent = timeIcons[gameState.timeOfDay] || '☀️';
    gameState.uiElements.timeDisplay.textContent = timeNames[gameState.timeOfDay] || 'Tag';
}

function updateWeatherDisplay() {
    const weatherIcons = {
        sunny: '☀️',
        cloudy: '☁️',
        rain: '🌧️',
        snow: '❄️',
        fog: '🌫️'
    };
    
    const weatherNames = {
        sunny: 'Sonnig',
        cloudy: 'Bewölkt',
        rain: 'Regen',
        snow: 'Schnee',
        fog: 'Nebel'
    };
    
    gameState.uiElements.weatherIcon.textContent = weatherIcons[gameState.currentWeather] || '☀️';
    gameState.uiElements.weatherDisplay.textContent = weatherNames[gameState.currentWeather] || 'Sonnig';
}

function getArenaRank(wins) {
    if (wins >= 50) return 'Meister';
    if (wins >= 30) return 'Experte';
    if (wins >= 20) return 'Veteran';
    if (wins >= 10) return 'Kämpfer';
    if (wins >= 5) return 'Anfänger';
    return 'Neuling';
}

function sendChatMessage() {
    const message = gameState.uiElements.chatInput.value.trim();
    if (!message) return;
    
    if (message.startsWith('/g ')) {
        // Guild chat
        gameState.socket.emit('guildChat', { message: message.substring(3) });
    } else {
        // Regular chat
        gameState.socket.emit('chatMessage', { message: message });
    }
    
    addChatMessage(gameState.player.name, message);
    gameState.uiElements.chatInput.value = '';
}

function addChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `<span class="sender">${sender}:</span> ${message}`;
    
    gameState.uiElements.chatMessages.appendChild(messageElement);
    gameState.uiElements.chatMessages.scrollTop = gameState.uiElements.chatMessages.scrollHeight;
    
    while (gameState.uiElements.chatMessages.children.length > 50) {
        gameState.uiElements.chatMessages.removeChild(gameState.uiElements.chatMessages.firstChild);
    }
}

function findTarget(x, y) {
    let closestTarget = null;
    let closestDistance = Infinity;
    
    for (const id in gameState.monsters) {
        const monster = gameState.monsters[id];
        const distance = Math.sqrt(Math.pow(x - monster.x, 2) + Math.pow(y - monster.y, 2));
        if (distance < closestDistance && distance < 50) {
            closestDistance = distance;
            closestTarget = { type: 'monster', id: id, ...monster };
        }
    }
    
    for (const id in gameState.npcs) {
        const npc = gameState.npcs[id];
        const distance = Math.sqrt(Math.pow(x - npc.x, 2) + Math.pow(y - npc.y, 2));
        if (distance < closestDistance && distance < 50) {
            closestDistance = distance;
            closestTarget = { type: 'npc', id: id, ...npc };
        }
    }
    
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
    
    const abilities = ['attack', 'skill1', 'skill2', 'skill3', 'heal', 'mount', 'fly'];
    const ability = abilities[index];
    
    const now = Date.now();
    if (gameState.player.cooldowns && gameState.player.cooldowns[ability] > now) {
        return;
    }
    
    if (ability === 'mount') {
        toggleMount();
        return;
    }
    
    if (ability === 'fly') {
        toggleFlyMode();
        return;
    }
    
    gameState.socket.emit('useAbility', {
        ability: ability,
        target: gameState.currentTarget ? gameState.currentTarget.id : null
    });
    
    startCooldown(index);
    gameState.soundManager.playAbilitySound(gameState.player.class, ability);
}

function useArenaAbility(ability) {
    if (!gameState.inArena) return;
    
    gameState.socket.emit('useArenaAbility', {
        ability: ability,
        target: gameState.currentArenaOpponent
    });
    
    gameState.soundManager.playAbilitySound(gameState.player.class, ability);
}

function useItem(slotIndex) {
    if (!gameState.inventory || !gameState.inventory[slotIndex]) return;
    
    const item = gameState.inventory[slotIndex];
    
    if (item.type === 'potion') {
        gameState.socket.emit('useItem', { slot: slotIndex });
        gameState.soundManager.playSound('heal');
    }
}

function craftItem(recipeId) {
    gameState.socket.emit('craftItem', { recipeId: recipeId });
    gameState.soundManager.playSound('magic');
}

function toggleMount() {
    if (!gameState.player) return;
    
    const mountId = gameState.isMounted ? null : 'horse';
    gameState.socket.emit('toggleMount', { mountId: mountId });
    
    if (mountId) {
        gameState.soundManager.playSound('mount');
    }
}

function toggleFlyMode() {
    if (!gameState.player || gameState.flyLevel === 0) return;
    
    const isFlying = !gameState.isFlying;
    gameState.socket.emit('toggleFly', { isFlying: isFlying });
    gameState.isFlying = isFlying;
    
    if (isFlying) {
        gameState.soundManager.playSound('fly');
        gameState.particleSystem.createBurst(
            gameState.player.x, gameState.player.y, 'spark', 20
        );
    }
}

function createGuild() {
    const guildName = prompt('Geben Sie einen Namen für Ihre Gilde ein:');
    if (!guildName) return;
    
    gameState.socket.emit('createGuild', { name: guildName });
}

function joinGuild(guildId) {
    gameState.socket.emit('joinGuild', { guildId: guildId });
}

function leaveGuild() {
    if (confirm('Möchtest du die Gilde wirklich verlassen?')) {
        gameState.socket.emit('leaveGuild');
    }
}

function enterDungeon(dungeonId) {
    gameState.socket.emit('enterDungeon', { dungeonId: dungeonId });
    gameState.uiElements.dungeonScreen.classList.remove('active');
    gameState.soundManager.playSound('magic');
}

function challengePlayer(playerId) {
    gameState.socket.emit('challengePlayer', { playerId: playerId });
}

function startArenaFight() {
    if (gameState.currentArenaOpponent) {
        gameState.socket.emit('startArenaFight', { opponentId: gameState.currentArenaOpponent });
    }
}

function leaveArena() {
    gameState.socket.emit('leaveArena');
    gameState.inArena = false;
    gameState.currentArenaOpponent = null;
    updateArenaDisplay();
}

function startCooldown(index) {
    const abilities = ['attack', 'skill1', 'skill2', 'skill3', 'heal', 'mount', 'fly'];
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
    if (data.damage !== undefined) {
        gameState.particleSystem.createDamageNumber(
            data.targetId, 
            data.damage, 
            data.isHeal
        );
        gameState.soundManager.playSound(data.isHeal ? 'heal' : 'damage');
    }
    
    if (gameState.currentTarget && gameState.currentTarget.id === data.targetId) {
        updateTargetInfo();
    }
    
    if (data.targetId === gameState.socket.id) {
        updatePlayerUI();
    }
}

function showAbilityEffect(data) {
    if (!gameState.particleSystem) return;
    
    const target = gameState.players[data.playerId] || 
                  gameState.monsters[data.target] || 
                  gameState.npcs[data.target];
    
    if (!target) return;
    
    const classType = gameState.players[data.playerId]?.class || 'warrior';
    
    if (data.ability === 'attack' || data.ability === 'skill1' || data.ability === 'skill2' || data.ability === 'skill3') {
        const preset = classType === 'warrior' ? 'fire' : 
                     classType === 'mage' ? 'lightning' : 'spark';
        gameState.particleSystem.createExplosion(target.x, target.y, preset, 10);
    } else if (data.ability === 'heal') {
        gameState.particleSystem.createBurst(target.x, target.y, 'heal', 15);
    }
}

function gameLoop() {
    if (!gameState.gameRunning) return;
    
    const now = Date.now();
    const deltaTime = (now - gameState.lastUpdateTime) / 1000;
    gameState.lastUpdateTime = now;
    
    update(deltaTime);
    render();
    renderParticles(deltaTime);
    renderMinimap();
    
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    if (!gameState.player || !gameState.isConnected) return;
    
    let isMoving = false;
    let direction = gameState.player.direction || 'down';
    const speed = gameState.isFlying ? 8 : gameState.isMounted ? 6 : 2;
    
    if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) {
        gameState.player.y -= speed * (gameState.isFlying ? 1.5 : 1);
        direction = 'up';
        isMoving = true;
    }
    if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) {
        gameState.player.y += speed * (gameState.isFlying ? 1.5 : 1);
        direction = 'down';
        isMoving = true;
    }
    if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
        gameState.player.x -= speed * (gameState.isFlying ? 1.5 : 1);
        direction = 'left';
        isMoving = true;
    }
    if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
        gameState.player.x += speed * (gameState.isFlying ? 1.5 : 1);
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
    gameState.socket.emit('movePlayer', {
        x: gameState.player.x,
        y: gameState.player.y,
        direction: direction,
        isMoving: isMoving,
        isFlying: gameState.isFlying,
        isMounted: gameState.isMounted
    });
    
    gameState.player.direction = direction;
    gameState.player.isMoving = isMoving;
    
    // Create dust particles when moving
    if (isMoving && Math.random() < 0.1) {
        const x = gameState.player.x + (Math.random() - 0.5) * 10;
        const y = gameState.player.y + (Math.random() - 0.5) * 10;
        gameState.particleSystem.createExplosion(x, y, 'dust', 3);
    }
}

function render() {
    if (!gameState.ctx) return;
    
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    gameState.ctx.save();
    gameState.ctx.scale(GAME_CONFIG.SCALE, GAME_CONFIG.SCALE);
    gameState.ctx.translate(-gameState.camera.x, -gameState.camera.y);
    
    drawBackground();
    drawGameObjects();
    
    gameState.ctx.restore();
}

function renderParticles(deltaTime) {
    if (!gameState.particleSystem || !gameState.particleCtx) return;
    
    gameState.particleCtx.clearRect(0, 0, gameState.particleCanvas.width, gameState.particleCanvas.height);
    
    gameState.particleSystem.update(deltaTime);
    gameState.particleSystem.draw();
}

function drawBackground() {
    // Draw gradient background based on time of day
    let gradient, color1, color2, color3;
    
    switch (gameState.timeOfDay) {
        case 'day':
            color1 = '#1a2a3a';
            color2 = '#2a3a4a';
            color3 = '#1a2a3a';
            break;
        case 'dusk':
            color1 = '#2a1a3a';
            color2 = '#3a2a4a';
            color3 = '#2a1a3a';
            break;
        case 'night':
            color1 = '#0a0a1a';
            color2 = '#1a1a2a';
            color3 = '#0a0a1a';
            break;
        case 'dawn':
            color1 = '#2a1a3a';
            color2 = '#3a2a4a';
            color3 = '#2a1a3a';
            break;
        default:
            color1 = '#1a2a3a';
            color2 = '#2a3a4a';
            color3 = '#1a2a3a';
    }
    
    const gradient = gameState.ctx.createLinearGradient(
        gameState.camera.x, gameState.camera.y,
        gameState.camera.x + gameState.canvas.width / GAME_CONFIG.SCALE,
        gameState.camera.y + gameState.canvas.height / GAME_CONFIG.SCALE
    );
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color3);
    
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
    
    // Draw weather effects
    drawWeatherEffects();
}

function drawWeatherEffects() {
    if (!gameState.particleSystem) return;
    
    // Weather effects are handled by the particle system
    // This is just for visual representation
    if (gameState.currentWeather === 'rain') {
        // Draw rain overlay
        gameState.ctx.fillStyle = 'rgba(100, 149, 237, 0.1)';
        gameState.ctx.fillRect(
            gameState.camera.x,
            gameState.camera.y,
            gameState.canvas.width / GAME_CONFIG.SCALE,
            gameState.canvas.height / GAME_CONFIG.SCALE
        );
    } else if (gameState.currentWeather === 'snow') {
        gameState.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        gameState.ctx.fillRect(
            gameState.camera.x,
            gameState.camera.y,
            gameState.canvas.width / GAME_CONFIG.SCALE,
            gameState.canvas.height / GAME_CONFIG.SCALE
        );
    } else if (gameState.currentWeather === 'fog') {
        gameState.ctx.fillStyle = 'rgba(169, 169, 169, 0.2)';
        gameState.ctx.fillRect(
            gameState.camera.x,
            gameState.camera.y,
            gameState.canvas.width / GAME_CONFIG.SCALE,
            gameState.canvas.height / GAME_CONFIG.SCALE
        );
    }
}

function drawGameObjects() {
    // Draw dungeon entrance
    if (gameState.currentDungeon) {
        const dungeon = GAME_CONFIG.DUNGEONS[gameState.currentDungeon];
        if (dungeon) {
            drawDungeonEntrance(dungeon);
        }
    }
    
    // Draw arena entrance
    drawArenaEntrance();
    
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

function drawDungeonEntrance(dungeon) {
    const x = 80 * GAME_CONFIG.TILE_SIZE;
    const y = 80 * GAME_CONFIG.TILE_SIZE;
    
    // Draw entrance
    gameState.ctx.fillStyle = '#2F4F4F';
    gameState.ctx.fillRect(x - 16, y - 16, 32, 32);
    
    // Draw arch
    gameState.ctx.fillStyle = '#808080';
    gameState.ctx.beginPath();
    gameState.ctx.arc(x, y - 16, 16, 0, Math.PI);
    gameState.ctx.fill();
    
    // Draw name
    gameState.ctx.fillStyle = '#FFFFFF';
    gameState.ctx.font = '10px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(dungeon.name, x, y + 20);
}

function drawArenaEntrance() {
    const x = 20 * GAME_CONFIG.TILE_SIZE;
    const y = 80 * GAME_CONFIG.TILE_SIZE;
    
    // Draw entrance
    gameState.ctx.fillStyle = '#8B0000';
    gameState.ctx.fillRect(x - 16, y - 16, 32, 32);
    
    // Draw arch
    gameState.ctx.fillStyle = '#B22222';
    gameState.ctx.beginPath();
    gameState.ctx.arc(x, y - 16, 16, 0, Math.PI);
    gameState.ctx.fill();
    
    // Draw banner
    gameState.ctx.fillStyle = '#FFD700';
    gameState.ctx.fillRect(x - 8, y - 24, 16, 8);
    
    // Draw name
    gameState.ctx.fillStyle = '#FFFFFF';
    gameState.ctx.font = '10px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText('Arena', x, y + 20);
}

function drawPlayer(player) {
    const size = GAME_CONFIG.PLAYER_SIZE;
    const x = player.x - size / 2;
    const y = player.y - size / 2;
    
    // Draw mount if mounted
    if (player.isMounted && player.mount) {
        const mount = GAME_CONFIG.MOUNTS[player.mount];
        if (mount) {
            // Draw mount
            gameState.ctx.fillStyle = mount.color;
            gameState.ctx.fillRect(x - 4, y + 4, size + 8, size);
            
            // Draw player on mount
            gameState.ctx.fillStyle = GAME_CONFIG.CLASS_COLORS[player.class] || '#d4af37';
            gameState.ctx.fillRect(x + 2, y - 4, size - 4, size - 4);
        }
    } else if (player.isFlying) {
        // Draw flying player with wings
        const wingColor = GAME_CONFIG.CLASS_COLORS[player.class] || '#d4af37';
        
        // Draw wings
        gameState.ctx.fillStyle = wingColor;
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(x + size, y + size / 2);
        gameState.ctx.bezierCurveTo(
            x + size + 10, y + size / 2,
            x + size + 10, y,
            x + size, y
        );
        gameState.ctx.bezierCurveTo(
            x + size + 10, y + size,
            x + size + 10, y + size / 2,
            x + size, y + size / 2
        );
        gameState.ctx.closePath();
        gameState.ctx.fill();
        
        // Draw left wing
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(x, y + size / 2);
        gameState.ctx.bezierCurveTo(
            x - 10, y + size / 2,
            x - 10, y,
            x, y
        );
        gameState.ctx.bezierCurveTo(
            x - 10, y + size,
            x - 10, y + size / 2,
            x, y + size / 2
        );
        gameState.ctx.closePath();
        gameState.ctx.fill();
        
        // Draw player body
        gameState.ctx.fillStyle = GAME_CONFIG.CLASS_COLORS[player.class] || '#d4af37';
        gameState.ctx.fillRect(x, y, size, size);
    } else {
        // Draw player body
        gameState.ctx.fillStyle = GAME_CONFIG.CLASS_COLORS[player.class] || '#d4af37';
        gameState.ctx.fillRect(x, y, size, size);
    }
    
    // Draw direction indicator
    const directionColors = {
        up: '#44ff44',
        down: '#ff4444',
        left: '#4444ff',
        right: '#ffff44'
    };
    
    if (player.isMoving) {
        gameState.ctx.fillStyle = directionColors[player.direction] || '#ffffff';
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
    
    // Draw guild tag if in guild
    if (player.guild) {
        gameState.ctx.fillStyle = '#ffaa00';
        gameState.ctx.font = '6px Arial';
        gameState.ctx.fillText(`[${player.guild}]`, x + size / 2, y - 12);
    }
    
    // Draw health bar
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
    
    // Draw flying indicator
    if (player.isFlying) {
        gameState.ctx.fillStyle = '#ffff00';
        gameState.ctx.font = '10px Arial';
        gameState.ctx.fillText('✈', x + size / 2, y - 18);
    }
}

function drawNPC(npc) {
    const size = GAME_CONFIG.NPC_SIZE;
    const x = npc.x - size / 2;
    const y = npc.y - size / 2;
    
    gameState.ctx.fillStyle = '#448844';
    gameState.ctx.fillRect(x, y, size, size);
    
    gameState.ctx.fillStyle = '#ffffff';
    gameState.ctx.font = '8px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(npc.name, x + size / 2, y - 5);
    
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
    
    gameState.ctx.fillStyle = monster.color || '#880000';
    gameState.ctx.fillRect(x, y, size, size);
    
    gameState.ctx.fillStyle = '#ff0000';
    gameState.ctx.font = '8px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(monster.name, x + size / 2, y - 5);
    
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
    
    gameState.ctx.fillStyle = item.color || '#ffff00';
    gameState.ctx.fillRect(x, y, size, size);
    
    gameState.ctx.fillStyle = '#000000';
    gameState.ctx.font = '6px Arial';
    gameState.ctx.textAlign = 'center';
    gameState.ctx.fillText(item.icon || '?', x + size / 2, y + size / 2 + 2);
}

function renderMinimap() {
    if (!gameState.minimapCtx) return;
    
    gameState.minimapCtx.clearRect(0, 0, gameState.minimapCanvas.width, gameState.minimapCanvas.height);
    
    gameState.minimapCtx.fillStyle = '#0a0a1a';
    gameState.minimapCtx.fillRect(0, 0, gameState.minimapCanvas.width, gameState.minimapCanvas.height);
    
    const scaleX = gameState.minimapCanvas.width / (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE);
    const scaleY = gameState.minimapCanvas.height / (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE);
    
    // Draw dungeon entrance
    if (gameState.currentDungeon) {
        const dungeon = GAME_CONFIG.DUNGEONS[gameState.currentDungeon];
        if (dungeon) {
            gameState.minimapCtx.fillStyle = '#d4af37';
            gameState.minimapCtx.beginPath();
            gameState.minimapCtx.arc(
                80 * GAME_CONFIG.TILE_SIZE * scaleX,
                80 * GAME_CONFIG.TILE_SIZE * scaleY,
                5,
                0,
                Math.PI * 2
            );
            gameState.minimapCtx.fill();
        }
    }
    
    // Draw arena entrance
    gameState.minimapCtx.fillStyle = '#ff4444';
    gameState.minimapCtx.beginPath();
    gameState.minimapCtx.arc(
        20 * GAME_CONFIG.TILE_SIZE * scaleX,
        80 * GAME_CONFIG.TILE_SIZE * scaleY,
        5,
        0,
        Math.PI * 2
    );
    gameState.minimapCtx.fill();
    
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
    if (gameState.soundManager) {
        gameState.soundManager.cleanup();
    }
});
