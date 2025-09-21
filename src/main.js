import * as THREE from 'three';
import { HaloOrb } from './HaloOrb.js';
import { SoldierThemes } from './SoldierThemes.js';

class HaloOrbApp {
    constructor() {
        this.canvas = document.getElementById('three-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.haloOrb = null;
        this.controls = null;
        this.currentTheme = 'spartan';
        this.unicornScene = null;
        
        // Mouse/touch interaction
        this.mouse = new THREE.Vector2();
        this.isMouseDown = false;
        this.mouseDownPos = new THREE.Vector2();
        this.cameraRotation = { x: 0, y: 0 };
        this.targetCameraRotation = { x: 0, y: 0 };
        this.cameraDistance = 8;
        this.targetCameraDistance = 8;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.createHaloOrb();
        this.initUnicornStudio();
        this.setupEventListeners();
        this.hideLoading();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        
        // Create a dynamic background
        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: SoldierThemes.spartan.backgroundColor,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.1
        });
        this.backgroundSphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.backgroundSphere);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, this.cameraDistance);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point lights for dramatic effect
        this.pointLight1 = new THREE.PointLight(SoldierThemes.spartan.primaryColor, 2, 20);
        this.pointLight1.position.set(3, 0, 3);
        this.scene.add(this.pointLight1);

        this.pointLight2 = new THREE.PointLight(SoldierThemes.spartan.secondaryColor, 1.5, 15);
        this.pointLight2.position.set(-3, 2, -2);
        this.scene.add(this.pointLight2);
    }

    setupControls() {
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.onTouchEnd());

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    createHaloOrb() {
        // Create the halo orb but without the central orb (only particles and effects)
        this.haloOrb = new HaloOrb(this.scene, SoldierThemes.spartan, true); // true = no central orb
    }

    async initUnicornStudio() {
        try {
            // Initialize Unicorn Studio with the star scene
            this.unicornScene = await window.UnicornStudio.addScene({
                elementId: "unicorn-container",
                fps: 60,
                scale: 1,
                dpi: 1.5,
                filePath: "/unicorn-star.json", // Using our local JSON file
                lazyLoad: false,
                altText: "Unicorn Studio Star Animation",
                ariaLabel: "3D animated star with effects",
                interactivity: {
                    mouse: {
                        disableMobile: false,
                        disabled: false
                    }
                }
            });
            
            console.log('Unicorn Studio scene initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Unicorn Studio:', error);
        }
    }

    setupEventListeners() {
        // Soldier selection
        const soldierButtons = document.querySelectorAll('.soldier-btn');
        soldierButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.changeSoldierTheme(btn.dataset.soldier);
                
                // Update active button
                soldierButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    changeSoldierTheme(themeName) {
        this.currentTheme = themeName;
        const theme = SoldierThemes[themeName];
        
        if (this.haloOrb) {
            this.haloOrb.updateTheme(theme);
        }

        // Update background
        this.backgroundSphere.material.color.setHex(theme.backgroundColor);

        // Update lights
        this.pointLight1.color.setHex(theme.primaryColor);
        this.pointLight2.color.setHex(theme.secondaryColor);

        // Update UI
        const themeTitle = document.querySelector('#info-panel h3');
        const themeDesc = document.getElementById('theme-description');
        themeTitle.textContent = `Unicorn Star + ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`;
        themeDesc.textContent = `3D animated star with ${theme.description.toLowerCase()}`;
    }

    // Mouse/Touch Event Handlers
    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseDownPos.set(event.clientX, event.clientY);
    }

    onMouseMove(event) {
        if (!this.isMouseDown) return;

        const deltaX = event.clientX - this.mouseDownPos.x;
        const deltaY = event.clientY - this.mouseDownPos.y;

        this.targetCameraRotation.y += deltaX * 0.01;
        this.targetCameraRotation.x += deltaY * 0.01;
        this.targetCameraRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetCameraRotation.x));

        this.mouseDownPos.set(event.clientX, event.clientY);
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onWheel(event) {
        this.targetCameraDistance += event.deltaY * 0.01;
        this.targetCameraDistance = Math.max(3, Math.min(15, this.targetCameraDistance));
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.isMouseDown = true;
            this.mouseDownPos.set(event.touches[0].clientX, event.touches[0].clientY);
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        if (!this.isMouseDown || event.touches.length !== 1) return;

        const deltaX = event.touches[0].clientX - this.mouseDownPos.x;
        const deltaY = event.touches[0].clientY - this.mouseDownPos.y;

        this.targetCameraRotation.y += deltaX * 0.01;
        this.targetCameraRotation.x += deltaY * 0.01;
        this.targetCameraRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetCameraRotation.x));

        this.mouseDownPos.set(event.touches[0].clientX, event.touches[0].clientY);
    }

    onTouchEnd() {
        this.isMouseDown = false;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }

    updateCamera() {
        // Smooth camera rotation
        this.cameraRotation.x += (this.targetCameraRotation.x - this.cameraRotation.x) * 0.05;
        this.cameraRotation.y += (this.targetCameraRotation.y - this.cameraRotation.y) * 0.05;
        
        // Smooth camera distance
        this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.05;

        // Update camera position
        const x = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * this.cameraDistance;
        const y = Math.sin(this.cameraRotation.x) * this.cameraDistance;
        const z = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * this.cameraDistance;

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updateCamera();
        
        if (this.haloOrb) {
            this.haloOrb.update();
        }

        // Animate lights
        const time = Date.now() * 0.001;
        this.pointLight1.position.x = Math.cos(time * 0.5) * 4;
        this.pointLight1.position.z = Math.sin(time * 0.5) * 4;
        
        this.pointLight2.position.x = Math.cos(time * 0.3 + Math.PI) * 3;
        this.pointLight2.position.z = Math.sin(time * 0.3 + Math.PI) * 3;

        this.renderer.render(this.scene, this.camera);
    }
}

// Start the application
new HaloOrbApp();
