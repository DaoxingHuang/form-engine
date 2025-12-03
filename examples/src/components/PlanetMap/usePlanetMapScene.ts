import * as TWEEN from "@tweenjs/tween.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePlanetMapStore } from "./usePlanetMapStore";

export function usePlanetMapScene(containerRef: { current: HTMLDivElement | null }) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const animRef = useRef<number | null>(null);

  // Animation state refs
  const spinSpeedRef = useRef<number>(0);

  const { visibleUsers, getCachedTexture, setCachedTexture, state } = usePlanetMapStore();

  // Config
  const CONFIG = {
    radius: 600,
    cardWidth: 60,
    cardHeight: 35,
    spinSpeedMax: 0.08,
    spinAccel: 0.001
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Init Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.0008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1200;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 1, 2000);
    pointLight.position.set(500, 500, 500);
    scene.add(pointLight);

    // Planet Group
    const planetGroup = new THREE.Group();
    planetGroupRef.current = planetGroup;
    scene.add(planetGroup);

    // Core
    const coreGeometry = new THREE.SphereGeometry(CONFIG.radius - 20, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x001133,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    planetGroup.add(core);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = 0; i < 1000; i++) {
      verts.push(
        THREE.MathUtils.randFloatSpread(4000),
        THREE.MathUtils.randFloatSpread(4000),
        THREE.MathUtils.randFloatSpread(4000)
      );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x888888, size: 2 })));

    // Resize handler
    const onResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    const animate = (time?: number) => {
      animRef.current = requestAnimationFrame(animate);
      (TWEEN as any).update(time);

      // Use current state from ref
      const currentState = usePlanetMapStore.getState().state;

      // Spin logic
      if (currentState === "SPINNING") {
        if (spinSpeedRef.current < CONFIG.spinSpeedMax) {
          spinSpeedRef.current += CONFIG.spinAccel;
        }
      } else if (currentState === "PAUSED") {
        spinSpeedRef.current = 0;
      } else if (currentState === "STOPPING") {
        // Handled by Tween, no physics spin
        spinSpeedRef.current = 0;
      } else {
        // IDLE or others
        spinSpeedRef.current = 0.002;
      }

      if (currentState !== "RESULT" && planetGroupRef.current) {
        planetGroupRef.current.rotation.y -= spinSpeedRef.current;
        planetGroupRef.current.rotation.x = Math.sin((time || 0) * 0.0005) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]); // Re-run if container changes (should be stable)

  // Sync state ref for animation loop if needed, but we used store state directly in render loop?
  // Actually `state` from store is a constant in the closure of the effect if we don't add it to deps.
  // But we can't add `state` to deps of init effect or it will recreate scene.
  // So we should use a ref for state or access store directly.
  // Let's use a ref to track state for the animation loop.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // We need to patch the animate loop to use stateRef
  // I'll do a quick fix by re-implementing the loop inside a useEffect that depends on nothing but uses refs.
  // Actually, the previous useEffect has `state` in closure which is stale.
  // I should move the animate function out or use refs.
  // Let's rewrite the animate loop part in a separate effect or use refs.

  // Better: use a ref for the animate loop callback.

  // Let's fix the previous useEffect. I will overwrite the file content anyway.

  // Helper: Create Texture
  function lazyCreateTexture(user: any) {
    const cached = getCachedTexture(user.id);
    if (cached) return cached;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 140;
    const ctx = canvas.getContext("2d")!;

    // Gradient bg
    const gradient = ctx.createLinearGradient(0, 0, 256, 140);
    gradient.addColorStop(0, "rgba(20, 30, 80, 0.9)");
    gradient.addColorStop(1, "rgba(40, 10, 60, 0.9)");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
    ctx.lineWidth = 4;

    // Round rect
    ctx.beginPath();
    const r = 15;
    ctx.moveTo(5 + r, 5);
    ctx.arcTo(5 + 246, 5, 5 + 246, 5 + 130, r);
    ctx.arcTo(5 + 246, 5 + 130, 5, 5 + 130, r);
    ctx.arcTo(5, 5 + 130, 5, 5, r);
    ctx.arcTo(5, 5, 5 + 246, 5, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Avatar circle
    const avatarX = 60;
    const avatarY = 70;
    const avatarRadius = 35;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fillStyle = user.avatarColor;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // White user icon
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(avatarX, avatarY - 10, 12, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY + 15, 20, Math.PI * 1.1, Math.PI * 1.9); // Body
    ctx.fill();

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.fillText(user.name, 110, 70);
    ctx.fillStyle = "#aaddff";
    ctx.font = "24px Arial";
    ctx.fillText(user.dept, 110, 105);

    setCachedTexture(user.id, canvas);
    return canvas;
  }

  // Update Cards (when visibleUsers changes)
  useEffect(() => {
    if (!planetGroupRef.current || visibleUsers.length === 0) return;

    // If cards array is empty, create them. If not, update textures.
    // planet.html reuses meshes and just updates textures.

    const phi = Math.PI * (3 - Math.sqrt(5));

    // Ensure we have enough meshes
    if (cardsRef.current.length !== visibleUsers.length) {
      // Clear old
      cardsRef.current.forEach((c) => {
        c.geometry.dispose();
        if ((c.material as any).map) (c.material as any).map.dispose();
        planetGroupRef.current?.remove(c);
      });
      cardsRef.current = [];

      // Create new
      visibleUsers.forEach((user, i) => {
        const y = 1 - (i / (visibleUsers.length - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        const position = new THREE.Vector3(x, y, z).multiplyScalar(CONFIG.radius);

        const geometry = new THREE.PlaneGeometry(CONFIG.cardWidth, CONFIG.cardHeight);
        const canvas = lazyCreateTexture(user);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });

        const card = new THREE.Mesh(geometry, material);
        card.position.copy(position);
        card.lookAt(0, 0, 0);
        // @ts-ignore
        card.userData = { id: user.id, data: user, originalPos: position.clone() };

        planetGroupRef.current?.add(card);
        cardsRef.current.push(card);
      });
    } else {
      // Update existing
      visibleUsers.forEach((user, i) => {
        const card = cardsRef.current[i];
        if (!card) return;

        const canvas = lazyCreateTexture(user);
        const texture = new THREE.CanvasTexture(canvas);

        const mat = card.material as THREE.MeshBasicMaterial;
        if (mat.map) mat.map.dispose();
        mat.map = texture;
        mat.needsUpdate = true;

        // @ts-ignore
        card.userData.data = user;
        // @ts-ignore
        card.userData.id = user.id;
      });
    }
  }, [visibleUsers]);

  // Stop Lottery Logic
  function stopLottery(onComplete: (winner: any) => void) {
    if (!planetGroupRef.current || cardsRef.current.length === 0) return;

    // Pick random winner from visible cards
    const winnerIndex = Math.floor(Math.random() * cardsRef.current.length);
    const winnerCard = cardsRef.current[winnerIndex];
    // @ts-ignore
    const winnerData = winnerCard.userData.data;
    const winnerPos = winnerCard.position.clone();

    // Calculate rotation
    const targetCardAngle = Math.atan2(winnerPos.x, winnerPos.z);
    const currentPlanetRotationY = planetGroupRef.current.rotation.y;
    const TWO_PI = Math.PI * 2;
    const extraSpins = 1;

    let targetOffset = -targetCardAngle % TWO_PI;
    if (targetOffset < 0) targetOffset += TWO_PI;

    let currentRemainder = currentPlanetRotationY % TWO_PI;
    if (currentRemainder < 0) currentRemainder += TWO_PI;

    let rotationDifference = targetOffset - currentRemainder;
    if (rotationDifference > 0) rotationDifference -= TWO_PI;

    const finalTargetY = currentPlanetRotationY + rotationDifference - extraSpins * TWO_PI;

    // Tween
    new (TWEEN as any).Tween(planetGroupRef.current.rotation)
      .to({ y: finalTargetY }, 2000)
      .easing((TWEEN as any).Easing.Exponential.Out)
      .onComplete(() => {
        // Move camera
        const targetPos = new THREE.Vector3();
        winnerCard.getWorldPosition(targetPos);
        const cameraEndPos = targetPos
          .clone()
          .normalize()
          .multiplyScalar(CONFIG.radius + 200);

        if (cameraRef.current) {
          new (TWEEN as any).Tween(cameraRef.current.position)
            .to({ x: cameraEndPos.x, y: cameraEndPos.y, z: cameraEndPos.z }, 1000)
            .easing((TWEEN as any).Easing.Quadratic.InOut)
            .onUpdate(() => {
              cameraRef.current?.lookAt(targetPos);
            })
            .onComplete(() => {
              highlightWinner(winnerCard);
              setTimeout(() => {
                onComplete(winnerData);
              }, 1500);
            })
            .start();
        }
      })
      .start();
  }

  function highlightWinner(card: THREE.Mesh) {
    createExplosion(card.getWorldPosition(new THREE.Vector3()));

    const glowGeo = new THREE.PlaneGeometry(CONFIG.cardWidth * 1.5, CONFIG.cardHeight * 2.5);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -1;
    card.add(glow);

    new (TWEEN as any).Tween(glowMat)
      .to({ opacity: 0.8 }, 100)
      .onComplete(() => {
        new (TWEEN as any).Tween(glowMat)
          .to({ opacity: 0 }, 1400)
          .onComplete(() => {
            card.remove(glow);
          })
          .start();
      })
      .start();
  }

  function createExplosion(position: THREE.Vector3) {
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const velocities: number[] = [];
    const colors: number[] = [];
    const themeColors = [
      new THREE.Color("#ff7eb3"),
      new THREE.Color("#78ffd6"),
      new THREE.Color("#f6d365"),
      new THREE.Color("#ffffff")
    ];

    for (let i = 0; i < particleCount; i++) {
      positions.push(position.x, position.y, position.z);
      velocities.push((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
      const c = themeColors[Math.floor(Math.random() * themeColors.length)];
      colors.push(c.r, c.g, c.b);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 6,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(geometry, material);
    sceneRef.current?.add(particles);

    const velCopy = velocities.slice();
    const animateParticles = () => {
      const posAttr = particles.geometry.attributes.position.array as unknown as number[];
      for (let i = 0; i < particleCount; i++) {
        posAttr[i * 3] += velCopy[i * 3];
        posAttr[i * 3 + 1] += velCopy[i * 3 + 1];
        posAttr[i * 3 + 2] += velCopy[i * 3 + 2];
        velCopy[i * 3 + 1] -= 0.1; // gravity
      }
      particles.geometry.attributes.position.needsUpdate = true;
      (material as any).opacity -= 0.015;
      if ((material as any).opacity > 0) requestAnimationFrame(animateParticles);
      else sceneRef.current?.remove(particles);
    };
    animateParticles();
  }

  function resetCamera() {
    if (!cameraRef.current) return;
    new (TWEEN as any).Tween(cameraRef.current.position)
      .to({ x: 0, y: 0, z: 1200 }, 1500)
      .easing((TWEEN as any).Easing.Quadratic.InOut)
      .onUpdate(() => cameraRef.current?.lookAt(0, 0, 0))
      .start();

    // Reset cards scale/children
    cardsRef.current.forEach((c) => {
      c.scale.set(1, 1, 1);
      c.children = []; // remove glow
    });
  }

  return {
    stopLottery,
    resetCamera
  };
}
