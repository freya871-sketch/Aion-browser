// AION Browser MMO - Sprite Manager
const SpriteManager = {
    // Canvas for sprite rendering
    canvas: null,
    ctx: null,
    
    // Sprite sheets (will be loaded as Base64 or URL)
    spriteSheets: {},
    
    // Sprite definitions
    sprites: {
        // Player sprites by class and direction
        player: {
            warrior: {
                up: null,
                down: null,
                left: null,
                right: null
            },
            mage: {
                up: null,
                down: null,
                left: null,
                right: null
            },
            archer: {
                up: null,
                down: null,
                left: null,
                right: null
            }
        },
        
        // NPC sprites
        npc: {
            quest: null,
            merchant: null,
            blacksmith: null,
            healer: null
        },
        
        // Monster sprites
        monster: {
            goblin: null,
            ork: null,
            skeleton: null,
            wolf: null,
            boss: null
        },
        
        // Item sprites
        item: {
            potion: null,
            weapon: null,
            armor: null,
            gold: null
        },
        
        // Environment sprites
        environment: {
            tree: null,
            rock: null,
            grass: null,
            water: null,
            dungeonEntrance: null,
            arenaEntrance: null
        },
        
        // UI sprites
        ui: {
            healthPotion: null,
            manaPotion: null,
            attackIcon: null,
            defenseIcon: null
        },
        
        // Mount sprites
        mount: {
            horse: null,
            dragon: null,
            phoenix: null
        },
        
        // Wing sprites for flying
        wings: {
            asmodian: null,
            elyos: null
        }
    },
    
    // Animation frames
    animations: {
        player: {
            walk: { frames: [], frameRate: 10 },
            attack: { frames: [], frameRate: 15 },
            cast: { frames: [], frameRate: 15 },
            fly: { frames: [], frameRate: 10 }
        },
        monster: {
            walk: { frames: [], frameRate: 10 },
            attack: { frames: [], frameRate: 15 }
        }
    },
    
    // Initialize sprite manager
    init(canvas) {
        this.canvas = canvas || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Create sprite sheets using Canvas
        this.createSpriteSheets();
        this.createSprites();
        
        console.log('Sprite Manager initialized');
    },
    
    // Create sprite sheets programmatically
    createSpriteSheets() {
        // Create player sprite sheet
        this.createPlayerSprites();
        this.createMonsterSprites();
        this.createItemSprites();
        this.createEnvironmentSprites();
        this.createUISprites();
        this.createMountSprites();
        this.createWingSprites();
    },
    
    // Create player sprites
    createPlayerSprites() {
        const colors = {
            warrior: { primary: '#8B0000', secondary: '#A0522D', hair: '#228B22' },
            mage: { primary: '#483D8B', secondary: '#6A5ACD', hair: '#FFFFFF' },
            archer: { primary: '#228B22', secondary: '#32CD32', hair: '#8B4513' }
        };
        
        for (const [className, colorSet] of Object.entries(colors)) {
            // Create sprites for each direction
            ['up', 'down', 'left', 'right'].forEach(direction => {
                this.sprites.player[className][direction] = this.createPlayerSprite(colorSet, direction);
            });
        }
    },
    
    // Create a simple player sprite
    createPlayerSprite(colors, direction) {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size * 4; // 4 frames for animation
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw 4 frames for walking animation
        for (let frame = 0; frame < 4; frame++) {
            const offset = frame * size;
            
            // Draw body
            ctx.fillStyle = colors.primary;
            ctx.fillRect(offset + 8, 8, 16, 16);
            
            // Draw head
            ctx.fillStyle = colors.secondary;
            ctx.beginPath();
            ctx.arc(offset + 16, 12, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw hair
            ctx.fillStyle = colors.hair;
            if (direction === 'up') {
                ctx.fillRect(offset + 14, 6, 4, 4);
            } else if (direction === 'down') {
                ctx.fillRect(offset + 14, 18, 4, 4);
            } else if (direction === 'left') {
                ctx.fillRect(offset + 6, 14, 4, 4);
            } else if (direction === 'right') {
                ctx.fillRect(offset + 20, 14, 4, 4);
            }
            
            // Draw eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(offset + 14, 10, 2, 2);
            ctx.fillRect(offset + 18, 10, 2, 2);
            
            // Draw weapon based on class
            if (className === 'warrior') {
                ctx.fillStyle = '#C0C0C0';
                if (direction === 'right') {
                    ctx.fillRect(offset + 22, 14, 6, 2);
                } else if (direction === 'left') {
                    ctx.fillRect(offset + 4, 14, 6, 2);
                } else if (direction === 'up') {
                    ctx.fillRect(offset + 14, 6, 2, 6);
                } else if (direction === 'down') {
                    ctx.fillRect(offset + 14, 20, 2, 6);
                }
            } else if (className === 'mage') {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(offset + 16, 8, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (className === 'archer') {
                ctx.fillStyle = '#8B4513';
                if (direction === 'right') {
                    ctx.fillRect(offset + 24, 12, 8, 2);
                } else if (direction === 'left') {
                    ctx.fillRect(offset + 0, 12, 8, 2);
                }
            }
        }
        
        return canvas;
    },
    
    // Create monster sprites
    createMonsterSprites() {
        const monsters = {
            goblin: { color: '#8B4513', size: 24 },
            ork: { color: '#228B22', size: 28 },
            skeleton: { color: '#FFFFFF', size: 28 },
            wolf: { color: '#808080', size: 24 },
            boss: { color: '#FF0000', size: 36 }
        };
        
        for (const [name, config] of Object.entries(monsters)) {
            this.sprites.monster[name] = this.createMonsterSprite(config);
        }
    },
    
    createMonsterSprite(config) {
        const size = config.size;
        const canvas = document.createElement('canvas');
        canvas.width = size * 4;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        for (let frame = 0; frame < 4; frame++) {
            const offset = frame * size;
            
            // Draw body
            ctx.fillStyle = config.color;
            ctx.fillRect(offset + 4, 4, size - 8, size - 8);
            
            // Draw head
            ctx.fillStyle = this.adjustColor(config.color, -20);
            ctx.beginPath();
            ctx.arc(offset + size/2, size/2 - 4, size/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw eyes
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(offset + size/2 - 4, size/2 - 6, 3, 3);
            ctx.fillRect(offset + size/2 + 1, size/2 - 6, 3, 3);
            
            // Draw mouth
            ctx.fillStyle = '#000000';
            ctx.fillRect(offset + size/2 - 3, size/2 - 2, 6, 2);
        }
        
        return canvas;
    },
    
    // Create item sprites
    createItemSprites() {
        const items = {
            potion: { color: '#FF4444', shape: 'round', icon: '❤' },
            weapon: { color: '#C0C0C0', shape: 'rect', icon: '⚔' },
            armor: { color: '#8B4513', shape: 'rect', icon: '🛡' },
            gold: { color: '#FFD700', shape: 'round', icon: '💰' }
        };
        
        for (const [name, config] of Object.entries(items)) {
            this.sprites.item[name] = this.createItemSprite(config);
        }
    },
    
    createItemSprite(config) {
        const size = 16;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw item
        ctx.fillStyle = config.color;
        if (config.shape === 'round') {
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(2, 2, size - 4, size - 4);
        }
        
        // Draw icon
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.icon, size/2, size/2);
        
        return canvas;
    },
    
    // Create environment sprites
    createEnvironmentSprites() {
        // Tree
        this.sprites.environment.tree = this.createTreeSprite();
        
        // Rock
        this.sprites.environment.rock = this.createRockSprite();
        
        // Grass
        this.sprites.environment.grass = this.createGrassSprite();
        
        // Water
        this.sprites.environment.water = this.createWaterSprite();
        
        // Dungeon entrance
        this.sprites.environment.dungeonEntrance = this.createDungeonEntranceSprite();
        
        // Arena entrance
        this.sprites.environment.arenaEntrance = this.createArenaEntranceSprite();
    },
    
    createTreeSprite() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(size/2 - 4, size/2, 8, size/2);
        
        // Draw leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(size/2, size/4);
        ctx.bezierCurveTo(size/4, size/4, size/4, size/2, size/2, size/2);
        ctx.bezierCurveTo(size - size/4, size/2, size - size/4, size/4, size/2, size/4);
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    },
    
    createRockSprite() {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw rock
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some texture
        ctx.fillStyle = this.adjustColor('#808080', -30);
        ctx.beginPath();
        ctx.arc(size/2 - 4, size/2 - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size/2 + 4, size/2 + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    },
    
    createGrassSprite() {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw grass
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, size, size);
        
        // Add some blades of grass
        ctx.fillStyle = this.adjustColor('#228B22', 20);
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const width = 2 + Math.random() * 3;
            const height = 5 + Math.random() * 5;
            ctx.fillRect(x, y, width, height);
        }
        
        return canvas;
    },
    
    createWaterSprite() {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw water
        ctx.fillStyle = '#1E90FF';
        ctx.fillRect(0, 0, size, size);
        
        // Add wave effect
        ctx.fillStyle = this.adjustColor('#1E90FF', -20);
        ctx.beginPath();
        ctx.moveTo(0, size/2);
        ctx.bezierCurveTo(size/4, size/2 - 5, size/2, size/2 + 5, size, size/2);
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    },
    
    createDungeonEntranceSprite() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw entrance
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(0, size/2, size, size/2);
        
        // Draw arch
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI);
        ctx.fill();
        
        // Draw steps
        ctx.fillStyle = '#696969';
        ctx.fillRect(size/4, size/2, size/2, size/4);
        
        return canvas;
    },
    
    createArenaEntranceSprite() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw entrance
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, size/2, size, size/2);
        
        // Draw arch
        ctx.fillStyle = '#B22222';
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI);
        ctx.fill();
        
        // Draw banner
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(size/2 - 8, size/4, 16, 8);
        
        return canvas;
    },
    
    // Create UI sprites
    createUISprites() {
        // Health potion
        this.sprites.ui.healthPotion = this.createPotionSprite('#FF4444');
        
        // Mana potion
        this.sprites.ui.manaPotion = this.createPotionSprite('#4444FF');
        
        // Attack icon
        this.sprites.ui.attackIcon = this.createIconSprite('⚔', '#C0C0C0');
        
        // Defense icon
        this.sprites.ui.defenseIcon = this.createIconSprite('🛡', '#8B4513');
    },
    
    createPotionSprite(color) {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw potion
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(size/2, size/4);
        ctx.bezierCurveTo(size/4, size/4, size/4, size - size/4, size/2, size - size/4);
        ctx.bezierCurveTo(size - size/4, size - size/4, size - size/4, size/4, size/2, size/4);
        ctx.closePath();
        ctx.fill();
        
        // Draw cap
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(size/4, size/4 - 4, size/2, 8);
        
        return canvas;
    },
    
    createIconSprite(icon, color) {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, size/2, size/2);
        
        return canvas;
    },
    
    // Create mount sprites
    createMountSprites() {
        // Horse
        this.sprites.mount.horse = this.createMountSprite('#8B4513', '🐴');
        
        // Dragon
        this.sprites.mount.dragon = this.createMountSprite('#FF4500', '🐉');
        
        // Phoenix
        this.sprites.mount.phoenix = this.createMountSprite('#FFD700', '🔥');
    },
    
    createMountSprite(color, icon) {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size * 4;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        for (let frame = 0; frame < 4; frame++) {
            const offset = frame * size;
            
            // Draw body
            ctx.fillStyle = color;
            ctx.fillRect(offset + 4, 16, size - 8, 16);
            
            // Draw head
            ctx.beginPath();
            ctx.arc(offset + size/2, 12, size/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw legs
            ctx.fillRect(offset + size/2 - 4, 32, 4, 16);
            ctx.fillRect(offset + size/2 + 4, 32, 4, 16);
            
            // Draw icon
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, offset + size/2, 8);
        }
        
        return canvas;
    },
    
    // Create wing sprites
    createWingSprites() {
        // Asmodian wings
        this.sprites.wings.asmodian = this.createWingSprite('#8B0000', '#4B0082');
        
        // Elyos wings
        this.sprites.wings.elyos = this.createWingSprite('#FFFFFF', '#FFD700');
    },
    
    createWingSprite(primary, secondary) {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Left wing
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.moveTo(size, size/2);
        ctx.bezierCurveTo(size/2, size/2, size/4, size/4, 0, size/2);
        ctx.bezierCurveTo(size/4, size - size/4, size/2, size - size/4, size, size/2);
        ctx.closePath();
        ctx.fill();
        
        // Right wing
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(size, size/2);
        ctx.bezierCurveTo(size + size/2, size/2, size + size - size/4, size/4, size * 2, size/2);
        ctx.bezierCurveTo(size + size - size/4, size - size/4, size + size/2, size - size/4, size, size/2);
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    },
    
    // Helper function to adjust color
    adjustColor(color, amount) {
        // Simple color adjustment (lighten/darken)
        // This is a placeholder - in a real implementation, you'd use a proper color manipulation library
        const colors = {
            '#8B0000': { r: 139, g: 0, b: 0 },
            '#A0522D': { r: 160, g: 82, b: 45 },
            '#228B22': { r: 34, g: 139, b: 34 },
            '#483D8B': { r: 72, g: 61, b: 139 },
            '#6A5ACD': { r: 106, g: 90, b: 205 },
            '#FF4444': { r: 255, g: 68, b: 68 },
            '#4444FF': { r: 68, g: 68, b: 255 },
            '#808080': { r: 128, g: 128, b: 128 },
            '#FFFFFF': { r: 255, g: 255, b: 255 },
            '#1E90FF': { r: 30, g: 144, b: 255 },
            '#C0C0C0': { r: 192, g: 192, b: 192 },
            '#FFD700': { r: 255, g: 215, b: 0 },
            '#8B4513': { r: 139, g: 69, b: 19 },
            '#2F4F4F': { r: 47, g: 79, b: 79 },
            '#FF4500': { r: 255, g: 69, b: 0 },
            '#B22222': { r: 178, g: 34, b: 34 }
        };
        
        const colorObj = colors[color.toUpperCase()] || { r: 128, g: 128, b: 128 };
        
        colorObj.r = Math.max(0, Math.min(255, colorObj.r + amount));
        colorObj.g = Math.max(0, Math.min(255, colorObj.g + amount));
        colorObj.b = Math.max(0, Math.min(255, colorObj.b + amount));
        
        return `rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`;
    },
    
    // Draw a sprite
    drawSprite(sprite, x, y, frame = 0, scale = 1) {
        if (!sprite || !this.ctx) return;
        
        const frameWidth = sprite.width / (sprite.width / 32); // Assuming 32px frames
        const currentFrame = frame % Math.floor(sprite.width / frameWidth);
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        
        this.ctx.drawImage(
            sprite,
            currentFrame * frameWidth, 0, frameWidth, sprite.height,
            0, 0, frameWidth, sprite.height
        );
        
        this.ctx.restore();
    },
    
    // Draw an entity with a sprite
    drawEntity(entity, x, y) {
        if (!entity || !entity.sprite) return;
        
        const sprite = this.sprites[entity.sprite.type]?.[entity.sprite.name]?.[entity.direction];
        if (!sprite) return;
        
        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(x - 4, y + 28, 32, 4);
        
        // Draw sprite
        const frame = entity.isMoving ? Math.floor(Date.now() / 200) % 4 : 0;
        this.drawSprite(sprite, x, y, frame);
        
        // Draw name
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(entity.name, x + 16, y - 5);
        
        // Draw health bar if needed
        if (entity.health !== undefined && entity.health < entity.maxHealth) {
            const barWidth = 32;
            const barHeight = 3;
            const healthPercent = entity.health / entity.maxHealth;
            
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(x, y - 10, barWidth * healthPercent, barHeight);
            this.ctx.strokeStyle = '#880000';
            this.ctx.strokeRect(x, y - 10, barWidth, barHeight);
        }
    },
    
    // Draw a particle
    drawParticle(particle) {
        if (!particle || !this.ctx) return;
        
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        
        // Draw particle
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.opacity;
        
        if (particle.type === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (particle.type === 'square') {
            this.ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
        } else if (particle.type === 'triangle') {
            this.ctx.beginPath();
            this.ctx.moveTo(0, -particle.size);
            this.ctx.lineTo(particle.size, particle.size);
            this.ctx.lineTo(-particle.size, particle.size);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteManager;
}
