export const SoldierThemes = {
    spartan: {
        name: 'Spartan',
        primaryColor: 0x0099ff,      // Master Chief blue
        secondaryColor: 0xff6600,    // Orange energy
        backgroundColor: 0x001133,   // Deep blue space
        description: "Master Chief's iconic blue and orange energy signature with UNSC particle effects.",
        particleIntensity: 1.0,
        glowIntensity: 0.8,
        ringSpeed: 1.0
    },
    
    covenant: {
        name: 'Covenant',
        primaryColor: 0x9900ff,      // Purple plasma
        secondaryColor: 0xff0099,    // Pink energy
        backgroundColor: 0x330033,   // Dark purple
        description: "Alien plasma technology with ethereal purple and pink energy patterns.",
        particleIntensity: 1.2,
        glowIntensity: 1.0,
        ringSpeed: 0.7
    },
    
    forerunner: {
        name: 'Forerunner',
        primaryColor: 0x00ffcc,      // Cyan/teal
        secondaryColor: 0xffffff,    // Pure white
        backgroundColor: 0x002244,   // Deep teal
        description: "Ancient Forerunner hard-light technology with crystalline cyan and white harmonics.",
        particleIntensity: 0.8,
        glowIntensity: 1.2,
        ringSpeed: 1.5
    },
    
    flood: {
        name: 'Flood',
        primaryColor: 0x88ff00,      // Sickly green
        secondaryColor: 0xffff00,    // Toxic yellow
        backgroundColor: 0x221100,   // Dark brown/green
        description: "Corrupted biomass energy with infectious green and yellow spore-like particles.",
        particleIntensity: 1.5,
        glowIntensity: 0.6,
        ringSpeed: 2.0
    }
};

// Additional theme configurations for advanced effects
export const ThemeEffects = {
    spartan: {
        particleMovement: 'orbital',
        specialEffect: 'shield_flare',
        soundProfile: 'tech_hum',
        energyPattern: 'stable'
    },
    
    covenant: {
        particleMovement: 'flowing',
        specialEffect: 'plasma_burst',
        soundProfile: 'alien_resonance',
        energyPattern: 'pulsing'
    },
    
    forerunner: {
        particleMovement: 'geometric',
        specialEffect: 'hard_light_construct',
        soundProfile: 'harmonic_tone',
        energyPattern: 'crystalline'
    },
    
    flood: {
        particleMovement: 'chaotic',
        specialEffect: 'spore_explosion',
        soundProfile: 'organic_writhing',
        energyPattern: 'infected'
    }
};

// Color utilities for theme transitions
export class ThemeTransition {
    static interpolateColor(color1, color2, factor) {
        const c1 = {
            r: (color1 >> 16) & 255,
            g: (color1 >> 8) & 255,
            b: color1 & 255
        };
        
        const c2 = {
            r: (color2 >> 16) & 255,
            g: (color2 >> 8) & 255,
            b: color2 & 255
        };
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return (r << 16) | (g << 8) | b;
    }
    
    static createGradientTheme(theme1, theme2, steps = 10) {
        const gradientThemes = [];
        
        for (let i = 0; i <= steps; i++) {
            const factor = i / steps;
            gradientThemes.push({
                primaryColor: this.interpolateColor(theme1.primaryColor, theme2.primaryColor, factor),
                secondaryColor: this.interpolateColor(theme1.secondaryColor, theme2.secondaryColor, factor),
                backgroundColor: this.interpolateColor(theme1.backgroundColor, theme2.backgroundColor, factor),
                particleIntensity: theme1.particleIntensity + (theme2.particleIntensity - theme1.particleIntensity) * factor,
                glowIntensity: theme1.glowIntensity + (theme2.glowIntensity - theme1.glowIntensity) * factor,
                ringSpeed: theme1.ringSpeed + (theme2.ringSpeed - theme1.ringSpeed) * factor
            });
        }
        
        return gradientThemes;
    }
}

// Special themed particle behaviors
export const ParticleBehaviors = {
    spartan: {
        formation: 'shield_dome',
        movement: (particle, time, index) => {
            // Orbital movement around the orb
            const radius = 2 + Math.sin(time + index * 0.1) * 0.5;
            const angle = time * 0.5 + index * 0.628;
            return {
                x: radius * Math.cos(angle),
                y: Math.sin(time * 2 + index * 0.1) * 0.3,
                z: radius * Math.sin(angle)
            };
        }
    },
    
    covenant: {
        formation: 'plasma_stream',
        movement: (particle, time, index) => {
            // Flowing, organic movement
            const flow = time * 0.3 + index * 0.1;
            return {
                x: particle.x + Math.sin(flow) * 0.02,
                y: particle.y + Math.cos(flow * 1.3) * 0.02,
                z: particle.z + Math.sin(flow * 0.7) * 0.02
            };
        }
    },
    
    forerunner: {
        formation: 'geometric_lattice',
        movement: (particle, time, index) => {
            // Precise, geometric patterns
            const phase = time + index * 0.314;
            const precision = Math.sin(phase) * 0.01;
            return {
                x: particle.x + precision,
                y: particle.y + Math.cos(phase * 2) * 0.01,
                z: particle.z + precision
            };
        }
    },
    
    flood: {
        formation: 'chaotic_swarm',
        movement: (particle, time, index) => {
            // Chaotic, unpredictable movement
            const chaos1 = Math.sin(time * 3 + index * 0.7) * 0.05;
            const chaos2 = Math.cos(time * 2.3 + index * 0.4) * 0.04;
            const chaos3 = Math.sin(time * 1.7 + index * 0.9) * 0.03;
            return {
                x: particle.x + chaos1,
                y: particle.y + chaos2,
                z: particle.z + chaos3
            };
        }
    }
};
