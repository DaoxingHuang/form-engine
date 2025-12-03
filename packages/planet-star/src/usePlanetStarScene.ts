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
  const highlightedCardRef = useRef<THREE.Mesh | null>(null);
  const highlightTweensRef = useRef<any[]>([]);

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

  // Helper to calculate ideal Z distance based on screen size
  const getIdealDistance = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    // Planet radius + max card height/scale + margin
    // config.radius is usually 600.
    // Let's use a dynamic calculation.
    const targetRadius = config.radius * 1.2; // 20% margin

    const fov = 60 * (Math.PI / 180);
    let dist = targetRadius / Math.tan(fov / 2);

    if (aspect < 1) {
      // On mobile (portrait), bring camera closer to make planet look larger
      // 在移动端（竖屏），拉近相机距离使星球看起来更大
      dist = (dist / aspect) * 0.85;
    }
    // Clamp min distance to avoid being inside
    return Math.max(dist, 800);
  };

  // 1. 初始化场景 / Initialize Scene
  // This effect sets up the Three.js scene, camera, renderer, and initial objects.
  // 此 Effect 负责初始化 Three.js 场景、相机、渲染器以及初始对象。
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Scene, Camera, Renderer
    // 创建场景对象 / Create Scene object
    const scene = new THREE.Scene();
    // 添加雾效，增强深度感 / Add fog for depth perception
    scene.fog = new THREE.FogExp2(0x0f172a, 0.0008);
    sceneRef.current = scene;

    // 创建透视相机 / Create Perspective Camera
    // fov: 60, aspect: window ratio, near: 1, far: 5000
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = getIdealDistance();
    cameraRef.current = camera;

    // preserveDrawingBuffer: true is required for screenshots to work correctly
    // Optimization: Only enable if tools are shown to save performance
    // 创建 WebGL 渲染器 / Create WebGL Renderer
    // antialias: 抗锯齿 / Antialiasing
    // alpha: 透明背景 / Transparent background
    // preserveDrawingBuffer: 是否保留绘图缓冲区（用于截图） / Whether to preserve drawing buffer (for screenshots)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: config.showTools });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    // 添加环境光 / Add Ambient Light
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    // 添加点光源 / Add Point Light
    const pl = new THREE.PointLight(0x1dd1a1, 1, 2000);
    pl.position.set(500, 500, 500);
    scene.add(pl);

    // Planet Group
    // 创建星球组，用于统一旋转 / Create Planet Group for unified rotation
    const planetGroup = new THREE.Group();
    planetGroupRef.current = planetGroup;
    scene.add(planetGroup);

    // Core Sphere (Background)
    // 创建核心球体背景 / Create Core Sphere Background
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
    // 创建星空背景 / Create Starfield Background
    createStarfield(scene);

    // Particles
    // 创建动态粒子 / Create Moving Particles
    createMovingParticles(scene, config.particleCount);

    // Resize Handler
    // 窗口大小调整处理 / Window Resize Handler
    const onResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      cameraRef.current.position.z = getIdealDistance();

      // Rebuild cards on resize to update scale if switching between mobile/desktop
      // 调整大小时重建卡片，以便在移动/桌面切换时更新缩放
      rebuildCards();
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    // 动画循环 / Animation Loop
    const animate = (time: number) => {
      try {
        animRef.current = requestAnimationFrame(animate);
        // 更新 Tween 动画 / Update Tween animations
        (TWEEN as any).update(time);

        const store = usePlanetStarStore.getState();
        const currentState = store.state;
        const currentConfig = store.config;

        let currentSpinSpeed = 0;

        // 根据状态设置旋转速度 / Set spin speed based on state
        if (currentState === "SPINNING") currentSpinSpeed = currentConfig.spinSpeedMax;
        else if (currentState === "IDLE") currentSpinSpeed = 0.002;
        else currentSpinSpeed = 0;

        // 旋转星球组 / Rotate Planet Group
        if (currentState !== "RESULT" && planetGroupRef.current) {
          planetGroupRef.current.rotation.y -= currentSpinSpeed;
        }

        // Particle Animation
        // 粒子动画更新 / Update Particle Animation
        if (particlesRef.current) {
          const particles = particlesRef.current;
          const pos = particles.geometry.attributes.position.array as Float32Array;
          const vels = particles.geometry.userData.vels;
          for (let i = 0; i < currentConfig.particleCount; i++) {
            pos[i * 3] += vels[i * 3] * 0.1;
            pos[i * 3 + 1] += vels[i * 3 + 1] * 0.1;
            // 边界检查与重置 / Boundary check and reset
            if (pos[i * 3] > 2000) pos[i * 3] = -2000;
            if (pos[i * 3 + 1] > 2000) pos[i * 3 + 1] = -2000;
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }

        // 渲染场景 / Render Scene
        renderer.render(scene, camera);
      } catch (e) {
        console.error("Three.js rendering error, resetting page...", e);
        if (animRef.current) cancelAnimationFrame(animRef.current);
        window.location.reload();
      }
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
  }, [config.showTools]); // Run when showTools changes

  // 2. 监听配置变化：重建粒子 / Watch Config: Rebuild Particles
  useEffect(() => {
    if (sceneRef.current) {
      createMovingParticles(sceneRef.current, config.particleCount);
    }
  }, [config.particleCount, config.showTools]);

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
  // This effect triggers the card rebuilding process whenever the visible users list changes.
  // 此 Effect 在可见用户列表变化时触发卡片重建过程。
  useEffect(() => {
    rebuildCards();
  }, [visibleUsers, config.showTools]);

  const rebuildCards = () => {
    if (!planetGroupRef.current || visibleUsers.length === 0) return;

    // Clear existing cards
    // 清除现有卡片 / Clear existing cards
    cardsRef.current.forEach((c) => planetGroupRef.current?.remove(c));
    cardsRef.current = [];

    // Fibonacci Sphere Algorithm for even distribution
    // 斐波那契球体算法，用于均匀分布卡片
    const phi = Math.PI * (3 - Math.sqrt(5));
    const users = visibleUsers.slice(0, config.cardCount);

    users.forEach((user, i) => {
      const y = 1 - (i / (users.length - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      // Calculate position on sphere surface
      // 计算球体表面坐标
      const pos = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(config.radius);

      // Get or create texture
      // 获取或创建纹理
      let tex = getCachedTexture(user.id);
      if (!tex) {
        tex = createCardTexture(user);
        setCachedTexture(user.id, tex);
      }

      // Create Card Mesh
      // 创建卡片网格
      // Increase scale on mobile for better visibility
      // 在移动端增加缩放比例以提高可见性
      const isMobile = window.innerWidth < 768;
      const mobileScale = isMobile ? 1.5 : 1;
      const finalScale = config.cardScale * mobileScale;

      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(config.cardWidth * finalScale, config.cardHeight * finalScale),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true })
      );
      card.position.copy(pos);
      // Make card look at a point further out from center to orient correctly
      // 让卡片朝向远离中心的一点，以正确调整方向
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
  // Handles the animation sequence when stopping the lottery to pick a winner.
  // 处理停止抽奖时的动画序列，用于选中获奖者。
  const stopLottery = (onComplete: () => void) => {
    if (!planetGroupRef.current || !cameraRef.current) return;

    // 1. Pick Winner
    // 随机选择一个获奖者卡片 / Randomly pick a winner card
    const winnerCard = cardsRef.current[Math.floor(Math.random() * cardsRef.current.length)];
    setCurrentWinner(winnerCard.userData.data);

    const targetPos = winnerCard.position.clone();

    // 2. Dual-Axis Locking Calculation
    // 双轴锁定计算，计算旋转角度使获奖卡片面向相机
    // A. Y-Axis Rotation
    const angleY = Math.atan2(targetPos.x, targetPos.z);
    let targetY = -angleY;
    const currentY = planetGroupRef.current.rotation.y;
    const TWO_PI = Math.PI * 2;
    // Ensure smooth rotation direction
    // 确保旋转方向平滑
    while (targetY > currentY) targetY -= TWO_PI;
    targetY -= TWO_PI * 2; // Spin a bit more / 多转几圈

    // B. X-Axis Rotation (Pitch)
    const radiusProjected = Math.sqrt(targetPos.x * targetPos.x + targetPos.z * targetPos.z);
    const angleX = Math.atan2(targetPos.y, radiusProjected);
    const targetX = angleX;

    // 3. Animate Rotation
    // 使用 Tween 动画旋转星球 / Animate planet rotation using Tween
    new TWEEN.Tween(planetGroupRef.current.rotation)
      .to({ y: targetY, x: targetX }, 6000) // Slow down rotation (3000 -> 6000)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => {
        // 4. Move Camera
        // 移动相机接近获奖卡片 / Move camera closer to winner card
        new TWEEN.Tween(cameraRef.current!.position)
          .to({ x: 0, y: 0, z: 850 }, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(() => {
            highlightCard(winnerCard);
            // Wait 0.2s before showing result modal
            // 暂停 0.2s 再显示结果弹窗
            setTimeout(() => {
              onComplete();
            }, 200);
          })
          .start();
      })
      .start();
  };

  // 清除高亮特效 / Clear Highlight Effects
  const clearHighlight = () => {
    if (highlightedCardRef.current) {
      const card = highlightedCardRef.current;

      // Reset Scale
      const baseScale = config.cardScale;
      new TWEEN.Tween(card.scale).to({ x: baseScale, y: baseScale, z: baseScale }, 300).start();

      // Remove highlight effects
      const toRemove: THREE.Object3D[] = [];
      card.traverse((child) => {
        if (child.userData.isHighlightEffect) {
          toRemove.push(child);
        }
      });

      toRemove.forEach((child) => {
        child.parent?.remove(child);
        // Dispose resources
        child.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            if (c.geometry) c.geometry.dispose();
            if (c.material) {
              if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
              else c.material.dispose();
            }
          }
        });
      });

      highlightedCardRef.current = null;
    }

    // Stop looping tweens
    highlightTweensRef.current.forEach((t) => t.stop());
    highlightTweensRef.current = [];
  };

  // 高亮卡片特效 / Highlight Card Effect
  const highlightCard = (card: THREE.Mesh) => {
    clearHighlight();
    highlightedCardRef.current = card;
    const baseScale = config.cardScale;

    // 1. Scale Up
    const scaleTween = new TWEEN.Tween(card.scale)
      .to({ x: baseScale * 1.5, y: baseScale * 1.5, z: baseScale * 1.5 }, 600)
      .easing(TWEEN.Easing.Back.Out)
      .start();
    highlightTweensRef.current.push(scaleTween);

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
    glow.userData.isHighlightEffect = true;
    card.add(glow);

    // Breathing
    const breathTween1 = new TWEEN.Tween(glowMat).to({ opacity: 0.2 }, 800).yoyo(true).repeat(Infinity).start();
    const breathTween2 = new TWEEN.Tween(glow.scale).to({ x: 1.15, y: 1.15 }, 800).yoyo(true).repeat(Infinity).start();
    highlightTweensRef.current.push(breathTween1, breathTween2);

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
    flash.userData.isHighlightEffect = true;
    card.add(flash);
    const flashTween = new TWEEN.Tween(flashMat)
      .to({ opacity: 0 }, 500)
      .onComplete(() => card.remove(flash))
      .start();
    highlightTweensRef.current.push(flashTween);
  };

  // 重置视角 / Reset View
  const resetView = (onComplete?: () => void) => {
    if (!cameraRef.current || !planetGroupRef.current) return;

    // Clear highlight effects
    clearHighlight();

    // Reset Camera
    const p1 = new Promise<void>((resolve) => {
      new TWEEN.Tween(cameraRef.current!.position)
        .to({ x: 0, y: 0, z: getIdealDistance() }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => cameraRef.current!.lookAt(0, 0, 0))
        .onComplete(() => resolve())
        .start();
    });

    // Reset Planet Rotation
    // Only reset X (pitch) to 0 to make planet upright. Keep Y (yaw) as is to avoid spinning back.
    // 仅重置 X 轴为 0 使星球直立。保持 Y 轴不变以避免回旋。
    const p2 = new Promise<void>((resolve) => {
      new TWEEN.Tween(planetGroupRef.current!.rotation)
        .to({ x: 0 }, 1200)
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
