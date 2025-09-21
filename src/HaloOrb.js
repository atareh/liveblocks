import * as THREE from 'three';

export class HaloOrb {
    constructor(scene, theme) {
        this.scene = scene;
        this.theme = theme;
        this.group = new THREE.Group();
        
        // Core orb properties
        this.orbRadius = 1.5;
        this.particleCount = 2000;
        this.ringCount = 3;
        
        // Animation properties
        this.time = 0;
        this.pulseIntensity = 0;
        
        this.createCoreOrb();
        this.createParticleSystem();
        this.createEnergyRings();
        this.createGlow();
        
        this.scene.add(this.group);
    }

    createCoreOrb() {
        // Main orb geometry
        const geometry = new THREE.SphereGeometry(this.orbRadius, 64, 64);
        
        // Create custom material with vertex shader for dynamic effects
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                primaryColor: { value: new THREE.Color(this.theme.primaryColor) },
                secondaryColor: { value: new THREE.Color(this.theme.secondaryColor) },
                pulseIntensity: { value: 0 }
            },
            vertexShader: `
                uniform float time;
                uniform float pulseIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vUv = uv;
                    
                    // Add subtle vertex displacement for organic feel
                    vec3 pos = position;
                    pos += normal * sin(time * 2.0 + position.x * 5.0) * 0.02;
                    pos += normal * sin(time * 3.0 + position.y * 4.0) * 0.015;
                    pos += normal * pulseIntensity * 0.1;
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 primaryColor;
                uniform vec3 secondaryColor;
                uniform float pulseIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    // Fresnel effect for rim lighting
                    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    
                    // Animated energy patterns
                    float pattern1 = sin(time * 2.0 + vPosition.x * 10.0) * 0.5 + 0.5;
                    float pattern2 = sin(time * 1.5 + vPosition.y * 8.0) * 0.5 + 0.5;
                    float energyPattern = pattern1 * pattern2;
                    
                    // Color mixing
                    vec3 color = mix(primaryColor, secondaryColor, energyPattern);
                    color = mix(color, primaryColor * 2.0, fresnel);
                    
                    // Add pulse effect
                    color += primaryColor * pulseIntensity * 0.5;
                    
                    // Add some transparency based on viewing angle
                    float alpha = 0.8 + fresnel * 0.2;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.coreOrb = new THREE.Mesh(geometry, material);
        this.group.add(this.coreOrb);
    }

    createParticleSystem() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const velocities = new Float32Array(this.particleCount * 3);
        const lifetimes = new Float32Array(this.particleCount);
        
        const primaryColor = new THREE.Color(this.theme.primaryColor);
        const secondaryColor = new THREE.Color(this.theme.secondaryColor);
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Create particles in various formations
            const formationType = Math.random();
            
            if (formationType < 0.4) {
                // Spherical distribution around orb
                const radius = this.orbRadius + Math.random() * 3;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i3 + 2] = radius * Math.cos(phi);
            } else if (formationType < 0.7) {
                // Ring formations
                const ringRadius = 2 + Math.random() * 2;
                const angle = Math.random() * Math.PI * 2;
                const height = (Math.random() - 0.5) * 0.5;
                
                positions[i3] = ringRadius * Math.cos(angle);
                positions[i3 + 1] = height;
                positions[i3 + 2] = ringRadius * Math.sin(angle);
            } else {
                // Spiral formations
                const t = Math.random() * Math.PI * 4;
                const radius = 1 + t * 0.1;
                
                positions[i3] = radius * Math.cos(t);
                positions[i3 + 1] = t * 0.2 - 2;
                positions[i3 + 2] = radius * Math.sin(t);
            }
            
            // Particle velocities for movement
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Color variation
            const colorMix = Math.random();
            const color = primaryColor.clone().lerp(secondaryColor, colorMix);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Size and lifetime
            sizes[i] = Math.random() * 3 + 1;
            lifetimes[i] = Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Store additional attributes for animation
        this.particleVelocities = velocities;
        this.particleLifetimes = lifetimes;
        this.particleInitialPositions = positions.slice();
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Animated size based on time and distance
                    float animatedSize = size * (1.0 + sin(time * 3.0 + position.x + position.y) * 0.3);
                    
                    gl_PointSize = animatedSize * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                
                void main() {
                    vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, textureColor.a * 0.8);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.group.add(this.particles);
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createEnergyRings() {
        this.energyRings = [];
        
        for (let i = 0; i < this.ringCount; i++) {
            const radius = 2.5 + i * 0.8;
            const geometry = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
            
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    ringColor: { value: new THREE.Color(this.theme.primaryColor) },
                    opacity: { value: 0.6 - i * 0.15 }
                },
                vertexShader: `
                    uniform float time;
                    varying vec2 vUv;
                    
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        
                        // Rotate the ring
                        float angle = time * (0.5 + float(${i}) * 0.2);
                        pos.x = position.x * cos(angle) - position.z * sin(angle);
                        pos.z = position.x * sin(angle) + position.z * cos(angle);
                        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 ringColor;
                    uniform float opacity;
                    uniform float time;
                    varying vec2 vUv;
                    
