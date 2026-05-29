// AION Browser MMO - Server
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
        heal: 10000
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
    }
};

// Game State
const gameState = {
    players: {},
    npcs: {},
    monsters: {},
    items: {},
    quests: [],
    lastMonsterSpawn: 0,
    lastItemSpawn: 0
};

// Initialize the game world
function initGameWorld() {
    // Create NPCs
    createNPCs();
    
    // Create initial monsters
    createMonsters();
    
    // Create initial items
    createItems();
    
    // Create quests
    createQuests();
    
    // Start game loop
    setInterval(gameLoop, 1000 / 30);
}

// Create NPCs
function createNPCs() {
    const npcPositions = [
        { x: 50, y: 50, name: 'Questgeber', type: 'quest', hasQuest: true },
        { x: 60, y: 50, name: 'Händler', type: 'merchant' },
        { x: 50, y: 60, name: 'Schmied', type: 'blacksmith' },
        { x: 40, y: 50, name: 'Heiler', type: 'healer' }
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
        { name: 'Wolf', health: 35, attack: 10, defense: 2, exp: 25, gold: 6, color: '#808080' }
    ];
    
    // Spawn monsters around the map
    for (let i = 0; i < 20; i++) {
        const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
        const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH) * GAME_CONFIG.TILE_SIZE;
        const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT) * GAME_CONFIG.TILE_SIZE;
        
        // Make sure monsters don't spawn too close to the spawn area
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
                speed: 1,
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
        { name: 'Schild', type: 'armor', defense: 5, color: '#8B4513', icon: '🛡' }
    ];
    
    // Spawn items around the map
    for (let i = 0; i < 30; i++) {
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
        }
    ];
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
    
    // Broadcast game state to all clients
    broadcastGameState();
}

// Spawn a new monster
function spawnMonster() {
    const monsterTypes = [
        { name: 'Goblin', health: 30, attack: 8, defense: 2, exp: 20, gold: 5, color: '#8B4513' },
        { name: 'Ork', health: 50, attack: 12, defense: 5, exp: 35, gold: 10, color: '#228B22' },
        { name: 'Skelett', health: 40, attack: 10, defense: 3, exp: 25, gold: 8, color: '#FFFFFF' },
        { name: 'Wolf', health: 35, attack: 10, defense: 2, exp: 25, gold: 6, color: '#808080' }
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
            speed: 1,
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
        { name: 'Schild', type: 'armor', defense: 5, color: '#8B4513', icon: '🛡' }
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
        
        // Simple AI: Chase nearest player
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
            // Move towards player
            const angle = Math.atan2(
                nearestPlayer.y - monster.y,
                nearestPlayer.x - monster.x
            );
            
            monster.x += Math.cos(angle) * monster.speed;
            monster.y += Math.sin(angle) * monster.speed;
            
            // Attack if close enough
            if (nearestDistance < 20) {
                // Attack the player
                attackPlayer(monster, nearestPlayer);
            }
        } else {
            // Random movement
            if (Math.random() < 0.01) {
                monster.x += (Math.random() - 0.5) * 10;
                monster.y += (Math.random() - 0.5) * 10;
            }
        }
    }
}

// Attack a player
function attackPlayer(attacker, target) {
    if (!gameState.players[target.id]) return;
    
    const damage = Math.max(1, attacker.attack - (target.defense || 0));
    
    // Update target health
    gameState.players[target.id].health -= damage;
    
    // Check if player died
    if (gameState.players[target.id].health <= 0) {
        // Respawn player
        gameState.players[target.id].health = gameState.players[target.id].maxHealth;
        gameState.players[target.id].x = GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE;
        gameState.players[target.id].y = GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE;
    }
    
    // Send combat result
    io.to(target.id).emit('combatResult', {
        attackerId: attacker.id,
        attackerName: attacker.name,
        targetId: target.id,
        damage: damage
    });
}

