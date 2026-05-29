// AION Browser MMO - Particle System
const ParticleSystem = {
    // Particle pool for better performance
    particlePool: [],
    activeParticles: [],
    canvas: null,
    ctx: null,
    
    // Particle presets
    presets: {
        // Fire particles
        fire: {
            type: 'circle',
            color: () => `hsl(${Math.random() * 30 + 10}, 100%, ${Math.random() * 30 + 50}%)`,
            size: () => Math.random() * 4 + 2,
            life: 1000,
            speed: () => Math.random() * 2 + 1,
            gravity: -0.05,
            opacity: 1,
            fade: true
        },
        
        // Ice particles
        ice: {
            type: 'circle',
            color: () => `hsl(${Math.random() * 30 + 200}, 100%, ${Math.random() * 30 + 70}%)`,
            size: () => Math.random() * 3 + 1,
            life: 1500,
            speed: () => Math.random() * 1 + 0.5,
            gravity: 0.02,
            opacity: 0.8,
            fade: true
        },
        
        // Lightning particles
        lightning: {
            type: 'triangle',
            color: () => `hsl(${Math.random() * 30 + 240}, 100%, ${Math.random() * 30 + 70}%)`,
            size: () => Math.random() * 5 + 2,
            life: 500,
            speed: () => Math.random() * 4 + 2,
            gravity: 0,
            opacity: 1,
            fade: true
        },
        
        // Heal particles
        heal: {
            type: 'circle',
            color: () => `hsl(${Math.random() * 30 + 120}, 100%, ${Math.random() * 30 + 70}%)`,
            size: () => Math.random() * 3 + 1,
            life: 1000,
            speed: () => Math.random() * 1 + 0.5,
            gravity: -0.02,
            opacity: 0.9,
            fade: true
        },
        
        // Damage particles
        damage: {
            type: 'square',
            color: () => '#ff4444',
            size: () => Math.random() * 3 + 1,
            life: 800,
            speed: () => Math.random() * 2 + 1,
            gravity: 0.1,
            opacity: 1,
            fade: true
        },
        
        // Dust particles (for movement)
        dust: {
            type: 'circle',
            color: () => `rgba(139, 69, 19, ${Math.random() * 0.3 + 0.2})`,
            size: () => Math.random() * 4 + 1,
            life: 500,
            speed: () => Math.random() * 1 + 0.5,
            gravity: 0.2,
            opacity: 0.6,
            fade: true
        },
        
        // Spark particles
        spark: {
            type: 'circle',
            color: () => `hsl(${Math.random() * 60}, 100%, ${Math.random() * 40 + 60}%)`,
            size: () => Math.random() * 2 + 1,
            life: 1500,
            speed: () => Math.random() * 3 + 1,
            gravity: 0,
            opacity: 1,
            fade: true
        },
        
        // Snow particles (for weather)
        snow: {
            type: 'circle',
            color: () => 'rgba(255, 255, 255, 0.9)',
            size: () => Math.random() * 3 + 1,
            life: 5000,
            speed: () => Math.random() * 0.5 + 0.2,
            gravity: 0.02,
            opacity: 0.9,
            fade: false,
            wind: 0.1
        },
        
        // Rain particles (for weather)
        rain: {
            type: 'rect',
            color: () => 'rgba(100, 149, 237, 0.7)',
            size: () => Math.random() * 2 + 1,
            life: 2000,
            speed: () => Math.random() * 4 + 2,
            gravity: 0.5,
            opacity: 0.7,
            fade: false,
            angle: Math.PI / 4
        },
        
        // Leaf particles (for autumn)
        leaf: {
            type: 'leaf',
            color: () => `hsl(${Math.random() * 30 + 30}, 100%, ${Math.random() * 20 + 50}%)`,
            size: () => Math.random() * 4 + 2,
            life: 8000,
            speed: () => Math.random() * 0.5 + 0.2,
            gravity: 0.05,
            opacity: 0.8,
            fade: false,
            wind: 0.2
        }
    },
    
    // Initialize particle system
    init(canvas) {
        this.canvas = canvas || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Create particle pool
        for (let i = 0; i < 1000; i++) {
            this.particlePool.push(this.createParticle());
        }
        
        console.log('Particle System initialized with pool of', this.particlePool.length, 'particles');
    },
    
    // Create a new particle
    createParticle() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 0,
            color: '',
            life: 0,
            maxLife: 0,
            opacity: 1,
            type: 'circle',
            gravity: 0,
            angle: 0,
            rotation: 0,
            scale: 1,
            active: false,
            preset: null,
            startTime: 0
        };
    },
    
    // Get a particle from the pool
    getParticle() {
        for (let i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].active) {
                this.particlePool[i].active = true;
                return this.particlePool[i];
            }
        }
        
        // If pool is empty, create a new one
        const particle = this.createParticle();
        particle.active = true;
        this.particlePool.push(particle);
        return particle;
    },
    
    // Release a particle back to the pool
    releaseParticle(particle) {
        particle.active = false;
    },
    
    // Create an explosion effect
    createExplosion(x, y, preset = 'fire', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.presets[preset].speed();
            
            const particle = this.getParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = this.presets[preset].size();
            particle.color = this.presets[preset].color();
            particle.maxLife = this.presets[preset].life;
            particle.life = particle.maxLife;
            particle.opacity = this.presets[preset].opacity || 1;
            particle.type = this.presets[preset].type;
            particle.gravity = this.presets[preset].gravity || 0;
            particle.startTime = Date.now();
            particle.preset = preset;
            
            this.activeParticles.push(particle);
        }
    },
    
    // Create a burst effect (for healing, buffs, etc.)
    createBurst(x, y, preset = 'heal', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = this.presets[preset].speed();
            
            const particle = this.getParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = this.presets[preset].size();
            particle.color = this.presets[preset].color();
            particle.maxLife = this.presets[preset].life;
            particle.life = particle.maxLife;
            particle.opacity = this.presets[preset].opacity || 1;
            particle.type = this.presets[preset].type;
            particle.gravity = this.presets[preset].gravity || 0;
            particle.startTime = Date.now();
            particle.preset = preset;
            
            this.activeParticles.push(particle);
        }
    },
    
    // Create a continuous effect (for weather, auras, etc.)
    createContinuousEffect(x, y, preset = 'snow', count = 1, area = { width: 100, height: 100 }) {
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            particle.x = x + (Math.random() - 0.5) * area.width;
            particle.y = y + (Math.random() - 0.5) * area.height;
            particle.vx = (Math.random() - 0.5) * (this.presets[preset].speed() * 2);
            particle.vy = -this.presets[preset].speed();
            particle.size = this.presets[preset].size();
            particle.color = this.presets[preset].color();
            particle.maxLife = this.presets[preset].life;
            particle.life = particle.maxLife;
            particle.opacity = this.presets[preset].opacity || 1;
            particle.type = this.presets[preset].type;
            particle.gravity = this.presets[preset].gravity || 0;
            particle.wind = this.presets[preset].wind || 0;
            particle.angle = this.presets[preset].angle || 0;
            particle.startTime = Date.now();
            particle.preset = preset;
            
            this.activeParticles.push(particle);
        }
    },
    
    // Create a line effect (for projectiles)
    createLineEffect(startX, startY, endX, endY, preset = 'lightning', count = 10) {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const x = startX + dx * t + (Math.random() - 0.5) * 5;
            const y = startY + dy * t + (Math.random() - 0.5) * 5;
            
            const particle = this.getParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * this.presets[preset].speed();
            particle.vy = Math.sin(angle) * this.presets[preset].speed();
            particle.size = this.presets[preset].size();
            particle.color = this.presets[preset].color();
            particle.maxLife = this.presets[preset].life;
            particle.life = particle.maxLife;
            particle.opacity = this.presets[preset].opacity || 1;
            particle.type = this.presets[preset].type;
            particle.startTime = Date.now();
            particle.preset = preset;
            
            this.activeParticles.push(particle);
        }
    },
    
    // Create a damage number effect
    createDamageNumber(x, y, damage, isHeal = false) {
        const particle = this.getParticle();
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 2;
        particle.vy = -2;
        particle.size = 12;
        particle.color = isHeal ? '#44ff44' : '#ff4444';
        particle.maxLife = 1000;
        particle.life = particle.maxLife;
        particle.opacity = 1;
        particle.type = 'text';
        particle.text = isHeal ? `+${damage}` : `-${damage}`;
        particle.startTime = Date.now();
        particle.preset = 'damage';
        
        this.activeParticles.push(particle);
    },
    
    // Update all active particles
    update(deltaTime) {
        const now = Date.now();
        
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            
            // Update life
            particle.life -= deltaTime * 1000; // Convert to ms
            
            if (particle.life <= 0) {
                // Particle is dead
                this.releaseParticle(particle);
                this.activeParticles.splice(i, 1);
                continue;
            }
            
            // Apply gravity
            particle.vy += particle.gravity * deltaTime * 1000;
            
            // Apply wind
            if (particle.wind) {
                particle.vx += particle.wind * deltaTime * 1000;
            }
            
            // Update position
            particle.x += particle.vx * deltaTime * 1000;
            particle.y += particle.vy * deltaTime * 1000;
            
            // Apply fade
            if (particle.fade && particle.maxLife > 0) {
                particle.opacity = particle.life / particle.maxLife;
            }
            
            // Apply rotation
            if (particle.rotation) {
                particle.angle += particle.rotation * deltaTime * 1000;
            }
        }
    },
    
    // Draw all active particles
    draw() {
        if (!this.ctx) return;
        
        this.ctx.save();
        
        for (const particle of this.activeParticles) {
            this.drawParticle(particle);
        }
        
        this.ctx.restore();
    },
    
    // Draw a single particle
    drawParticle(particle) {
        if (!particle || particle.opacity <= 0) return;
        
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.angle || 0);
        this.ctx.scale(particle.scale || 1, particle.scale || 1);
        
        // Set global alpha
        this.ctx.globalAlpha = particle.opacity;
        
        if (particle.type === 'circle') {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (particle.type === 'square') {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
        } else if (particle.type === 'triangle') {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -particle.size);
            this.ctx.lineTo(particle.size, particle.size);
            this.ctx.lineTo(-particle.size, particle.size);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (particle.type === 'leaf') {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -particle.size / 2);
            this.ctx.bezierCurveTo(
                particle.size / 2, -particle.size / 2,
                particle.size / 2, particle.size / 2,
                0, particle.size / 2
            );
            this.ctx.bezierCurveTo(
                -particle.size / 2, particle.size / 2,
                -particle.size / 2, -particle.size / 2,
                0, -particle.size / 2
            );
            this.ctx.closePath();
            this.ctx.fill();
        } else if (particle.type === 'text') {
            this.ctx.fillStyle = particle.color;
            this.ctx.font = `${particle.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(particle.text, 0, 0);
        }
        
        this.ctx.restore();
    },
    
    // Clear all particles
    clear() {
        this.activeParticles = [];
        for (const particle of this.particlePool) {
            particle.active = false;
        }
    },
    
    // Weather system
    weather: {
        current: null,
        intensity: 0,
        particles: [],
        
        start(type, intensity = 1) {
            this.current = type;
            this.intensity = intensity;
            
            // Stop current weather
            this.stop();
            
            // Start new weather
            if (type === 'snow') {
                this.particles = setInterval(() => {
                    ParticleSystem.createContinuousEffect(
                        0, 0,
                        'snow',
                        5 * intensity,
                        { width: window.innerWidth, height: 10 }
                    );
                }, 100);
            } else if (type === 'rain') {
                this.particles = setInterval(() => {
                    ParticleSystem.createContinuousEffect(
                        0, 0,
                        'rain',
                        15 * intensity,
                        { width: window.innerWidth, height: 10 }
                    );
                }, 50);
            } else if (type === 'leaf') {
                this.particles = setInterval(() => {
                    ParticleSystem.createContinuousEffect(
                        0, 0,
                        'leaf',
                        3 * intensity,
                        { width: window.innerWidth, height: 10 }
                    );
                }, 200);
            }
        },
        
        stop() {
            if (this.particles) {
                clearInterval(this.particles);
                this.particles = null;
            }
            this.current = null;
            this.intensity = 0;
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