                    void main() {
                        float intensity = sin(time * 2.0 + vUv.x * 10.0) * 0.3 + 0.7;
                        gl_FragColor = vec4(ringColor * intensity, opacity);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            ring.rotation.y = Math.random() * Math.PI;
            
            this.energyRings.push(ring);
            this.group.add(ring);
        }
    }

    createGlow() {
        const geometry = new THREE.SphereGeometry(this.orbRadius * 2, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(this.theme.primaryColor) }
            },
            vertexShader: `
                uniform float time;
                varying vec3 vNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float time;
                varying vec3 vNormal;
                
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    intensity *= (sin(time * 2.0) * 0.2 + 0.8);
                    gl_FragColor = vec4(glowColor, intensity * 0.3);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        this.glow = new THREE.Mesh(geometry, material);
        this.group.add(this.glow);
    }

    updateTheme(newTheme) {
        this.theme = newTheme;
        
        // Update core orb colors
        this.coreOrb.material.uniforms.primaryColor.value.setHex(newTheme.primaryColor);
        this.coreOrb.material.uniforms.secondaryColor.value.setHex(newTheme.secondaryColor);
        
        // Update particle colors
        const colors = this.particles.geometry.attributes.color;
        const primaryColor = new THREE.Color(newTheme.primaryColor);
        const secondaryColor = new THREE.Color(newTheme.secondaryColor);
        
        for (let i = 0; i < colors.count; i++) {
            const colorMix = Math.random();
            const color = primaryColor.clone().lerp(secondaryColor, colorMix);
            colors.setXYZ(i, color.r, color.g, color.b);
        }
        colors.needsUpdate = true;
        
        // Update energy rings
        this.energyRings.forEach(ring => {
            ring.material.uniforms.ringColor.value.setHex(newTheme.primaryColor);
        });
        
        // Update glow
        this.glow.material.uniforms.glowColor.value.setHex(newTheme.primaryColor);
    }

    update() {
        this.time += 0.016; // ~60fps
        
        // Update core orb
        this.coreOrb.material.uniforms.time.value = this.time;
        this.pulseIntensity = Math.sin(this.time * 2) * 0.5 + 0.5;
        this.coreOrb.material.uniforms.pulseIntensity.value = this.pulseIntensity;
        
        // Rotate the core orb
        this.coreOrb.rotation.y += 0.005;
        this.coreOrb.rotation.x += 0.002;
        
        // Update particles
        this.particles.material.uniforms.time.value = this.time;
        
        const positions = this.particles.geometry.attributes.position;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Update lifetime and reset particles
            this.particleLifetimes[i] += 0.005;
            if (this.particleLifetimes[i] > 1) {
                this.particleLifetimes[i] = 0;
                // Reset to initial position with some variation
                positions.setXYZ(
                    i,
                    this.particleInitialPositions[i3] + (Math.random() - 0.5) * 0.5,
                    this.particleInitialPositions[i3 + 1] + (Math.random() - 0.5) * 0.5,
                    this.particleInitialPositions[i3 + 2] + (Math.random() - 0.5) * 0.5
                );
            } else {
                // Move particles
                positions.setXYZ(
                    i,
                    positions.getX(i) + this.particleVelocities[i3],
                    positions.getY(i) + this.particleVelocities[i3 + 1],
                    positions.getZ(i) + this.particleVelocities[i3 + 2]
                );
            }
        }
        positions.needsUpdate = true;
        
        // Update energy rings
        this.energyRings.forEach((ring, index) => {
            ring.material.uniforms.time.value = this.time;
            ring.rotation.z += 0.01 * (index + 1);
        });
        
        // Update glow
        this.glow.material.uniforms.time.value = this.time;
        
        // Rotate the entire group slightly
        this.group.rotation.y += 0.002;
    }
}
