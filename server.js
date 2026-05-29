// AION Browser MMO - Enhanced Server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Game Configuration
const GAME_CONFIG = {
    MAP_WIDTH: 100,
    MAP_HEIGHT: 100,
    TILE_SIZE: 32,
    MAX_PLAYERS: 50,
    SPAWN_AREA: { x: 45, y: 45, radius: 10 },
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
    ABILITY_EFFECTS: {
        warrior: {
            attack: { damage: 20, manaCost: 0 },
            skill1: { name: 'Mächtiger Schlag', damage: 35, manaCost: 10 },
            skill2: { name: 'Schutzschild', damage: 0, defenseBoost: 10, manaCost: 15 },
            skill3: { name: 'Erdbeben', damage: 40, area: true, manaCost: 25 },
            heal: { name: 'Heilen', heal: 25, manaCost: 15 }
        },
        mage: {
            attack: { damage: 10, manaCost: 0 },
            skill1: { name: 'Feuerball', damage: 30, manaCost: 15 },
            skill2: { name: 'Eisblitz', damage: 25, slow: true, manaCost: 20 },
            skill3: { name: 'Blitzschlag', damage: 45, manaCost: 30 },
            heal: { name: 'Heilzauber', heal: 20, manaCost: 10 }
        },
        archer: {
            attack: { damage: 15, manaCost: 0 },
            skill1: { name: 'Doppelschuss', damage: 25, multiTarget: true, manaCost: 10 },
            skill2: { name: 'Giftpfeil', damage: 10, poison: 5, manaCost: 15 },
            skill3: { name: 'Scharfschuss', damage: 50, manaCost: 25 },
            heal: { name: 'Erste Hilfe', heal: 15, manaCost: 10 }
        }
    },
    MOUNTS: {
        horse: { name: 'Pferd', speed: 8, fly: false, icon: '🐴', color: '#8B4513' },
        dragon: { name: 'Drache', speed: 10, fly: true, icon: '🐉', color: '#FF4500' },
        phoenix: { name: 'Phönix', speed: 12, fly: true, icon: '🔥', color: '#FFD700' },
        griffin: { name: 'Greif', speed: 9, fly: true, icon: '🦅', color: '#DAA520' }
    },
    DUNGEONS: {
        goblin_cave: {
            name: 'Goblin-Höhle',
            minLevel: 1,
            monsters: ['Goblin', 'Goblin', 'Ork'],
            boss: { name: 'Goblin King', health: 100, attack: 25, defense: 10, exp: 200, gold: 100 },
            reward: { exp: 500, gold: 200, item: { name: 'Goblin Sword', type: 'weapon', attack: 10 } },
            mapSize: { width: 50, height: 50 }
        },
        ork_fortress: {
            name: 'Ork-Festung',
            minLevel: 5,
            monsters: ['Ork', 'Ork', 'Ork', 'Wolf'],
            boss: { name: 'Ork Warlord', health: 150, attack: 35, defense: 15, exp: 400, gold: 300 },
            reward: { exp: 1000, gold: 500, item: { name: 'Ork Armor', type: 'armor', defense: 10 } },
            mapSize: { width: 60, height: 60 }
        },
        undead_tomb: {
            name: 'Verlassene Gruft',
            minLevel: 10,
            monsters: ['Skelett', 'Skelett', 'Skelett', 'Zombie'],
            boss: { name: 'Death Knight', health: 200, attack: 45, defense: 20, exp: 600, gold: 500 },
            reward: { exp: 1500, gold: 800, item: { name: 'Soul Stone', type: 'quest', value: 1 } },
            mapSize: { width: 70, height: 70 }
        }
    },
    WEATHER_TYPES: ['sunny', 'cloudy', 'rain', 'snow', 'fog'],
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
        requiredLevel: 1
    },
    {
        id: 'mana_potion',
        name: 'Manatrank',
        type: 'potion',
        effect: 'mana',
        value: 50,
        requiredItems: { 'Mana Herb': 3, 'Water': 1 },
        requiredLevel: 1
    },
    {
        id: 'sword',
        name: 'Eisenschwert',
        type: 'weapon',
        attack: 10,
        requiredItems: { 'Iron': 5, 'Wood': 2 },
        requiredLevel: 3
    },
    {
        id: 'shield',
        name: 'Eisenschild',
        type: 'armor',
        defense: 8,
        requiredItems: { 'Iron': 8, 'Wood': 3 },
        requiredLevel: 3
    },
    {
        id: 'bow',
        name: 'Langbogen',
        type: 'weapon',
        attack: 12,
        requiredItems: { 'Wood': 10, 'String': 1 },
        requiredLevel: 5
    }
];

// Game State
const gameState = {
    players: {},
    npcs: {},
    monsters: {},
    items: {},
    quests: [],
    guilds: {},
    dungeons: {},
    arena: {
        players: [],
        fights: []
    },
    timeOfDay: 'day',
    currentWeather: 'sunny',
    lastMonsterSpawn: 0,
    lastItemSpawn: 0,
    lastTimeUpdate: 0,
    lastWeatherUpdate: 0,
    lastDungeonSpawn: 0
};

// Initialize the game world
function initGameWorld() {
    createNPCs();
    createMonsters();
    createItems();
    createQuests();
    createDungeons();
    
    // Start game loop
    setInterval(gameLoop, 1000 / 30);
    
    // Start time and weather updates
    setInterval(updateTimeAndWeather, 30000);
}

// Create NPCs
function createNPCs() {
    const npcPositions = [
        { x: 50, y: 50, name: 'Questgeber', type: 'quest', hasQuest: true },
        { x: 60, y: 50, name: 'Händler', type: 'merchant' },
        { x: 50, y: 60, name: 'Schmied', type: 'blacksmith' },
        { x: 40, y: 50, name: 'Heiler', type: 'healer' },
        { x: 55, y: 55, name: 'Gildenmeister', type: 'guildmaster' },
        { x: 45, y: 55, name: 'Handwerker', type: 'craftsman' }
    ];
    
    npcPositions.forEach((npc, index) => {
        gameState.npcs[`npc_${index}`] = {
            id: `npc_${index}`,
            x: npc.x * GAME_CONFIG.TILE_SIZE,
            y: npc.y * GAME_CONFIG.TILE_SIZE,
            name: npc.name,
            type: npc.type,
            hasQuest: npc.hasQuest || false,
            dialog: getNPCDialog(npc.type)
        };
    });
}

