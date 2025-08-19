import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeParallaxBackground = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const shapesRef = useRef([]);
  const parallaxGroupsRef = useRef([]);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add canvas to DOM
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';

    // Three.js initialization
    const initThree = () => {
      if (!THREE) return;

      try {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Try to create WebGL renderer with fallback options
        const renderer = new THREE.WebGLRenderer({ 
          canvas: canvas, 
          alpha: true, 
          antialias: false, // Disable antialias to reduce WebGL load
          powerPreference: "low-power" // Use low-power GPU if available
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0a0a0a, 1);
        
        // Check for WebGL errors
        const gl = renderer.getContext();
        if (gl.getError() !== gl.NO_ERROR) {
          console.warn('WebGL error detected, disabling Three.js background');
          return;
        }

      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      // Camera position
      camera.position.z = 15;

      // Parallax groups for different layer speeds
      const parallaxGroups = [
        new THREE.Group(), // Foreground - fastest
        new THREE.Group(), // Mid-ground
        new THREE.Group(), // Background - slowest
      ];
      parallaxGroupsRef.current = parallaxGroups;

      parallaxGroups.forEach(group => scene.add(group));

      // Simplified materials to avoid WebGL shader issues
      const colors = [
        0xff0066, 0x00ff88, 0x3366ff, 0xff6600, 0xffff00, 0xff0099,
        0x00ffff, 0x9900ff, 0xff3300, 0x66ff00, 0x0099ff, 0xff9900
      ];
      
      const colorfulMaterials = colors.map(color => 
        new THREE.MeshBasicMaterial({ 
          color: color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        })
      );

      const dustMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x71717a, 
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });

      // Create geometric shapes
      function createGeometry(type, size, material) {
        let geometry;
        switch(type) {
          case 'sphere':
            geometry = new THREE.SphereGeometry(size, 16, 16);
            break;
          case 'box':
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
          case 'octahedron':
            geometry = new THREE.OctahedronGeometry(size);
            break;
          case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(size);
            break;
          case 'torus':
            geometry = new THREE.TorusGeometry(size, size * 0.3, 8, 16);
            break;
          default:
            geometry = new THREE.SphereGeometry(size, 12, 12);
        }
        return new THREE.Mesh(geometry, material);
      }

      // Populate parallax layers
      const shapes = [];
      const shapeTypes = ['sphere', 'box', 'octahedron', 'tetrahedron', 'torus'];

      // Layer 1 - Foreground (fastest parallax)
      for(let i = 0; i < 10; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const material = colorfulMaterials[Math.floor(Math.random() * colorfulMaterials.length)];
        const shape = createGeometry(type, Math.random() * 1.2 + 0.6, material);
        
        shape.position.set(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 35,
          Math.random() * 10 + 5
        );
        
        shape.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        parallaxGroups[0].add(shape);
        shapes.push({ 
          mesh: shape, 
          layer: 0, 
          speed: Math.random() * 0.6 + 0.9,
          rotationSpeed: (Math.random() - 0.5) * 0.025,
          initialY: shape.position.y
        });
      }

      // Layer 2 - Mid-ground
      for(let i = 0; i < 15; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const material = colorfulMaterials[Math.floor(Math.random() * colorfulMaterials.length)];
        const shape = createGeometry(type, Math.random() * 1.5 + 0.8, material);
        
        shape.position.set(
          (Math.random() - 0.5) * 70,
          (Math.random() - 0.5) * 45,
          Math.random() * 15 - 5
        );
        
        shape.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        parallaxGroups[1].add(shape);
        shapes.push({ 
          mesh: shape, 
          layer: 1, 
          speed: Math.random() * 0.4 + 0.5,
          rotationSpeed: (Math.random() - 0.5) * 0.018,
          initialY: shape.position.y
        });
      }

      // Layer 3 - Background (slowest parallax)
      for(let i = 0; i < 20; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const material = dustMaterial;
        const shape = createGeometry(type, Math.random() * 2.0 + 0.5, material);
        
        shape.position.set(
          (Math.random() - 0.5) * 90,
          (Math.random() - 0.5) * 60,
          Math.random() * 20 - 20
        );
        
        shape.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        parallaxGroups[2].add(shape);
        shapes.push({ 
          mesh: shape, 
          layer: 2, 
          speed: Math.random() * 0.25 + 0.15,
          rotationSpeed: (Math.random() - 0.5) * 0.012,
          initialY: shape.position.y
        });
      }

      shapesRef.current = shapes;

      // Scroll and mouse variables
      let scrollY = 0;
      let mouseX = 0;
      let mouseY = 0;

      // Mouse movement
      const handleMouseMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      document.addEventListener('mousemove', handleMouseMove);

      // Scroll tracking
      const handleScroll = () => {
        scrollY = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      };
      window.addEventListener('scroll', handleScroll);

      // Animation loop
      function animate() {
        animationIdRef.current = requestAnimationFrame(animate);

        // Parallax movement based on scroll
        if (parallaxGroups[0]) {
          parallaxGroups[0].position.y = scrollY * 25; // Fastest
          parallaxGroups[1].position.y = scrollY * 15; // Medium
          parallaxGroups[2].position.y = scrollY * 8;  // Slowest

          // Mouse parallax
          parallaxGroups[0].rotation.x = mouseY * 0.12;
          parallaxGroups[0].rotation.y = mouseX * 0.12;
          parallaxGroups[1].rotation.x = mouseY * 0.06;
          parallaxGroups[1].rotation.y = mouseX * 0.06;
          parallaxGroups[2].rotation.x = mouseY * 0.03;
          parallaxGroups[2].rotation.y = mouseX * 0.03;
        }

        // Individual shape animations
        shapes.forEach((shapeData) => {
          const { mesh, rotationSpeed } = shapeData;
          
          // Rotation
          mesh.rotation.x += rotationSpeed;
          mesh.rotation.y += rotationSpeed * 0.8;
          mesh.rotation.z += rotationSpeed * 0.5;
          
          // Floating motion
          mesh.position.y += Math.sin(Date.now() * 0.001 + mesh.position.x) * 0.015;
          
          // Wrap around effect for continuous scrolling
          if (mesh.position.y < -40) {
            mesh.position.y = 40;
          } else if (mesh.position.y > 40) {
            mesh.position.y = -40;
          }
        });

        renderer.render(scene, camera);
      }

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      animate();

      // Cleanup function
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        
        if (renderer) {
          renderer.dispose();
        }
        
        shapes.forEach(({ mesh }) => {
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) mesh.material.dispose();
        });
      };
      
    } catch (error) {
      console.warn('Three.js initialization failed:', error);
      // Gracefully handle Three.js failure
    }
    };

    initThree();
  }, []);

  return <canvas ref={canvasRef} />;
};

export default ThreeParallaxBackground;