// Broadcast game state
function broadcastGameState() {
    // Broadcast NPCs
    io.emit('npcsUpdate', gameState.npcs);
    
    // Broadcast monsters
    io.emit('monstersUpdate', gameState.monsters);
    
    // Broadcast items
    io.emit('itemsUpdate', gameState.items);
    
    // Broadcast quests
    io.emit('questsUpdate', gameState.quests);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle player creation
    socket.on('createPlayer', (playerData) => {
        // Create player
        const player = {
            id: socket.id,
            name: playerData.name,
            class: playerData.class,
            x: GAME_CONFIG.SPAWN_AREA.x * GAME_CONFIG.TILE_SIZE,
            y: GAME_CONFIG.SPAWN_AREA.y * GAME_CONFIG.TILE_SIZE,
            direction: 'down',
            isMoving: false,
            ...GAME_CONFIG.CLASS_STATS[playerData.class],
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            level: 1,
            exp: 0,
            gold: 0,
            inventory: [],
            cooldowns: {},
            quests: []
        };
        
        // Add player to game state
        gameState.players[socket.id] = player;
        
        // Send player data to client
        socket.emit('playerJoined', player);
        
        // Send other players to this client
        const otherPlayers = {};
        for (const id in gameState.players) {
            if (id !== socket.id) {
                otherPlayers[id] = gameState.players[id];
            }
        }
        socket.emit('playersUpdate', otherPlayers);
        
        // Send initial game state
        socket.emit('npcsUpdate', gameState.npcs);
        socket.emit('monstersUpdate', gameState.monsters);
        socket.emit('itemsUpdate', gameState.items);
        socket.emit('questsUpdate', gameState.quests);
        socket.emit('inventoryUpdate', player.inventory);
        
        // Notify other players
        socket.broadcast.emit('playerJoined', player);
    });
    
    // Handle player movement
    socket.on('movePlayer', (data) => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].x = data.x;
            gameState.players[socket.id].y = data.y;
            gameState.players[socket.id].direction = data.direction;
            gameState.players[socket.id].isMoving = data.isMoving;
            
            // Broadcast to other players
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y,
                direction: data.direction,
                isMoving: data.isMoving
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
    
    // Handle ability use
    socket.on('useAbility', (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const ability = GAME_CONFIG.ABILITY_EFFECTS[player.class][data.ability];
        if (!ability) return;
        
        // Check cooldown
        if (player.cooldowns && player.cooldowns[data.ability] > Date.now()) {
            return;
        }
        
        // Check mana
        if (ability.manaCost && player.mana < ability.manaCost) {
            socket.emit('combatResult', {
                message: 'Nicht genug Mana!'
            });
            return;
        }
        
        // Consume mana
        if (ability.manaCost) {
            player.mana -= ability.manaCost;
            socket.emit('playerUpdate', { mana: player.mana });
        }
        
        // Set cooldown
        player.cooldowns = player.cooldowns || {};
        player.cooldowns[data.ability] = Date.now() + GAME_CONFIG.ABILITY_COOLDOWNS[data.ability];
        socket.emit('playerUpdate', { cooldowns: player.cooldowns });
        
        // Broadcast ability use
        io.emit('abilityUsed', {
            playerId: socket.id,
            playerName: player.name,
            ability: data.ability,
            target: data.target
        });
        
        // Handle ability effects
        if (data.target) {
            // Find target
            let target = null;
            
            if (gameState.players[data.target]) {
                target = gameState.players[data.target];
            } else if (gameState.monsters[data.target]) {
                target = gameState.monsters[data.target];
            }
            
            if (target) {
                handleAbilityEffect(player, target, ability, data.ability);
            }
        }
    });
    
    // Handle ability effects
    function handleAbilityEffect(attacker, target, ability, abilityName) {
        // Calculate damage
        let damage = ability.damage || 0;
        if (damage > 0) {
            // Apply defense
            damage = Math.max(1, damage - (target.defense || 0));
            
            // Apply damage
            target.health -= damage;
            
            // Check if target died
            if (target.health <= 0) {
                if (target.type === 'monster') {
                    // Give exp and gold to attacker
                    attacker.exp += target.exp;
                    attacker.gold += target.gold;
                    
                    // Check for level up
                    if (attacker.exp >= attacker.level * 100) {
                        attacker.level++;
                        attacker.exp = 0;
                        attacker.maxHealth += 10;
                        attacker.health = attacker.maxHealth;
                        attacker.maxMana += 5;
                        attacker.mana = attacker.maxMana;
                    }
                    
                    // Remove monster
                    delete gameState.monsters[target.id];
                    
                    // Update quest progress
                    updateQuestProgress(attacker, 'kill', target.name);
                }
            }
            
            // Send combat result
            io.to(attacker.id).emit('combatResult', {
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
            // Heal target
            const healAmount = ability.heal;
            if (target.health + healAmount > target.maxHealth) {
                target.health = target.maxHealth;
            } else {
                target.health += healAmount;
            }
            
            // Send combat result
            io.to(attacker.id).emit('combatResult', {
                message: `Heilung: +${healAmount} HP`
            });
        }
        
        // Update target state
        if (target.type === 'player') {
            io.to(target.id).emit('playerUpdate', {
                health: target.health,
                mana: target.mana
            });
        } else if (target.type === 'monster') {
            io.emit('monstersUpdate', gameState.monsters);
        }
        
        // Update attacker state
        io.to(attacker.id).emit('playerUpdate', {
            health: attacker.health,
            mana: attacker.mana,
            exp: attacker.exp,
            level: attacker.level,
            gold: attacker.gold
        });
    }
    
    // Update quest progress
    function updateQuestProgress(player, type, target) {
        for (const quest of gameState.quests) {
            if (quest.type === type && quest.target === target && !quest.completed) {
                quest.current++;
                
                if (quest.current >= quest.required) {
                    quest.completed = true;
                    // Give reward
                    player.exp += quest.reward.exp;
                    player.gold += quest.reward.gold;
                    
                    // Check for level up
                    if (player.exp >= player.level * 100) {
                        player.level++;
                        player.exp = 0;
                        player.maxHealth += 10;
                        player.health = player.maxHealth;
                        player.maxMana += 5;
                        player.mana = player.maxMana;
                    }
                    
                    // Update player
                    io.to(player.id).emit('playerUpdate', {
                        exp: player.exp,
                        level: player.level,
                        gold: player.gold
                    });
                }
                
                io.emit('questsUpdate', gameState.quests);
            }
        }
    }
    
    // Handle item pickup
    socket.on('pickupItem', (itemId) => {
        const player = gameState.players[socket.id];
        if (!player) return;
        
        const item = gameState.items[itemId];
        if (!item) return;
        
        // Add item to inventory
        const emptySlot = player.inventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            player.inventory[emptySlot] = item;
            delete gameState.items[itemId];
            
            // Update client
            socket.emit('inventoryUpdate', player.inventory);
            io.emit('itemsUpdate', gameState.items);
            
            // Handle item effects
            if (item.type === 'potion' && item.effect === 'heal') {
                player.health = Math.min(player.maxHealth, player.health + item.value);
                socket.emit('playerUpdate', { health: player.health });
            } else if (item.type === 'potion' && item.effect === 'mana') {
                player.mana = Math.min(player.maxMana, player.mana + item.value);
                socket.emit('playerUpdate', { mana: player.mana });
            } else if (item.type === 'currency') {
                player.gold += item.value;
                socket.emit('playerUpdate', { gold: player.gold });
            }
        }
    });
    
    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        // Remove player from game state
        delete gameState.players[socket.id];
        
        // Notify other players
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
    
    // Initialize game world
    initGameWorld();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