// Create initial monsters
function createMonsters() {
    const monsterTypes = [
        { name: 'Goblin', health: 30, attack: 8, defense: 2, exp: 20, gold: 5, color: '#8B4513' },
        { name: 'Ork', health: 50, attack: 12, defense: 5, exp: 35, gold: 10, color: '#228B22' },
        { name: 'Skelett', health: 40, attack: 10, defense: 3, exp: 25, gold: 8, color: '#FFFFFF' },
        { name: 'Wolf', health: 35, attack: 10, defense: 2, exp: 25, gold: 6, color: '#808080' },
        { name: 'Zombie', health: 45, attack: 12, defense: 3, exp: 30, gold: 10, color: '#228B22' }
    ];
    
    for (let i = 0; i < 30; i++) {
        const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
        const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH) * GAME_CONFIG.TILE_SIZE;
        const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT) * GAME_CONFIG.TILE_SIZE;
        
        const distanceToSpawn = Math.sqrt(
            Math.pow(x - GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE, 2) +
            Math.pow(y - GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE, 2)
        );
        
        if (distanceToSpawn > GAME_CONFIG.SPAWN_AREA.radius * GAME_CONFIG.TILE_SIZE) {
            gameState.monsters[`monster_${i}`] = {
                id: `monster_${i}`,
                x: x,
                y: y,
                name: monsterType.name,
                type: 'monster',
                health: monsterType.health,
                maxHealth: monsterType.health,
                attack: monsterType.attack,
                defense: monsterType.defense,
                exp: monsterType.exp,
                gold: monsterType.gold,
                color: monsterType.color,
                speed: 1 + Math.random() * 0.5,
                target: null
            };
        }
    }
}

// Create initial items
function createItems() {
    const itemTypes = [
        { name: 'Heiltrank', type: 'potion', effect: 'heal', value: 25, color: '#FF4444', icon: '❤' },
        { name: 'Manatrank', type: 'potion', effect: 'mana', value: 25, color: '#4444FF', icon: '⚡' },
        { name: 'Gold', type: 'currency', value: 10, color: '#FFD700', icon: '💰' },
        { name: 'Schwert', type: 'weapon', attack: 5, color: '#C0C0C0', icon: '⚔' },
        { name: 'Schild', type: 'armor', defense: 5, color: '#8B4513', icon: '🛡' },
        { name: 'Herb', type: 'material', color: '#228B22', icon: '🌿' },
        { name: 'Mana Herb', type: 'material', color: '#483D8B', icon: '🌿' },
        { name: 'Iron', type: 'material', color: '#C0C0C0', icon: '⚒' },
        { name: 'Wood', type: 'material', color: '#8B4513', icon: '🪵' },
        { name: 'String', type: 'material', color: '#F5F5DC', icon: '🧶' },
        { name: 'Water', type: 'material', color: '#1E90FF', icon: '💧' }
    ];
    
    for (let i = 0; i < 50; i++) {
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH) * GAME_CONFIG.TILE_SIZE;
        const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT) * GAME_CONFIG.TILE_SIZE;
        
        gameState.items[`item_${i}`] = {
            id: `item_${i}`,
            x: x,
            y: y,
            name: itemType.name,
            type: itemType.type,
            effect: itemType.effect,
            value: itemType.value,
            color: itemType.color,
            icon: itemType.icon,
            attack: itemType.attack || 0,
            defense: itemType.defense || 0
        };
    }
}

// Create quests
function createQuests() {
    gameState.quests = [
        {
            id: 'quest_0',
            name: 'Goblins vertreiben',
            description: 'Töte 10 Goblins',
            type: 'kill',
            target: 'Goblin',
            required: 10,
            current: 0,
            reward: { exp: 100, gold: 50 },
            completed: false
        },
        {
            id: 'quest_1',
            name: 'Sammler',
            description: 'Sammle 5 Heiltränke',
            type: 'collect',
            target: 'Heiltrank',
            required: 5,
            current: 0,
            reward: { exp: 80, gold: 40 },
            completed: false
        },
        {
            id: 'quest_2',
            name: 'Erkundung',
            description: 'Besuche alle Ecken der Karte',
            type: 'explore',
            locations: [
                { x: 0, y: 0 },
                { x: GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE, y: 0 },
                { x: GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE, y: GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE },
                { x: 0, y: GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE }
            ],
            visited: [],
            required: 4,
            current: 0,
            reward: { exp: 150, gold: 100 },
            completed: false
        },
        {
            id: 'quest_3',
            name: 'Gildenmission',
            description: 'Tritt einer Gilde bei',
            type: 'guild',
            target: null,
            required: 1,
            current: 0,
            reward: { exp: 200, gold: 100 },
            completed: false
        }
    ];
}

// Create dungeons
function createDungeons() {
    Object.entries(GAME_CONFIG.DUNGEONS).forEach(([id, dungeon]) => {
        gameState.dungeons[id] = {
            ...dungeon,
            id: id,
            players: [],
            monsters: [],
            items: [],
            active: false
        };
    });
}

// Get NPC dialog
function getNPCDialog(type) {
    const dialogs = {
        quest: [
            'Ah, ein neuer Abenteurer! Ich habe eine Aufgabe für dich...',
            'Die Goblins in der Nähe machen uns zu schaffen. Könntest du 10 von ihnen vertreiben?',
            'Bist du bereit für eine Herausforderung?'
        ],
        merchant: [
            'Willkommen in meinem Laden! Ich habe viele nützliche Gegenstände.',
            'Schau dich um, vielleicht findest du etwas, das dir hilft.',
            'Gold ist immer willkommen!'
        ],
        blacksmith: [
            'Meine Waffen und Rüstungen sind die besten in der Region!',
            'Ein guter Krieger braucht gute Ausrüstung.',
            'Was kann ich für dich tun?'
        ],
        healer: [
            'Die Götter segnen dich, Reisender.',
            'Wenn du verletzt bist, kann ich dir helfen.',
            'Mögest du sicher reisen.'
        ],
        guildmaster: [
            'Willkommen im Gildenhaus! Möchtest du einer Gilde beitreten?',
            'Gilden bieten viele Vorteile für ihre Mitglieder.',
            'Du kannst auch deine eigene Gilde gründen!' 
        ],
        craftsman: [
            'Ich bin der Handwerker. Ich kann dir helfen, neue Gegenstände herzustellen.',
            'Bring mir die richtigen Materialien und ich fertige dir was du brauchst.',
            'Schau dir meine Rezepte an!' 
        ]
    };
    
    return dialogs[type] || ['Hallo, wie kann ich dir helfen?'];
}

// Game loop
function gameLoop() {
    // Spawn new monsters if needed
    if (Date.now() - gameState.lastMonsterSpawn > 30000) {
        spawnMonster();
        gameState.lastMonsterSpawn = Date.now();
    }
    
    // Spawn new items if needed
    if (Date.now() - gameState.lastItemSpawn > 60000) {
        spawnItem();
        gameState.lastItemSpawn = Date.now();
    }
    
    // Update monsters (AI)
    updateMonsters();
    
    // Update dungeons
    updateDungeons();
    
    // Update arena
    updateArena();
    
    // Broadcast game state to all clients
    broadcastGameState();
}

