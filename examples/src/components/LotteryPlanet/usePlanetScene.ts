import * as TWEEN from "@tweenjs/tween.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useLotteryStore } from "./useLotteryStore";

/**
 * usePlanetScene - encapsulate Three.js scene, renderer and animation loop
 * - lazy-generate card textures and cache them in the zustand store
 * - expose imperative controls via returned object
 *
 * usePlanetScene - 封装 Three.js 场景、渲染器与动画循环（中/英注释）
 */
export function usePlanetScene(containerRef: { current: HTMLDivElement | null }) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const animRef = useRef<number | null>(null);
  const spinSpeedRef = useRef<number>(0);

  const { users, setUsers, setWinner, selectWinners, getCachedTexture, setCachedTexture } = useLotteryStore();

  // initialize users if empty
  useEffect(() => {
    if (!users || users.length === 0) {
      // lazy: do not force generate here; the caller can call setUsers
    }
  }, [users, setUsers]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.0008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1200;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 1, 2000);
    pointLight.position.set(500, 500, 500);
    scene.add(pointLight);

    const planetGroup = new THREE.Group();
    planetGroupRef.current = planetGroup;

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(580, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x001133, transparent: true, opacity: 0.8, wireframe: true })
    );
    planetGroup.add(core);

    scene.add(planetGroup);

    // starfield
    const starGeo = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = 0; i < 1000; i++)
      verts.push(
        THREE.MathUtils.randFloatSpread(4000),
        THREE.MathUtils.randFloatSpread(4000),
        THREE.MathUtils.randFloatSpread(4000)
      );
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x888888, size: 2 })));

    function onResize() {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    function animate(time?: number) {
      animRef.current = requestAnimationFrame(animate);
      (TWEEN as any).update(time);
      // simple idle rotation
      if (planetGroupRef.current) {
        planetGroupRef.current.rotation.y -= spinSpeedRef.current || 0.002;
        planetGroupRef.current.rotation.x = Math.sin((time || 0) * 0.0005) * 0.1;
      }
      if (rendererRef.current && cameraRef.current && sceneRef.current)
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animate();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current)
        containerRef.current.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  /**
   * lazyCreateTexture - generate and cache a canvas texture for a user
   * 延迟生成并缓存卡片贴图
   */
  function lazyCreateTexture(user: any) {
    const cached = getCachedTexture(user.id);
    if (cached) return cached;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 140;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 256, 140);
    gradient.addColorStop(0, "rgba(20, 30, 80, 0.9)");
    gradient.addColorStop(1, "rgba(40, 10, 60, 0.9)");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
    ctx.lineWidth = 4;
    // rounded rect
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
    // avatar circle
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

    // draw white user icon inside the avatar (head + body) - mimic starsnew.html
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    const iconHeadRadius = 12;
    // head
    ctx.beginPath();
    ctx.arc(avatarX, avatarY - 10, iconHeadRadius, 0, Math.PI * 2);
    ctx.fill();
    // body (simple arc)
    ctx.beginPath();
    ctx.arc(avatarX, avatarY + 15, 20, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();

    // name & dept
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.fillText(user.name, 110, 70);
    ctx.fillStyle = "#aaddff";
    ctx.font = "24px Arial";
    ctx.fillText(user.dept, 110, 105);

    setCachedTexture(user.id, canvas);
    return canvas;
  }

  /**
   * populateCards - create card meshes on the planet lazily
   * 创建卡片并挂载到星球，贴图懒加载
   */
  function populateCards(options?: { cardCount?: number; radius?: number }) {
    const cardCount = options?.cardCount ?? 200;
    const radius = options?.radius ?? 600;
    const phi = Math.PI * (3 - Math.sqrt(5));
    const scene = sceneRef.current;
    const planetGroup = planetGroupRef.current;
    if (!scene || !planetGroup) return;

    // clear existing cards
    cardsRef.current.forEach((c) => {
      c.geometry.dispose();
      // @ts-ignore
      if (c.material && (c.material as any).map) (c.material as any).map.dispose();
    });
    cardsRef.current = [];

    const usersList = useLotteryStore.getState().users.slice(0, cardCount);
    usersList.forEach((user: any, i: number) => {
      const y = 1 - (i / (usersList.length - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const position = new THREE.Vector3(x, y, z).multiplyScalar(radius);

      const geometry = new THREE.PlaneGeometry(60, 35);
      const canvas = lazyCreateTexture(user);
      const texture = new THREE.CanvasTexture(canvas as HTMLCanvasElement);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const card = new THREE.Mesh(geometry, material);
      card.position.copy(position);
      card.lookAt(0, 0, 0);
      // store user data
      // @ts-ignore
      card.userData = { id: user.id, data: user, originalPos: position.clone() };
      planetGroup.add(card);
      cardsRef.current.push(card);
    });
  }

  /**
   * selectAndFocus - select N winners, animate camera and focus
   * 选中 N 个中奖者并让相机飞往第一个赢家
   */
  function selectAndFocus(count = 1) {
    const winners = selectWinners(count);
    if (winners.length === 0) return winners;
    // find corresponding card
    const first = winners[0];
    const card = cardsRef.current.find((c) => c.userData?.id === first.id);
    if (!card || !cameraRef.current || !planetGroupRef.current) return winners;
    // compute world position
    card.updateWorldMatrix(true, false);
    const targetPos = new THREE.Vector3();
    card.getWorldPosition(targetPos);
    const cameraEndPos = targetPos.clone().normalize().multiplyScalar(900);

    (TWEEN as any)
      .Tween(planetGroupRef.current.rotation)
      .to({ y: planetGroupRef.current.rotation.y - 0.5 }, 1000)
      .easing((TWEEN as any).Easing.Cubic.Out)
      .start();
    (TWEEN as any)
      .Tween(cameraRef.current.position)
      .to({ x: cameraEndPos.x, y: cameraEndPos.y, z: cameraEndPos.z }, 2000)
      .easing((TWEEN as any).Easing.Exponential.InOut)
      .onUpdate(() => cameraRef.current!.lookAt(targetPos))
      .start();

    // highlight card
    (TWEEN as any)
      .Tween(card.scale)
      .to({ x: 2.5, y: 2.5 }, 500)
      .easing((TWEEN as any).Easing.Back.Out)
      .start();

    // add glow sized to card dimensions (matches starsnew.html)
    try {
      const glowGeo = new THREE.PlaneGeometry(60 * 1.5, 35 * 2.5);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -1;
      card.add(glow);
      (TWEEN as any).Tween(glowMat).to({ opacity: 0.6 }, 500).yoyo(true).repeat(5).start();
    } catch (e) {
      // ignore if geometry creation fails in test environment
    }

    // particle explosion
    createExplosion(card.getWorldPosition(new THREE.Vector3()));

    return winners;
  }

  function startSpin() {
    spinSpeedRef.current = 0.01;
  }

  function stopSpin() {
    spinSpeedRef.current = 0;
  }

  function resetCamera() {
    if (!cameraRef.current) return;
    (TWEEN as any)
      .Tween(cameraRef.current.position)
      .to({ x: 0, y: 0, z: 1200 }, 1500)
      .easing((TWEEN as any).Easing.Quadratic.InOut)
      .onUpdate(() => cameraRef.current!.lookAt(0, 0, 0))
      .start();
  }

  /**
   * createExplosion - colorful particle burst (themed for anniversary)
   * 实现包含颜色、重力和衰减的粒子爆炸
   */
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
    const scene = sceneRef.current;
    if (!scene) return;
    scene.add(particles);

    const velCopy = velocities.slice();
    // animate particles with simple physics
    const animateParticles = () => {
      const posAttr = particles.geometry.attributes.position.array as number[];
      for (let i = 0; i < particleCount; i++) {
        posAttr[i * 3] += velCopy[i * 3];
        posAttr[i * 3 + 1] += velCopy[i * 3 + 1];
        posAttr[i * 3 + 2] += velCopy[i * 3 + 2];

        // apply gravity
        velCopy[i * 3 + 1] -= 0.1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      (material as any).opacity -= 0.015;
      if ((material as any).opacity > 0) requestAnimationFrame(animateParticles);
      else scene.remove(particles);
    };
    animateParticles();
  }

  return {
    populateCards,
    selectAndFocus,
    startSpin,
    stopSpin,
    resetCamera
  };
}
