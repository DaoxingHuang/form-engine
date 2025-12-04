import * as TWEEN from "@tweenjs/tween.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePlanetStarStore } from "./usePlanetStarStore";

const CARD_THEME_COLORS = [
  { border: "#42C2FF", background: "#254E70" },
  { border: "#B762FE", background: "#6A3B9E" },
  { border: "#C1FF72", background: "#709E3B" },
  { border: "#FF85E1", background: "#A14E87" }
];

export function usePlanetStarScene(containerRef: React.RefObject<HTMLDivElement | null>) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animRef = useRef<number | null>(null);
  const swapIntervalRef = useRef<number | null>(null);

  // Store
  const {
    visibleUsers,
    getCachedTexture,
    setCachedTexture,
    setCurrentWinner,
    config,
    allUsers,
    setVisibleUsers,
    clearTextureCache
  } = usePlanetStarStore();

  // 1. 初始化场景 / Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.0008);
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
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const pl = new THREE.PointLight(0x1dd1a1, 1, 2000);
    pl.position.set(500, 500, 500);
    scene.add(pl);

    // Planet Group
    const planetGroup = new THREE.Group();
    planetGroupRef.current = planetGroup;
    scene.add(planetGroup);

    // Core Sphere (Background)
    const coreGeo = new THREE.SphereGeometry(config.radius - 20, 32, 32);
    planetGroup.add(
      new THREE.Mesh(
        coreGeo,
        new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.05, side: THREE.BackSide })
      )
    );
    planetGroup.add(
      new THREE.Mesh(
        coreGeo,
        new THREE.MeshBasicMaterial({ color: 0x4834d4, wireframe: true, transparent: true, opacity: 0.2 })
      )
    );

    // Starfield
    createStarfield(scene);

    // Particles
    createMovingParticles(scene, config.particleCount);

    // Resize Handler
    const onResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    const animate = (time: number) => {
      animRef.current = requestAnimationFrame(animate);
      (TWEEN as any).update(time);

      const store = usePlanetStarStore.getState();
      const currentState = store.state;
      const currentConfig = store.config;

      let currentSpinSpeed = 0;

      if (currentState === "SPINNING") currentSpinSpeed = currentConfig.spinSpeedMax;
      else if (currentState === "IDLE") currentSpinSpeed = 0.002;
      else currentSpinSpeed = 0;

      if (currentState !== "RESULT" && planetGroupRef.current) {
        planetGroupRef.current.rotation.y -= currentSpinSpeed;
      }

      // Particle Animation
      if (particlesRef.current) {
        const particles = particlesRef.current;
        const pos = particles.geometry.attributes.position.array as Float32Array;
        const vels = particles.geometry.userData.vels;
        for (let i = 0; i < currentConfig.particleCount; i++) {
          pos[i * 3] += vels[i * 3] * 0.1;
          pos[i * 3 + 1] += vels[i * 3 + 1] * 0.1;
          if (pos[i * 3] > 2000) pos[i * 3] = -2000;
          if (pos[i * 3 + 1] > 2000) pos[i * 3 + 1] = -2000;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount

  // 2. 监听配置变化：重建粒子 / Watch Config: Rebuild Particles
  useEffect(() => {
    if (sceneRef.current) {
      createMovingParticles(sceneRef.current, config.particleCount);
    }
  }, [config.particleCount]);

  // 3. 监听配置变化：重建卡片 / Watch Config: Rebuild Cards
  // 当 cardScale, avatarSize, nicknameLimit, nicknameFontSize 变化时，需要重新生成纹理和卡片
  // 当 cardCount 变化时，需要调整 visibleUsers
  useEffect(() => {
    // 如果 cardCount 变了，更新 visibleUsers
    if (visibleUsers.length !== config.cardCount && allUsers.length > 0) {
      setVisibleUsers(allUsers.slice(0, config.cardCount));
      // visibleUsers 变化会触发下面的 useEffect 重建卡片
    }
  }, [config.cardCount, allUsers]);

  // 监听外观配置变化，清空缓存并强制刷新
  useEffect(() => {
    clearTextureCache();
    // 强制触发卡片重建 (通过 visibleUsers 依赖)
    // 这里其实 visibleUsers 没变，但我们需要重新 createCardTexture
    // 我们可以直接调用 rebuildCards
    rebuildCards();
  }, [config.cardScale, config.avatarSize, config.nicknameLimit, config.nicknameFontSize, config.cardWidth]);

  // 4. 创建/更新卡片 / Create or Update Cards
  useEffect(() => {
    rebuildCards();
  }, [visibleUsers]);

  const rebuildCards = () => {
    if (!planetGroupRef.current || visibleUsers.length === 0) return;

    // Clear existing cards
    cardsRef.current.forEach((c) => planetGroupRef.current?.remove(c));
    cardsRef.current = [];

    const phi = Math.PI * (3 - Math.sqrt(5));
    const users = visibleUsers.slice(0, config.cardCount);

    users.forEach((user, i) => {
      const y = 1 - (i / (users.length - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const pos = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(config.radius);

      let tex = getCachedTexture(user.id);
      if (!tex) {
        tex = createCardTexture(user);
        setCachedTexture(user.id, tex);
      }

      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(config.cardWidth * config.cardScale, config.cardHeight * config.cardScale),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true })
      );
      card.position.copy(pos);
      card.lookAt(pos.clone().multiplyScalar(2));
      card.userData = { id: user.id, data: user };

      planetGroupRef.current?.add(card);
      cardsRef.current.push(card);
    });
  };

  // 5. 轮换逻辑 / Swapping Logic
  useEffect(() => {
    if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);

    swapIntervalRef.current = window.setInterval(() => {
      const store = usePlanetStarStore.getState();
      if (store.state !== "IDLE" && store.state !== "SPINNING") return;

      // 随机替换 swapCount 个用户
      const currentVisible = [...store.visibleUsers];
      const all = store.allUsers;
      if (all.length === 0) return;

      // 简单的随机替换策略
      for (let i = 0; i < config.swapCount; i++) {
        const replaceIdx = Math.floor(Math.random() * currentVisible.length);
        const newCandidate = all[Math.floor(Math.random() * all.length)];
        currentVisible[replaceIdx] = newCandidate;
      }
      setVisibleUsers(currentVisible);
    }, config.swapInterval);

    return () => {
      if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    };
  }, [config.swapInterval, config.swapCount, allUsers]);

  // 辅助函数：创建星空 / Helper: Create Starfield
  const createStarfield = (scene: THREE.Scene) => {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    for (let i = 0; i < 1500; i++) {
      pos.push(
        THREE.MathUtils.randFloatSpread(4000),
        THREE.MathUtils.randFloatSpread(4000),
        THREE.MathUtils.randFloatSpread(4000)
      );
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x888899, size: 2 })));
  };

  // 辅助函数：创建粒子 / Helper: Create Particles
  const createMovingParticles = (scene: THREE.Scene, count: number) => {
    if (particlesRef.current) {
      scene.remove(particlesRef.current);
      particlesRef.current.geometry.dispose();
      (particlesRef.current.material as THREE.Material).dispose();
      particlesRef.current = null;
    }

    const geo = new THREE.BufferGeometry();
    const pos = [],
      colors = [],
      sizes = [],
      vels = [];
    const theme = [new THREE.Color(0xff6b6b), new THREE.Color(0x1dd1a1), new THREE.Color(0xffd700)];

    for (let i = 0; i < count; i++) {
      pos.push((Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 1000);
      const c = theme[Math.floor(Math.random() * 3)];
      colors.push(c.r, c.g, c.b);
      sizes.push(Math.random() * 8 + 4);
      vels.push((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 0);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    geo.userData = { vels };

    const particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 9, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending })
    );
    particlesRef.current = particles;
    scene.add(particles);
  };

  // 辅助函数：创建卡片纹理 / Helper: Create Card Texture
  const createCardTexture = (user: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    const theme = CARD_THEME_COLORS[Math.floor(Math.random() * CARD_THEME_COLORS.length)];

    // Background
    ctx.fillStyle = theme.background;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.beginPath();
    // @ts-ignore
    if (ctx.roundRect) ctx.roundRect(5, 5, 246, 130, 15);
    else ctx.rect(5, 5, 246, 130); // Fallback
    ctx.fill();
    ctx.stroke();

    // Avatar
    const baseRadius = 35;
    const avatarRadius = baseRadius * config.avatarSize;
    const avatarX = 60;
    const avatarY = 70;

    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#444";
    ctx.fill();
    ctx.stroke();

    // Text
    const safeTextMargin = 15;
    const textStartX = Math.max(110, avatarX + avatarRadius + safeTextMargin);
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${config.nicknameFontSize}px Arial`;

    let name = user.name;
    if (name.length > config.nicknameLimit) {
      name = name.substring(0, config.nicknameLimit) + "...";
    }
    ctx.fillText(name, textStartX, 60);

    ctx.fillStyle = "#1DD1A1";
    ctx.font = "20px Arial";
    ctx.fillText(`ID: ${user.id.slice(0, 2)}***${user.id.slice(-4)}`, textStartX, 95);

    const tex = new THREE.CanvasTexture(canvas);
    // Load image async
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.stroke();
      tex.needsUpdate = true;
    };
    img.src = user.avatarUrl;
    return tex;
  };

  // 停止抽奖逻辑 / Stop Lottery Logic
  const stopLottery = (onComplete: () => void) => {
    if (!planetGroupRef.current || !cameraRef.current) return;

    // 1. Pick Winner
    const winnerCard = cardsRef.current[Math.floor(Math.random() * cardsRef.current.length)];
    setCurrentWinner(winnerCard.userData.data);

    const targetPos = winnerCard.position.clone();

    // 2. Dual-Axis Locking Calculation
    // A. Y-Axis Rotation
    const angleY = Math.atan2(targetPos.x, targetPos.z);
    let targetY = -angleY;
    const currentY = planetGroupRef.current.rotation.y;
    const TWO_PI = Math.PI * 2;
    while (targetY > currentY) targetY -= TWO_PI;
    targetY -= TWO_PI * 2; // Spin a bit more

    // B. X-Axis Rotation (Pitch)
    const radiusProjected = Math.sqrt(targetPos.x * targetPos.x + targetPos.z * targetPos.z);
    const angleX = Math.atan2(targetPos.y, radiusProjected);
    const targetX = angleX;

    // 3. Animate Rotation
    new TWEEN.Tween(planetGroupRef.current.rotation)
      .to({ y: targetY, x: targetX }, 3000)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => {
        // 4. Move Camera
        new TWEEN.Tween(cameraRef.current!.position)
          .to({ x: 0, y: 0, z: 850 }, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(() => {
            highlightCard(winnerCard);
            onComplete();
          })
          .start();
      })
      .start();
  };

  // 高亮卡片特效 / Highlight Card Effect
  const highlightCard = (card: THREE.Mesh) => {
    const baseScale = config.cardScale;

    // 1. Scale Up
    new TWEEN.Tween(card.scale)
      .to({ x: baseScale * 1.5, y: baseScale * 1.5, z: baseScale * 1.5 }, 600)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    // 2. Glow Background
    const glowGeo = new THREE.PlaneGeometry(
      config.cardWidth * config.cardScale * 1.25,
      config.cardHeight * config.cardScale * 1.25
    );
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -1;
    card.add(glow);

    // Breathing
    new TWEEN.Tween(glowMat).to({ opacity: 0.2 }, 800).yoyo(true).repeat(Infinity).start();
    new TWEEN.Tween(glow.scale).to({ x: 1.15, y: 1.15 }, 800).yoyo(true).repeat(Infinity).start();

    // 3. Flash
    const flashGeo = new THREE.PlaneGeometry(
      config.cardWidth * config.cardScale * 1.5,
      config.cardHeight * config.cardScale * 1.5
    );
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.z = 1;
    card.add(flash);
    new TWEEN.Tween(flashMat)
      .to({ opacity: 0 }, 500)
      .onComplete(() => card.remove(flash))
      .start();
  };

  // 重置视角 / Reset View
  const resetView = (onComplete?: () => void) => {
    if (!cameraRef.current || !planetGroupRef.current) return;

    // Reset Camera
    const p1 = new Promise<void>((resolve) => {
      new TWEEN.Tween(cameraRef.current!.position)
        .to({ x: 0, y: 0, z: 1200 }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => cameraRef.current!.lookAt(0, 0, 0))
        .onComplete(() => resolve())
        .start();
    });

    // Reset Planet Rotation
    const p2 = new Promise<void>((resolve) => {
      new TWEEN.Tween(planetGroupRef.current!.rotation)
        .to({ x: 0, y: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => resolve())
        .start();
    });

    Promise.all([p1, p2]).then(() => {
      if (onComplete) onComplete();
    });
  };

  return {
    stopLottery,
    resetView
  };
}