// Update time and weather
function updateTimeAndWeather() {
    const now = Date.now();
    
    // Update time of day (every 5 minutes)
    if (now - gameState.lastTimeUpdate > 300000) {
        const timeIndex = (GAME_CONFIG.TIME_OF_DAY.indexOf(gameState.timeOfDay) + 1) % GAME_CONFIG.TIME_OF_DAY.length;
        gameState.timeOfDay = GAME_CONFIG.TIME_OF_DAY[timeIndex];
        gameState.lastTimeUpdate = now;
        
        // Broadcast time update
        io.emit('timeUpdate', { time: gameState.timeOfDay });
    }
    
    // Update weather (every 10 minutes)
    if (now - gameState.lastWeatherUpdate > 600000) {
        const weatherIndex = Math.floor(Math.random() * GAME_CONFIG.WEATHER_TYPES.length);
        gameState.currentWeather = GAME_CONFIG.WEATHER_TYPES[weatherIndex];
        gameState.lastWeatherUpdate = now;
        
        // Broadcast weather update
        io.emit('weatherUpdate', { weather: gameState.currentWeather });
    }
}

// Spawn a new monster
function spawnMonster() {
    const monsterTypes = [
        { name: 'Goblin', health: 30, attack: 8, defense: 2, exp: 20, gold: 5, color: '#8B4513' },
        { name: 'Ork', health: 50, attack: 12, defense: 5, exp: 35, gold: 10, color: '#228B22' },
        { name: 'Skelett', health: 40, attack: 10, defense: 3, exp: 25, gold: 8, color: '#FFFFFF' },
        { name: 'Wolf', health: 35, attack: 10, defense: 2, exp: 25, gold: 6, color: '#808080' },
        { name: 'Zombie', health: 45, attack: 12, defense: 3, exp: 30, gold: 10, color: '#228B22' }
    ];
    
    const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH) * GAME_CONFIG.TILE_SIZE;
    const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT) * GAME_CONFIG.TILE_SIZE;
    
    const distanceToSpawn = Math.sqrt(
        Math.pow(x - GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE, 2) +
        Math.pow(y - GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE, 2)
    );
    
    if (distanceToSpawn > GAME_CONFIG.SPAWN_AREA.radius * GAME_CONFIG.TILE_SIZE) {
        const id = `monster_${Date.now()}`;
        gameState.monsters[id] = {
            id: id,
            x: x,
            y: y,
            name: monsterType.name,
            type: 'monster',
            health: monsterType.health,
            maxHealth: monsterType.health,
            attack: monsterType.attack,
            defense: monsterType.defense,
            exp: monsterType.exp,
            gold: monsterType.gold,
            color: monsterType.color,
            speed: 1 + Math.random() * 0.5,
            target: null
        };
    }
}

// Spawn a new item
function spawnItem() {
    const itemTypes = [
        { name: 'Heiltrank', type: 'potion', effect: 'heal', value: 25, color: '#FF4444', icon: '❤' },
        { name: 'Manatrank', type: 'potion', effect: 'mana', value: 25, color: '#4444FF', icon: '⚡' },
        { name: 'Gold', type: 'currency', value: 10, color: '#FFD700', icon: '💰' },
        { name: 'Schwert', type: 'weapon', attack: 5, color: '#C0C0C0', icon: '⚔' },
        { name: 'Schild', type: 'armor', defense: 5, color: '#8B4513', icon: '🛡' },
        { name: 'Herb', type: 'material', color: '#228B22', icon: '🌿' },
        { name: 'Mana Herb', type: 'material', color: '#483D8B', icon: '🌿' },
        { name: 'Iron', type: 'material', color: '#C0C0C0', icon: '⚒' },
        { name: 'Wood', type: 'material', color: '#8B4513', icon: '🪵' },
        { name: 'String', type: 'material', color: '#F5F5DC', icon: '🧶' },
        { name: 'Water', type: 'material', color: '#1E90FF', icon: '💧' }
    ];
    
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH) * GAME_CONFIG.TILE_SIZE;
    const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT) * GAME_CONFIG.TILE_SIZE;
    
    const id = `item_${Date.now()}`;
    gameState.items[id] = {
        id: id,
        x: x,
        y: y,
        name: itemType.name,
        type: itemType.type,
        effect: itemType.effect,
        value: itemType.value,
        color: itemType.color,
        icon: itemType.icon,
        attack: itemType.attack || 0,
        defense: itemType.defense || 0
    };
}

// Update monster AI
function updateMonsters() {
    for (const id in gameState.monsters) {
        const monster = gameState.monsters[id];
        
        let nearestPlayer = null;
        let nearestDistance = Infinity;
        
        for (const playerId in gameState.players) {
            const player = gameState.players[playerId];
            const distance = Math.sqrt(
                Math.pow(player.x - monster.x, 2) +
                Math.pow(player.y - monster.y, 2)
            );
            
            if (distance < nearestDistance && distance < 200) {
                nearestDistance = distance;
                nearestPlayer = player;
            }
        }
        
        if (nearestPlayer) {
            const angle = Math.atan2(
                nearestPlayer.y - monster.y,
                nearestPlayer.x - monster.x
            );
            
            monster.x += Math.cos(angle) * monster.speed;
            monster.y += Math.sin(angle) * monster.speed;
            
            if (nearestDistance < 20) {
                attackPlayer(monster, nearestPlayer);
            }
        } else {
            if (Math.random() < 0.01) {
                monster.x += (Math.random() - 0.5) * 10;
                monster.y += (Math.random() - 0.5) * 10;
            }
        }
    }
}

