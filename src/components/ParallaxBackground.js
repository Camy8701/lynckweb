import React, { useEffect, useRef } from 'react';

const ParallaxBackground = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const shapesRef = useRef([]);
  const parallaxGroupsRef = useRef([]);
  const scrollYRef = useRef(0);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  useEffect(() => {
    let THREE;
    
    const initThree = async () => {
      // Import Three.js dynamically
      try {
        THREE = await import('https://esm.sh/three@0.160.0');
      } catch (error) {
        console.log('Three.js not loaded, using fallback');
        return;
      }

      if (!THREE || !canvasRef.current) return;

      // Scene setup
      sceneRef.current = new THREE.Scene();
      cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      rendererRef.current = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        alpha: true, 
        antialias: true 
      });
      
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setClearColor(0x000000, 0);

      // Camera position
      cameraRef.current.position.z = 15;

      // Parallax groups for different layer speeds
      parallaxGroupsRef.current = [
        new THREE.Group(), // Foreground - fastest
        new THREE.Group(), // Mid-ground
        new THREE.Group(), // Background - slowest
      ];

      parallaxGroupsRef.current.forEach(group => sceneRef.current.add(group));

      // Materials - bright colorful wireframes
      const colorfulMaterials = [
        new THREE.MeshBasicMaterial({ 
          color: 0xff0066, // Hot Pink
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ff88, // Bright Green
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x3366ff, // Electric Blue
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0xff6600, // Bright Orange
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0xffff00, // Bright Yellow
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0xff0099, // Magenta
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ffff, // Cyan
          wireframe: true,
          transparent: true,
          opacity: 0.6
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x9900ff, // Purple
          wireframe: true,
          transparent: true,
          opacity: 0.6
        })
      ];

      const dustMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x71717a, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
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
      shapesRef.current = [];
      const shapeTypes = ['sphere', 'box', 'octahedron', 'tetrahedron', 'torus'];

      // Layer 1 - Foreground (fastest parallax)
      for(let i = 0; i < 15; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const material = colorfulMaterials[Math.floor(Math.random() * colorfulMaterials.length)];
        const shape = createGeometry(type, Math.random() * 0.8 + 0.4, material);
        
        shape.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 25,
          Math.random() * 8 + 3
        );
        
        shape.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        parallaxGroupsRef.current[0].add(shape);
        shapesRef.current.push({ 
          mesh: shape, 
          layer: 0, 
          speed: Math.random() * 0.4 + 0.6,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          initialY: shape.position.y
        });
      }

      // Layer 2 - Mid-ground
      for(let i = 0; i < 20; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const material = colorfulMaterials[Math.floor(Math.random() * colorfulMaterials.length)];
        const shape = createGeometry(type, Math.random() * 1.0 + 0.6, material);
        
        shape.position.set(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 35,
          Math.random() * 10 - 5
        );
        
        shape.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        parallaxGroupsRef.current[1].add(shape);
        shapesRef.current.push({ 
          mesh: shape, 
          layer: 1, 
          speed: Math.random() * 0.3 + 0.3,
          rotationSpeed: (Math.random() - 0.5) * 0.015,
          initialY: shape.position.y
        });
      }

      // Layer 3 - Background (slowest parallax)
      for(let i = 0; i < 25; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const material = dustMaterial;
        const shape = createGeometry(type, Math.random() * 1.5 + 0.4, material);
        
        shape.position.set(
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 50,
          Math.random() * 15 - 15
        );
        
        shape.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        parallaxGroupsRef.current[2].add(shape);
        shapesRef.current.push({ 
          mesh: shape, 
          layer: 2, 
          speed: Math.random() * 0.2 + 0.1,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          initialY: shape.position.y
        });
      }

      // Mouse movement handler
      const handleMouseMove = (event) => {
        mouseXRef.current = (event.clientX / window.innerWidth) * 2 - 1;
        mouseYRef.current = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      // Scroll handler
      const handleScroll = () => {
        scrollYRef.current = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      };

      document.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('scroll', handleScroll);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        // Parallax movement based on scroll
        if (parallaxGroupsRef.current[0]) {
          parallaxGroupsRef.current[0].position.y = scrollYRef.current * 15;
          parallaxGroupsRef.current[1].position.y = scrollYRef.current * 10;
          parallaxGroupsRef.current[2].position.y = scrollYRef.current * 5;
        }

        // Mouse parallax
        if (parallaxGroupsRef.current[0]) {
          parallaxGroupsRef.current[0].rotation.x = mouseYRef.current * 0.05;
          parallaxGroupsRef.current[0].rotation.y = mouseXRef.current * 0.05;
          parallaxGroupsRef.current[1].rotation.x = mouseYRef.current * 0.03;
          parallaxGroupsRef.current[1].rotation.y = mouseXRef.current * 0.03;
          parallaxGroupsRef.current[2].rotation.x = mouseYRef.current * 0.01;
          parallaxGroupsRef.current[2].rotation.y = mouseXRef.current * 0.01;
        }

        // Individual shape animations
        shapesRef.current.forEach((shapeData) => {
          const { mesh, speed, rotationSpeed } = shapeData;
          
          // Rotation
          mesh.rotation.x += rotationSpeed;
          mesh.rotation.y += rotationSpeed * 0.8;
          mesh.rotation.z += rotationSpeed * 0.5;
          
          // Floating motion
          mesh.position.y += Math.sin(Date.now() * 0.0005 + mesh.position.x) * 0.01;
          
          // Wrap around effect
          if (mesh.position.y < -30) {
            mesh.position.y = 30;
          } else if (mesh.position.y > 30) {
            mesh.position.y = -30;
          }
        });

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        
        shapesRef.current.forEach(({ mesh }) => {
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) mesh.material.dispose();
        });
      };
    };

    initThree();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        opacity: 0.7
      }}
    />
  );
};

export default ParallaxBackground;