// Update dungeons
function updateDungeons() {
    for (const dungeonId in gameState.dungeons) {
        const dungeon = gameState.dungeons[dungeonId];
        
        if (!dungeon.active) continue;
        
        // Spawn dungeon monsters if needed
        if (dungeon.monsters.length < 10 && Date.now() - dungeon.lastSpawn > 10000) {
            spawnDungeonMonster(dungeonId);
            dungeon.lastSpawn = Date.now();
        }
        
        // Update dungeon monsters
        for (let i = dungeon.monsters.length - 1; i >= 0; i--) {
            const monster = dungeon.monsters[i];
            
            // Find nearest player in dungeon
            let nearestPlayer = null;
            let nearestDistance = Infinity;
            
            for (const playerId of dungeon.players) {
                const player = gameState.players[playerId];
                if (!player) continue;
                
                const distance = Math.sqrt(
                    Math.pow(player.x - monster.x, 2) +
                    Math.pow(player.y - monster.y, 2)
                );
                
                if (distance < nearestDistance && distance < 150) {
                    nearestDistance = distance;
                    nearestPlayer = player;
                }
            }
            
            if (nearestPlayer) {
                const angle = Math.atan2(
                    nearestPlayer.y - monster.y,
                    nearestPlayer.x - monster.x
                );
                
                monster.x += Math.cos(angle) * monster.speed * 0.5;
                monster.y += Math.sin(angle) * monster.speed * 0.5;
                
                if (nearestDistance < 15) {
                    attackDungeonPlayer(monster, nearestPlayer, dungeonId);
                }
            } else {
                if (Math.random() < 0.01) {
                    monster.x += (Math.random() - 0.5) * 5;
                    monster.y += (Math.random() - 0.5) * 5;
                }
            }
        }
    }
}

// Spawn dungeon monster
function spawnDungeonMonster(dungeonId) {
    const dungeon = gameState.dungeons[dungeonId];
    if (!dungeon) return;
    
    const monsterTypes = dungeon.monsters.map(name => {
        const monster = { name: 'Goblin', health: 30, attack: 8, defense: 2, exp: 20, gold: 5, color: '#8B4513' };
        if (name === 'Ork') monster.name = name; monster.health = 50; monster.attack = 12; monster.defense = 5; monster.exp = 35; monster.gold = 10; monster.color = '#228B22';
        if (name === 'Skelett') monster.name = name; monster.health = 40; monster.attack = 10; monster.defense = 3; monster.exp = 25; monster.gold = 8; monster.color = '#FFFFFF';
        if (name === 'Wolf') monster.name = name; monster.health = 35; monster.attack = 10; monster.defense = 2; monster.exp = 25; monster.gold = 6; monster.color = '#808080';
        if (name === 'Zombie') monster.name = name; monster.health = 45; monster.attack = 12; monster.defense = 3; monster.exp = 30; monster.gold = 10; monster.color = '#228B22';
        return monster;
    });
    
    const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const x = Math.floor(Math.random() * dungeon.mapSize.width) * GAME_CONFIG.TILE_SIZE;
    const y = Math.floor(Math.random() * dungeon.mapSize.height) * GAME_CONFIG.TILE_SIZE;
    
    const monster = {
        id: `dungeon_monster_${dungeonId}_${Date.now()}`,
        x: x,
        y: y,
        name: monsterType.name,
        type: 'monster',
        health: monsterType.health,
        maxHealth: monsterType.health,
        attack: monsterType.attack,
        defense: monsterType.defense,
        exp: monsterType.exp,
        gold: monsterType.gold,
        color: monsterType.color,
        speed: 1 + Math.random() * 0.5
    };
    
    dungeon.monsters.push(monster);
}

// Attack dungeon player
function attackDungeonPlayer(attacker, target, dungeonId) {
    if (!gameState.players[target.id]) return;
    
    const damage = Math.max(1, attacker.attack - (target.defense || 0));
    gameState.players[target.id].health -= damage;
    
    if (gameState.players[target.id].health <= 0) {
        gameState.players[target.id].health = gameState.players[target.id].maxHealth;
        gameState.players[target.id].x = GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE;
        gameState.players[target.id].y = GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE;
        leaveDungeon(target.id, dungeonId);
    }
    
    io.to(target.id).emit('combatResult', {
        attackerId: attacker.id,
        attackerName: attacker.name,
        targetId: target.id,
        damage: damage
    });
}

// Update arena
function updateArena() {
    for (let i = gameState.arena.fights.length - 1; i >= 0; i--) {
        const fight = gameState.arena.fights[i];
        
        // Check if fight is still active
        const player1 = gameState.players[fight.player1];
        const player2 = gameState.players[fight.player2];
        
        if (!player1 || !player2 || !player1.inArena || !player2.inArena) {
            gameState.arena.fights.splice(i, 1);
            continue;
        }
        
        // Check for timeout (5 minutes)
        if (Date.now() - fight.startTime > 300000) {
            // Draw - both players lose
            endArenaFight(fight.player1, fight.player2, 'timeout');
            gameState.arena.fights.splice(i, 1);
            continue;
        }
    }
}

// Attack a player
function attackPlayer(attacker, target) {
    if (!gameState.players[target.id]) return;
    
    const damage = Math.max(1, attacker.attack - (target.defense || 0));
    gameState.players[target.id].health -= damage;
    
    if (gameState.players[target.id].health <= 0) {
        gameState.players[target.id].health = gameState.players[target.id].maxHealth;
        gameState.players[target.id].x = GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE;
        gameState.players[target.id].y = GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE;
    }
    
    io.to(target.id).emit('combatResult', {
        attackerId: attacker.id,
        attackerName: attacker.name,
        targetId: target.id,
        damage: damage
    });
}

// Broadcast game state
function broadcastGameState() {
    io.emit('npcsUpdate', gameState.npcs);
    io.emit('monstersUpdate', gameState.monsters);
    io.emit('itemsUpdate', gameState.items);
    io.emit('questsUpdate', gameState.quests);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle player creation
    socket.on('createPlayer', (playerData) => {
        const player = {
            id: socket.id,
            name: playerData.name,
            class: playerData.class,
            x: GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE,
            y: GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE,
            direction: 'down',
            isMoving: false,
            isFlying: false,
            isMounted: false,
            mount: null,
            ...GAME_CONFIG.CLASS_STATS[playerData.class],
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            level: 1,
            exp: 0,
            gold: 0,
            flyLevel: 0,
            inventory: new Array(40).fill(null),
            cooldowns: {},
            quests: [],
            guild: null,
            arenaWins: 0,
            arenaLosses: 0,
            inArena: false,
            inDungeon: null
        };
        
        gameState.players[socket.id] = player;
        socket.emit('playerJoined', player);
        
        const otherPlayers = {};
        for (const id in gameState.players) {
            if (id !== socket.id) {
                otherPlayers[id] = gameState.players[id];
            }
        }
        socket.emit('playersUpdate', otherPlayers);
        socket.emit('npcsUpdate', gameState.npcs);
        socket.emit('monstersUpdate', gameState.monsters);
        socket.emit('itemsUpdate', gameState.items);
        socket.emit('questsUpdate', gameState.quests);
        socket.emit('inventoryUpdate', player.inventory);
        socket.emit('timeUpdate', { time: gameState.timeOfDay });
        socket.emit('weatherUpdate', { weather: gameState.currentWeather });
        socket.emit('flyLevelUpdate', { flyLevel: player.flyLevel });
        
        socket.broadcast.emit('playerJoined', player);
    });
    
    // Handle player movement
    socket.on('movePlayer', (data) => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].x = data.x;
            gameState.players[socket.id].y = data.y;
            gameState.players[socket.id].direction = data.direction;
            gameState.players[socket.id].isMoving = data.isMoving;
            gameState.players[socket.id].isFlying = data.isFlying || false;
            gameState.players[socket.id].isMounted = data.isMounted || false;
            
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y,
                direction: data.direction,
                isMoving: data.isMoving,
                isFlying: data.isFlying || false,
                isMounted: data.isMounted || false
            });
        }
    });
    
    // Handle chat messages
    socket.on('chatMessage', (data) => {
        const player = gameState.players[socket.id];
        if (player) {
            io.emit('chatMessage', {
                sender: player.name,
                message: data.message
            });
        }
    });
    
    // Handle guild chat
    socket.on('guildChat', (data) => {
        const player = gameState.players[socket.id];
        if (player && player.guild) {
            const guild = gameState.guilds[player.guild];
            if (guild) {
                for (const memberId of guild.members) {
                    if (gameState.players[memberId]) {
                        io.to(memberId).emit('guildChat', {
                            sender: player.name,
                            message: data.message
                        });
                    }
                }
            }
        }
    });
    
    // Handle ability use
    socket.on('useAbility', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const ability = GAME_CONFIG.ABILITY_EFFECTS[player.class][data.ability];
        if (!ability) return;
        
        if (player.cooldowns && player.cooldowns[data.ability] > Date.now()) return;
        if (ability.manaCost && player.mana < ability.manaCost) {
            socket.emit('combatResult', { message: 'Nicht genug Mana!' });
            return;
        }
        
        if (ability.manaCost) {
            player.mana -= ability.manaCost;
            socket.emit('playerUpdate', { mana: player.mana });
        }
        
        player.cooldowns = player.cooldowns || {};
        player.cooldowns[data.ability] = Date.now() + GAME_CONFIG.ABILITY_COOLDOWNS[data.ability];
        socket.emit('playerUpdate', { cooldowns: player.cooldowns });
        
        io.emit('abilityUsed', {
            playerId: socket.id,
            playerName: player.name,
            playerClass: player.class,
            ability: data.ability,
            target: data.target
        });
        
        if (data.target) {
            let target = null;
            if (gameState.players[data.target]) {
                target = gameState.players[data.target];
            } else if (gameState.monsters[data.target]) {
                target = gameState.monsters[data.target];
            }
            
            if (target) {
                handleAbilityEffect(player, target, ability, data.ability, socket);
            }
        }
    });
    
    // Handle arena ability use
    socket.on('useArenaAbility', (data) => {
        const player = gameState.players[socket.id];
        if (!player || !player.inArena) return;
        
        // Find the fight
        const fight = gameState.arena.fights.find(f => 
            f.player1 === socket.id || f.player2 === socket.id
        );
        
        if (!fight) return;
        
        const opponentId = fight.player1 === socket.id ? fight.player2 : fight.player1;
        const opponent = gameState.players[opponentId];
        if (!opponent) return;
        
        const ability = GAME_CONFIG.ABILITY_EFFECTS[player.class][data.ability];
        if (!ability) return;
        
        if (player.cooldowns && player.cooldowns[data.ability] > Date.now()) return;
        if (ability.manaCost && player.mana < ability.manaCost) {
            socket.emit('combatResult', { message: 'Nicht genug Mana!' });
            return;
        }
        
        if (ability.manaCost) {
            player.mana -= ability.manaCost;
            socket.emit('playerUpdate', { mana: player.mana });
        }
        
        player.cooldowns = player.cooldowns || {};
        player.cooldowns[data.ability] = Date.now() + GAME_CONFIG.ABILITY_COOLDOWNS[data.ability];
        socket.emit('playerUpdate', { cooldowns: player.cooldowns });
        
        // Handle ability effect
        const damage = Math.max(1, (ability.damage || 0) - (opponent.defense || 0));
        opponent.health -= damage;
        
        socket.emit('combatResult', {
            attackerId: player.id,
            attackerName: player.name,
            targetId: opponent.id,
            targetName: opponent.name,
            damage: damage
        });
        
        io.to(opponentId).emit('combatResult', {
            attackerId: player.id,
            attackerName: player.name,
            targetId: opponent.id,
            damage: damage
        });
        
        // Check if opponent died
        if (opponent.health <= 0) {
            endArenaFight(socket.id, opponentId, 'win');
        }
        
        // Check if player died
        if (player.health <= 0) {
            endArenaFight(socket.id, opponentId, 'lose');
        }
    });
    
    // Handle ability effects
    function handleAbilityEffect(attacker, target, ability, abilityName, socket) {
        let damage = ability.damage || 0;
        if (damage > 0) {
            damage = Math.max(1, damage - (target.defense || 0));
            target.health -= damage;
            
            if (target.health <= 0) {
                if (target.type === 'monster') {
                    attacker.exp += target.exp;
                    attacker.gold += target.gold;
                    
                    if (attacker.exp >= attacker.level * 100) {
                        attacker.level++;
                        attacker.exp = 0;
                        attacker.maxHealth += 10;
                        attacker.health = attacker.maxHealth;
                        attacker.maxMana += 5;
                        attacker.mana = attacker.maxMana;
                    }
                    
                    delete gameState.monsters[target.id];
                    updateQuestProgress(attacker, 'kill', target.name);
                } else if (target.type === 'player' && attacker.inArena) {
                    // Arena fight - don't delete player, just check for win
                    if (target.health <= 0) {
                        endArenaFight(attacker.id, target.id, 'win');
                    }
                }
            }
            
            socket.emit('combatResult', {
                attackerId: attacker.id,
                attackerName: attacker.name,
                targetId: target.id,
                targetName: target.name,
                damage: damage
            });
            
            if (target.type !== 'player') {
                io.to(target.id).emit('combatResult', {
                    attackerId: attacker.id,
                    attackerName: attacker.name,
                    targetId: target.id,
                    damage: damage
                });
            }
        } else if (ability.heal) {
            const healAmount = ability.heal;
            if (target.health + healAmount > target.maxHealth) {
                target.health = target.maxHealth;
            } else {
                target.health += healAmount;
            }
            
            socket.emit('combatResult', {
                message: `Heilung: +${healAmount} HP`
            });
        }
        
        if (target.type === 'player') {
            io.to(target.id).emit('playerUpdate', {
                health: target.health,
                mana: target.mana
            });
        } else if (target.type === 'monster') {
            io.emit('monstersUpdate', gameState.monsters);
        }
        
        socket.emit('playerUpdate', {
            health: attacker.health,
            mana: attacker.mana,
            exp: attacker.exp,
            level: attacker.level,
            gold: attacker.gold
        });
    }
    
    // End arena fight
    function endArenaFight(winnerId, loserId, result) {
        const winner = gameState.players[winnerId];
        const loser = gameState.players[loserId];
        
        if (!winner || !loser) return;
        
        winner.inArena = false;
        loser.inArena = false;
        
        if (result === 'win') {
            winner.arenaWins++;
            loser.arenaLosses++;
            winner.gold += 50;
            winner.exp += 100;
            
            // Check for level up
            if (winner.exp >= winner.level * 100) {
                winner.level++;
                winner.exp = 0;
                winner.maxHealth += 10;
                winner.health = winner.maxHealth;
                winner.maxMana += 5;
                winner.mana = winner.maxMana;
            }
            
            io.to(winnerId).emit('playerUpdate', {
                health: winner.health,
                mana: winner.mana,
                exp: winner.exp,
                level: winner.level,
                gold: winner.gold,
                arenaWins: winner.arenaWins
            });
            
            io.to(loserId).emit('playerUpdate', {
                health: loser.maxHealth, // Reset health
                mana: loser.maxMana,
                arenaLosses: loser.arenaLosses
            });
            
            io.to(winnerId).emit('arenaUpdate', {
                inArena: false,
                opponent: null
            });
            
            io.to(loserId).emit('arenaUpdate', {
                inArena: false,
                opponent: null
            });
        } else if (result === 'lose') {
            winner.arenaLosses++;
            loser.arenaWins++;
            loser.gold += 50;
            loser.exp += 100;
            
            if (loser.exp >= loser.level * 100) {
                loser.level++;
                loser.exp = 0;
                loser.maxHealth += 10;
                loser.health = loser.maxHealth;
                loser.maxMana += 5;
                loser.mana = loser.maxMana;
            }
            
            io.to(winnerId).emit('playerUpdate', {
                health: winner.maxHealth,
                mana: winner.maxMana,
                arenaLosses: winner.arenaLosses
            });
            
            io.to(loserId).emit('playerUpdate', {
                health: loser.health,
                mana: loser.mana,
                exp: loser.exp,
                level: loser.level,
                gold: loser.gold,
                arenaWins: loser.arenaWins
            });
            
            io.to(winnerId).emit('arenaUpdate', {
                inArena: false,
                opponent: null
            });
            
            io.to(loserId).emit('arenaUpdate', {
                inArena: false,
                opponent: null
            });
        } else if (result === 'timeout') {
            // Both players lose
            winner.arenaLosses++;
            loser.arenaLosses++;
            
            io.to(winnerId).emit('playerUpdate', {
                health: winner.maxHealth,
                mana: winner.maxMana,
                arenaLosses: winner.arenaLosses
            });
            
            io.to(loserId).emit('playerUpdate', {
                health: loser.maxHealth,
                mana: loser.maxMana,
                arenaLosses: loser.arenaLosses
            });
            
            io.to(winnerId).emit('arenaUpdate', {
                inArena: false,
                opponent: null
            });
            
            io.to(loserId).emit('arenaUpdate', {
                inArena: false,
                opponent: null
            });
        }
        
        // Remove fight from arena
        gameState.arena.fights = gameState.arena.fights.filter(f => 
            !(f.player1 === winnerId && f.player2 === loserId) &&
            !(f.player1 === loserId && f.player2 === winnerId)
        );
    }
    
    // Handle item use
    socket.on('useItem', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const item = player.inventory[data.slot];
        if (!item) return;
        
        if (item.type === 'potion' && item.effect === 'heal') {
            player.health = Math.min(player.maxHealth, player.health + item.value);
            player.inventory[data.slot] = null;
            socket.emit('inventoryUpdate', player.inventory);
            socket.emit('playerUpdate', { health: player.health });
        } else if (item.type === 'potion' && item.effect === 'mana') {
            player.mana = Math.min(player.maxMana, player.mana + item.value);
            player.inventory[data.slot] = null;
            socket.emit('inventoryUpdate', player.inventory);
            socket.emit('playerUpdate', { mana: player.mana });
        }
    });
    
    // Handle crafting
    socket.on('craftItem', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const recipe = CRAFTING_RECIPES.find(r => r.id === data.recipeId);
        if (!recipe) return;
        
        // Check level requirement
        if (player.level < recipe.requiredLevel) {
            socket.emit('combatResult', { message: `Benötigt Level ${recipe.requiredLevel}!` });
            return;
        }
        
        // Check materials
        const hasMaterials = Object.entries(recipe.requiredItems).every(([itemName, count]) => {
            const itemCount = player.inventory.filter(i => i && i.name === itemName).length;
            return itemCount >= count;
        });
        
        if (!hasMaterials) {
            socket.emit('combatResult', { message: 'Nicht genug Materialien!' });
            return;
        }
        
        // Remove materials
        Object.entries(recipe.requiredItems).forEach(([itemName, count]) => {
            let removed = 0;
            for (let i = 0; i < player.inventory.length && removed < count; i++) {
                if (player.inventory[i] && player.inventory[i].name === itemName) {
                    player.inventory[i] = null;
                    removed++;
                }
            }
        });
        
        // Add crafted item
        const craftedItem = {
            id: `crafted_${Date.now()}`,
            name: recipe.name,
            type: recipe.type,
            effect: recipe.effect,
            value: recipe.value,
            attack: recipe.attack || 0,
            defense: recipe.defense || 0,
            color: recipe.color || '#FFFFFF',
            icon: recipe.icon || '?'
        };
        
        const emptySlot = player.inventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            player.inventory[emptySlot] = craftedItem;
        }
        
        socket.emit('inventoryUpdate', player.inventory);
        socket.emit('combatResult', { message: `Erfolgreich hergestelltt: ${recipe.name}` });
    });
    
    // Handle guild creation
    socket.on('createGuild', (data) => {
        const player = gameState.players[socket.id];
        if (!player || player.guild) return;
        
        if (!data.name || data.name.length > 20) {
            socket.emit('combatResult', { message: 'Ungültiger Gildenname!' });
            return;
        }
        
        const guildId = `guild_${Date.now()}`;
        const guild = {
            id: guildId,
            name: data.name,
            leader: socket.id,
            members: [socket.id],
            level: 1,
            gold: 0,
            rank: 'Neu'
        };
        
        gameState.guilds[guildId] = guild;
        player.guild = guildId;
        
        socket.emit('guildUpdate', { guild: guild });
        socket.emit('combatResult', { message: `Gilde '${data.name}' gegründet!` });
        
        // Update quest progress
        updateQuestProgress(player, 'guild', null);
    });
    
    // Handle guild join
    socket.on('joinGuild', (data) => {
        const player = gameState.players[socket.id];
        if (!player || player.guild) return;
        
        const guild = gameState.guilds[data.guildId];
        if (!guild || guild.members.length >= 50) return;
        
        guild.members.push(socket.id);
        player.guild = data.guildId;
        
        socket.emit('guildUpdate', { guild: guild });
        socket.emit('combatResult', { message: `Gilde '${guild.name}' beigetreten!` });
        
        // Update quest progress
        updateQuestProgress(player, 'guild', null);
    });
    
    // Handle guild leave
    socket.on('leaveGuild', () => {
        const player = gameState.players[socket.id];
        if (!player || !player.guild) return;
        
        const guild = gameState.guilds[player.guild];
        if (!guild) return;
        
        // Remove from guild
        const index = guild.members.indexOf(socket.id);
        if (index !== -1) {
            guild.members.splice(index, 1);
        }
        
        // If leader leaves, transfer leadership
        if (guild.leader === socket.id && guild.members.length > 0) {
            guild.leader = guild.members[0];
        }
        
        // If guild is empty, delete it
        if (guild.members.length === 0) {
            delete gameState.guilds[player.guild];
        }
        
        player.guild = null;
        socket.emit('guildUpdate', { guild: null });
        socket.emit('combatResult', { message: 'Du hast die Gilde verlassen.' });
    });
    
    // Handle guild list request
    socket.on('requestGuildList', () => {
        const guilds = [];
        for (const id in gameState.guilds) {
            guilds.push({
                id: id,
                name: gameState.guilds[id].name,
                members: gameState.guilds[id].members.length,
                level: gameState.guilds[id].level
            });
        }
        socket.emit('guildList', { guilds: guilds });
    });
    
    // Handle dungeon enter
    socket.on('enterDungeon', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const dungeon = gameState.dungeons[data.dungeonId];
        if (!dungeon || player.level < dungeon.minLevel) return;
        
        // Check if player is already in a dungeon
        if (player.inDungeon) {
            leaveDungeon(socket.id, player.inDungeon);
        }
        
        // Enter dungeon
        player.inDungeon = data.dungeonId;
        dungeon.players.push(socket.id);
        
        // Set player position to dungeon entrance
        player.x = 10 * GAME_CONFIG.TILE_SIZE;
        player.y = 10 * GAME_CONFIG.TILE_SIZE;
        
        // Activate dungeon
        if (!dungeon.active) {
            dungeon.active = true;
            dungeon.lastSpawn = Date.now();
            
            // Spawn initial monsters
            for (let i = 0; i < 5; i++) {
                spawnDungeonMonster(data.dungeonId);
            }
            
            // Spawn boss after 30 seconds
            setTimeout(() => {
                spawnDungeonBoss(data.dungeonId);
            }, 30000);
        }
        
        socket.emit('dungeonUpdate', {
            inDungeon: true,
            dungeon: dungeon
        });
        
        socket.emit('playerUpdate', {
            x: player.x,
            y: player.y
        });
    });
    
    // Leave dungeon
    function leaveDungeon(playerId, dungeonId) {
        const player = gameState.players[playerId];
        const dungeon = gameState.dungeons[dungeonId];
        
        if (!player || !dungeon) return;
        
        // Remove player from dungeon
        const index = dungeon.players.indexOf(playerId);
        if (index !== -1) {
            dungeon.players.splice(index, 1);
        }
        
        // Reset player
        player.inDungeon = null;
        player.x = GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE;
        player.y = GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE;
        player.health = player.maxHealth;
        
        // Deactivate dungeon if empty
        if (dungeon.players.length === 0) {
            dungeon.active = false;
            dungeon.monsters = [];
            dungeon.items = [];
        }
        
        io.to(playerId).emit('dungeonUpdate', {
            inDungeon: false,
            dungeon: null
        });
        
        io.to(playerId).emit('playerUpdate', {
            x: player.x,
            y: player.y,
            health: player.health
        });
    }
    
    // Spawn dungeon boss
    function spawnDungeonBoss(dungeonId) {
        const dungeon = gameState.dungeons[dungeonId];
        if (!dungeon || !dungeon.active) return;
        
        const boss = dungeon.boss;
        if (!boss) return;
        
        const bossMonster = {
            id: `boss_${dungeonId}`,
            x: dungeon.mapSize.width * GAME_CONFIG.TILE_SIZE / 2,
            y: dungeon.mapSize.height * GAME_CONFIG.TILE_SIZE / 2,
            name: boss.name,
            type: 'boss',
            health: boss.health,
            maxHealth: boss.health,
            attack: boss.attack,
            defense: boss.defense,
            exp: boss.exp,
            gold: boss.gold,
            color: '#FF0000',
            speed: 0.5
        };
        
        dungeon.monsters.push(bossMonster);
        io.emit('monstersUpdate', gameState.monsters);
    }
    
    // Handle arena enter
    socket.on('challengePlayer', (data) => {
        const player = gameState.players[socket.id];
        const opponent = gameState.players[data.playerId];
        
        if (!player || !opponent || player.inArena || opponent.inArena || data.playerId === socket.id) return;
        
        // Check if opponent accepts
        io.to(data.playerId).emit('arenaChallenge', {
            challengerId: socket.id,
            challengerName: player.name
        });
    });
    
    // Handle arena challenge response
    socket.on('arenaChallengeResponse', (data) => {
        const player = gameState.players[socket.id];
        const challenger = gameState.players[data.challengerId];
        
        if (!player || !challenger || player.inArena || challenger.inArena) return;
        
        if (data.accept) {
            // Start arena fight
            startArenaFightInternal(socket.id, data.challengerId);
        } else {
            io.to(data.challengerId).emit('combatResult', {
                message: `${player.name} hat deine Herausforderung abgelehnt.`
            });
        }
    });
    
    // Start arena fight internally
    function startArenaFightInternal(player1Id, player2Id) {
        const player1 = gameState.players[player1Id];
        const player2 = gameState.players[player2Id];
        
        if (!player1 || !player2) return;
        
        // Reset health
        player1.health = player1.maxHealth;
        player1.mana = player1.maxMana;
        player2.health = player2.maxHealth;
        player2.mana = player2.maxMana;
        
        // Set in arena
        player1.inArena = true;
        player2.inArena = true;
        
        // Set positions
        player1.x = 50 * GAME_CONFIG.TILE_SIZE;
        player1.y = 50 * GAME_CONFIG.TILE_SIZE;
        player2.x = 50 * GAME_CONFIG.TILE_SIZE;
        player2.y = 55 * GAME_CONFIG.TILE_SIZE;
        
        // Create fight
        const fight = {
            player1: player1Id,
            player2: player2Id,
            startTime: Date.now()
        };
        
        gameState.arena.fights.push(fight);
        
        // Send updates
        io.to(player1Id).emit('arenaUpdate', {
            inArena: true,
            opponent: player2Id
        });
        
        io.to(player2Id).emit('arenaUpdate', {
            inArena: true,
            opponent: player1Id
        });
        
        io.to(player1Id).emit('playerUpdate', {
            x: player1.x,
            y: player1.y,
            health: player1.health,
            mana: player1.mana
        });
        
        io.to(player2Id).emit('playerUpdate', {
            x: player2.x,
            y: player2.y,
            health: player2.health,
            mana: player2.mana
        });
    }
    
    // Handle start arena fight (direct)
    socket.on('startArenaFight', (data) => {
        const player = gameState.players[socket.id];
        const opponent = gameState.players[data.opponentId];
        
        if (!player || !opponent || player.inArena || opponent.inArena || data.opponentId === socket.id) return;
        
        startArenaFightInternal(socket.id, data.opponentId);
    });
    
    // Handle leave arena
    socket.on('leaveArena', () => {
        const player = gameState.players[socket.id];
        if (!player || !player.inArena) return;
        
        // Find the fight
        const fight = gameState.arena.fights.find(f => f.player1 === socket.id || f.player2 === socket.id);
        
        if (fight) {
            const opponentId = fight.player1 === socket.id ? fight.player2 : fight.player1;
            endArenaFight(socket.id, opponentId, 'flee');
        }
        
        player.inArena = false;
        player.x = GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE;
        player.y = GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE;
        
        socket.emit('arenaUpdate', {
            inArena: false,
            opponent: null
        });
        
        socket.emit('playerUpdate', {
            x: player.x,
            y: player.y
        });
    });
    
    // Handle mount toggle
    socket.on('toggleMount', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const mount = GAME_CONFIG.MOUNTS[data.mountId];
        if (!mount) {
            // Dismount
            player.isMounted = false;
            player.mount = null;
            socket.emit('mountUpdate', {
                isMounted: false,
                mount: null
            });
            return;
        }
        
        // Check if player has the mount
        // In a real implementation, you would check inventory or unlocks
        player.isMounted = true;
        player.mount = data.mountId;
        
        socket.emit('mountUpdate', {
            isMounted: true,
            mount: data.mountId
        });
    });
    
    // Handle fly toggle
    socket.on('toggleFly', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        if (player.flyLevel === 0) {
            socket.emit('combatResult', { message: 'Du kannst nicht fliegen! Erhöhe dein Fluglevel.' });
            return;
        }
        
        player.isFlying = data.isFlying;
        
        socket.emit('playerUpdate', {
            isFlying: player.isFlying
        });
        
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            x: player.x,
            y: player.y,
            direction: player.direction,
            isMoving: player.isMoving,
            isFlying: player.isFlying
        });
    });
    
    // Handle time update request
    socket.on('requestTimeUpdate', () => {
        socket.emit('timeUpdate', { time: gameState.timeOfDay });
    });
    
    // Handle weather update request
    socket.on('requestWeatherUpdate', () => {
        socket.emit('weatherUpdate', { weather: gameState.currentWeather });
    });
    
    // Update quest progress
    function updateQuestProgress(player, type, target) {
        for (const quest of gameState.quests) {
            if (quest.type === type && !quest.completed) {
                if (type === 'kill' && quest.target === target) {
                    quest.current++;
                } else if (type === 'collect' && quest.target === target) {
                    quest.current++;
                } else if (type === 'explore') {
                    // Check if player visited all locations
                    const allVisited = quest.locations.every(loc => {
                        const distance = Math.sqrt(
                            Math.pow(player.x - loc.x * GAME_CONFIG.TILE_SIZE, 2) +
                            Math.pow(player.y - loc.y * GAME_CONFIG.TILE_SIZE, 2)
                        );
                        return distance < 50;
                    });
                    
                    if (allVisited && quest.current === 0) {
                        quest.current = quest.required;
                    }
                } else if (type === 'guild' && player.guild) {
                    quest.current = quest.required;
                }
                
                if (quest.current >= quest.required) {
                    quest.completed = true;
                    player.exp += quest.reward.exp;
                    player.gold += quest.reward.gold;
                    
                    if (player.exp >= player.level * 100) {
                        player.level++;
                        player.exp = 0;
                        player.maxHealth += 10;
                        player.health = player.maxHealth;
                        player.maxMana += 5;
                        player.mana = player.maxMana;
                    }
                    
                    socket.emit('playerUpdate', {
                        exp: player.exp,
                        level: player.level,
                        gold: player.gold
                    });
                }
                
                io.emit('questsUpdate', gameState.quests);
            }
        }
    }
    
    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        // Remove player from game state
        delete gameState.players[socket.id];
        
        // Remove from guild if in one
        for (const guildId in gameState.guilds) {
            const guild = gameState.guilds[guildId];
            const index = guild.members.indexOf(socket.id);
            if (index !== -1) {
                guild.members.splice(index, 1);
                
                if (guild.leader === socket.id && guild.members.length > 0) {
                    guild.leader = guild.members[0];
                }
                
                if (guild.members.length === 0) {
                    delete gameState.guilds[guildId];
                }
                break;
            }
        }
        
        // Remove from dungeon if in one
        for (const dungeonId in gameState.dungeons) {
            const dungeon = gameState.dungeons[dungeonId];
            const index = dungeon.players.indexOf(socket.id);
            if (index !== -1) {
                dungeon.players.splice(index, 1);
                
                if (dungeon.players.length === 0) {
                    dungeon.active = false;
                    dungeon.monsters = [];
                    dungeon.items = [];
                }
                break;
            }
        }
        
        // Remove from arena if in one
        if (gameState.arena.players.includes(socket.id)) {
            const index = gameState.arena.players.indexOf(socket.id);
            gameState.arena.players.splice(index, 1);
        }
        
        // Remove from arena fights
        gameState.arena.fights = gameState.arena.fights.filter(f => 
            f.player1 !== socket.id && f.player2 !== socket.id
        );
        
        io.emit('playerLeft', socket.id);
    });
    
    // Handle game state request
    socket.on('requestGameState', () => {
        socket.emit('npcsUpdate', gameState.npcs);
        socket.emit('monstersUpdate', gameState.monsters);
        socket.emit('itemsUpdate', gameState.items);
        socket.emit('questsUpdate', gameState.quests);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`AION Browser MMO server running on port ${PORT}`);
    initGameWorld();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
