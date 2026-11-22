'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface HeroBgProps {
  preloaderDone: boolean
}

export default function HeroBg({ preloaderDone }: HeroBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef({ blast: 0, intro: 1, progress: 0 })
  const pointerRef = useRef({ x: 0, y: 0 })

  // Trigger intro animation after preloader completes
  useEffect(() => {
    if (preloaderDone) {
      gsap.to(bgRef.current, { intro: 0, duration: 1.9, ease: 'power3.out' })
    }
  }, [preloaderDone])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    gsap.registerPlugin(ScrollTrigger)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch { return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x08080a)
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
    camera.position.set(0, 0, 9)

    // Gradient environment
    const envCanvas = document.createElement('canvas')
    envCanvas.width = 32; envCanvas.height = 256
    const ectx = envCanvas.getContext('2d')!
    const grad = ectx.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0.00, '#ffffff')
    grad.addColorStop(0.30, '#c3c8ce')
    grad.addColorStop(0.52, '#3a3a42')
    grad.addColorStop(0.76, '#141418')
    grad.addColorStop(1.00, '#050506')
    ectx.fillStyle = grad; ectx.fillRect(0, 0, 32, 256)
    const envTex = new THREE.CanvasTexture(envCanvas)
    envTex.mapping = THREE.EquirectangularReflectionMapping
    try {
      const cubeRT = new THREE.WebGLCubeRenderTarget(128)
      cubeRT.fromEquirectangularTexture(renderer, envTex)
      scene.environment = cubeRT.texture
    } catch { /* ignore */ }

    scene.add(new THREE.AmbientLight(0xffffff, 0.45))
    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(3, 6, 5); scene.add(key)
    const rim = new THREE.DirectionalLight(0xe8703a, 0.9); rim.position.set(-5, -2, 3); scene.add(rim)

    const group = new THREE.Group()
    scene.add(group)

    const matCold = new THREE.MeshStandardMaterial({ color: 0x16161a, metalness: 0.97, roughness: 0.15, envMapIntensity: 1.6, side: THREE.DoubleSide })
    const matWarm = new THREE.MeshStandardMaterial({ color: 0x2a1409, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.2, emissive: new THREE.Color(0xe8703a), emissiveIntensity: 0.55, side: THREE.DoubleSide })

    const DEPTH = 0.9
    const shards: THREE.Object3D[] = []

    interface ShardData {
      dir: THREE.Vector3
      spin: THREE.Vector3
      drift: THREE.Vector3
      home: THREE.Vector3
      homeRot: THREE.Euler
      delay: number
      spinMult: number
      mats: THREE.MeshStandardMaterial[]
      __proc?: boolean
    }

    function shardData(unit = 1): Omit<ShardData, 'home' | 'homeRot' | 'mats'> {
      return {
        // Smaller dir so pieces stay partially in-frame during the long fade window
        dir: new THREE.Vector3((Math.random() - 0.5) * 1.6 * unit, (Math.random() - 0.5) * 1.4 * unit, (Math.random() - 0.5) * 2.2 * unit),
        spin: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
        drift: new THREE.Vector3((Math.random() - 0.5) * 0.4 * unit, (Math.random() - 0.5) * 0.28 * unit, (Math.random() - 0.5) * 0.4 * unit),
        delay: Math.random() * 0.12,
        spinMult: 0.4 + Math.random() * 1.4,
      }
    }

    function addShard(mesh: THREE.Object3D, unit = 1) {
      // Clone materials per-shard so opacity can be animated independently
      const meshObj = mesh as THREE.Mesh
      const mats: THREE.MeshStandardMaterial[] = []
      if (meshObj.isMesh) {
        const rawMats = Array.isArray(meshObj.material) ? meshObj.material : (meshObj.material ? [meshObj.material] : [])
        rawMats.forEach((mat) => {
          const sm = mat as THREE.MeshStandardMaterial
          if (sm.isMeshStandardMaterial) {
            const c = sm.clone(); c.transparent = true; mats.push(c)
          }
        })
        if (mats.length > 0) meshObj.material = mats.length === 1 ? mats[0] : mats
      }
      const d: ShardData = { ...shardData(unit), home: mesh.position.clone(), homeRot: mesh.rotation.clone(), mats }
      // Radial bias in group-local space so scatter direction stays consistent
      // as the group rotates. mesh.position is already in group-local space after
      // group.attach (or is the set local position for procedural pieces).
      const lp = mesh.position.clone()
      if (lp.length() > 0.001) {
        const dirLen = d.dir.length()
        d.dir.lerp(lp.normalize().multiplyScalar(dirLen), 0.55)
        d.dir.normalize().multiplyScalar(dirLen)
      }
      mesh.userData = d
      if (!mesh.parent) group.add(mesh)
      shards.push(mesh)
    }

    // GLB loader
    let modelLoaded = false
    const gltfLoader = new GLTFLoader()

    // Polyfill KHR_materials_pbrSpecularGlossiness (removed in three.js r152+).
    // Loads the embedded diffuse texture as the color map and approximates
    // metalness/roughness from the extension factors.
    interface PbrSGParser {
      json: { materials: Array<{ extensions?: Record<string, Record<string, unknown>> }> }
      assignTexture(params: Record<string, unknown>, name: string, def: { index: number }): Promise<void>
    }
    class PbrSpecularGlossinessPlugin {
      name = 'KHR_materials_pbrSpecularGlossiness'
      parser: PbrSGParser
      constructor(p: PbrSGParser) { this.parser = p }
      getMaterialType(idx: number) {
        return this.parser.json.materials[idx]?.extensions?.[this.name]
          ? THREE.MeshStandardMaterial : null
      }
      extendMaterialParams(idx: number, params: Record<string, unknown>) {
        const ext = this.parser.json.materials[idx]?.extensions?.[this.name] as {
          diffuseFactor?: number[]
          diffuseTexture?: { index: number }
          specularFactor?: number[]
          glossinessFactor?: number
        } | undefined
        if (!ext) return Promise.resolve()
        const pending: Promise<void>[] = []
        if (ext.diffuseTexture) {
          pending.push(this.parser.assignTexture(params, 'map', ext.diffuseTexture))
        }
        if (ext.diffuseFactor) {
          params.color = new THREE.Color(ext.diffuseFactor[0], ext.diffuseFactor[1], ext.diffuseFactor[2])
        }
        const gloss = ext.glossinessFactor ?? 1.0
        const spec = ext.specularFactor ?? [1, 1, 1]
        params.roughness = Math.max(0.22, 1.0 - gloss * 0.72)
        params.metalness = Math.max(spec[0] as number, spec[1] as number, spec[2] as number) * 0.48
        return Promise.all(pending)
      }
    }
    gltfLoader.register((parser) => new PbrSpecularGlossinessPlugin(parser as unknown as PbrSGParser))
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    gltfLoader.setDRACOLoader(draco)
    gltfLoader.load('/canon_eos_5d_mark_iv.glb', (gltf) => {
      if (modelLoaded) return
      modelLoaded = true
      console.info('[imora] camera model loaded — swapping out the placeholder.')
      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const mid = box.getCenter(new THREE.Vector3())
      const span = Math.max(size.x, size.y, size.z) || 1
      const s = 2.6 / span
      model.scale.setScalar(s)
      model.position.set(-mid.x * s, -mid.y * s, -mid.z * s)
      // Temporarily add to scene so world matrices are correct before flattening
      scene.add(model)
      model.updateWorldMatrix(true, true)
      // Remove procedural placeholders
      const toRemove = shards.filter((m) => (m.userData as ShardData).__proc)
      toRemove.forEach((m) => { group.remove(m) })
      shards.splice(0, shards.length, ...shards.filter((m) => !(m.userData as ShardData).__proc))
      // Collect all meshes before reparenting so traversal is stable
      const glbMeshes: THREE.Mesh[] = []
      model.traverse((o) => { if ((o as THREE.Mesh).isMesh) glbMeshes.push(o as THREE.Mesh) })
      // Flatten GLB hierarchy: detach each mesh from its parent node and attach
      // directly to group. group.attach preserves world transform, so after this
      // each mesh's local position/rotation equals its assembled-camera world
      // position/rotation. The scatter animation then moves pieces in group space,
      // which means the assembled camera shape fully breaks apart — no ghost hull.
      glbMeshes.forEach((mesh) => {
        const rawMats = Array.isArray(mesh.material) ? mesh.material : (mesh.material ? [mesh.material] : [])
        rawMats.forEach((mat) => {
          const m = mat as THREE.MeshStandardMaterial
          if (m.isMeshStandardMaterial) { m.envMapIntensity = 1.8; m.needsUpdate = true }
        })
        group.attach(mesh)   // reparent preserving world transform
        addShard(mesh, 1)    // unit=1: group space = world space, dir magnitudes correct
      })
      // Model hierarchy is now empty; remove from scene
      scene.remove(model)
    }, undefined, (err) => {
      console.error('[imora] could not load camera model — showing placeholder.', err)
    })

    // Rounded rect helper
    function roundedRect(w: number, h: number, r: number) {
      const s = new THREE.Shape()
      s.moveTo(-w / 2 + r, -h / 2)
      s.lineTo(w / 2 - r, -h / 2)
      s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
      s.lineTo(w / 2, h / 2 - r)
      s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
      s.lineTo(-w / 2 + r, h / 2)
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
      s.lineTo(-w / 2, -h / 2 + r)
      s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
      return s
    }
    function slabGeo(w: number, h: number, d: number, r: number) {
      const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
        depth: d, bevelEnabled: true, bevelThickness: 0.035,
        bevelSize: 0.035, bevelSegments: 3, curveSegments: 14,
      })
      g.translate(0, 0, -d / 2)
      return g
    }
    function makeTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, repX?: number, repY?: number) {
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      draw(c.getContext('2d')!, w, h)
      const t = new THREE.CanvasTexture(c)
      if (repX || repY) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repX || 1, repY || 1) }
      return t
    }

    const leatherTex = makeTex(512, 512, (x, w, h) => {
      x.fillStyle = '#141416'; x.fillRect(0, 0, w, h)
      for (let i = 0; i < 26000; i++) {
        const v = 18 + Math.random() * 34
        x.fillStyle = `rgba(${v},${v},${v + 3},${0.25 + Math.random() * 0.5})`
        const s = 2 + Math.random() * 3
        x.fillRect(Math.random() * w, Math.random() * h, s, s)
      }
    }, 3, 2)
    const ribTex = makeTex(512, 64, (x, w, h) => {
      x.fillStyle = '#1b1b1e'; x.fillRect(0, 0, w, h)
      for (let i = 0; i < 96; i++) {
        x.fillStyle = i % 2 ? '#333338' : '#101013'
        x.fillRect(i * (w / 96), 0, (w / 96) * 0.55, h)
      }
    })

    const matLeather = new THREE.MeshStandardMaterial({ map: leatherTex, color: 0x9a9a9a, roughness: 0.92, metalness: 0.05 })
    const matSteel = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.28, metalness: 0.95, envMapIntensity: 1.7 })
    const matBlack = new THREE.MeshStandardMaterial({ color: 0x121215, roughness: 0.55, metalness: 0.35 })
    const matRib = new THREE.MeshStandardMaterial({ map: ribTex, roughness: 0.5, metalness: 0.7, envMapIntensity: 1.2 })
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x0b1a2c, roughness: 0.04, metalness: 1.0, envMapIntensity: 2.6 })

    // Procedural camera body
    const body = new THREE.Mesh(slabGeo(2.55, 1.5, DEPTH, 0.16), matLeather); addShard(body)
    const topPlate = new THREE.Mesh(slabGeo(2.5, 0.34, DEPTH * 0.94, 0.08), matSteel); topPlate.position.y = 0.9; addShard(topPlate)
    const prism = new THREE.Mesh(slabGeo(0.78, 0.4, DEPTH * 0.72, 0.07), matSteel); prism.position.set(0, 1.24, 0); addShard(prism)
    const shoe = new THREE.Mesh(slabGeo(0.34, 0.12, 0.26, 0.03), matBlack); shoe.position.set(0, 1.5, 0); addShard(shoe)

    function dial(r: number, hgt: number, mat: THREE.Material) {
      return new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.94, hgt, 30), mat)
    }
    const dialL = dial(0.2, 0.16, matSteel); dialL.position.set(-0.92, 1.14, 0); addShard(dialL)
    const dialR = dial(0.22, 0.16, matSteel); dialR.position.set(0.86, 1.14, 0); addShard(dialR)
    const shutter = dial(0.1, 0.1, matWarm); shutter.position.set(0.86, 1.26, 0); addShard(shutter)

    function tube(rTop: number, rBot: number, len: number, mat: THREE.Material, z: number) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, 46, 1, true), mat)
      m.rotation.x = Math.PI / 2
      m.position.z = z
      return m
    }
    const zf = DEPTH / 2
    addShard(tube(0.68, 0.68, 0.14, matSteel, zf + 0.07))
    addShard(tube(0.60, 0.62, 0.30, matBlack, zf + 0.29))
    addShard(tube(0.63, 0.63, 0.34, matRib, zf + 0.60))
    addShard(tube(0.55, 0.60, 0.16, matSteel, zf + 0.85))
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.53, 40, 24, 0, Math.PI * 2, 0, 0.72), matGlass)
    glass.rotation.x = Math.PI / 2; glass.position.z = zf + 0.80; addShard(glass)
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 10, 44), matSteel); innerRing.position.z = zf + 0.92; addShard(innerRing)
    ;[-1.32, 1.32].forEach((x) => {
      const lug = new THREE.Mesh(slabGeo(0.14, 0.2, 0.16, 0.04), matSteel); lug.position.set(x, 0.62, 0); addShard(lug)
    })

    if (!modelLoaded) shards.forEach((m) => { (m.userData as ShardData).__proc = true })

    // Ghost wireframes
    const specs = [
      { x: 0, y: 0, w: 2.55, h: 1.5 },
      { x: 0, y: 0.9, w: 2.5, h: 0.34 },
      { x: 0, y: 1.24, w: 0.78, h: 0.4 },
    ]
    const ghosts: THREE.Group[] = []
    for (let gi = 0; gi < 3; gi++) {
      const gGroup = new THREE.Group()
      specs.forEach((sp) => {
        const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(sp.w, sp.h, DEPTH))
        const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.09 })
        const ln = new THREE.LineSegments(eg, lm)
        ln.position.set(sp.x, sp.y, 0)
        gGroup.add(ln)
      })
      const sc = 1.7 + gi * 1.5
      gGroup.scale.setScalar(sc)
      gGroup.position.z = -3 - gi * 4
      gGroup.userData = { speed: 0.0016 - gi * 0.0004, base: sc }
      scene.add(gGroup); ghosts.push(gGroup)
    }

    // Ember streaks
    const streaks: THREE.Line[] = []
    const streakColors = [0xe8703a, 0xffffff, 0xc9a76a, 0x6f9ad6]
    for (let si = 0; si < 16; si++) {
      const len = 0.5 + Math.random() * 2.4
      const sgeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(len, -len * 0.55, 0),
      ])
      const smat = new THREE.LineBasicMaterial({ color: streakColors[si % streakColors.length], transparent: true, opacity: 0.5 })
      const st = new THREE.Line(sgeo, smat)
      st.userData = {
        speed: 0.5 + Math.random() * 1.6,
        reset(o: THREE.Object3D) { o.position.set(-9 - Math.random() * 6, 5 + Math.random() * 6, -2 - Math.random() * 7) },
      }
      st.userData.reset(st)
      scene.add(st); streaks.push(st)
    }

    // Blast interaction
    const blastOn = () => gsap.to(bgRef.current, { blast: 1, duration: 0.8, ease: 'power2.out' })
    const blastOff = () => gsap.to(bgRef.current, { blast: 0, duration: 1.5, ease: 'elastic.out(1,0.55)' })
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('a, button')) return
      if (window.scrollY < window.innerHeight * 1.2) blastOn()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', blastOff)
    window.addEventListener('pointercancel', blastOff)

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize
    function resize() {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.z = w / h < 1 ? 13 : 9
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    // ScrollTrigger for fragmentation
    const st = ScrollTrigger.create({
      trigger: '#zone3d',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) { bgRef.current.progress = self.progress },
    })

    // Render loop
    let lastTime = performance.now()
    let t = 0
    const renderFn = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      t += dt
      const p = bgRef.current.progress
      // bSmooth kept for ghost/streak visibility scaling
      const burst = Math.min(p / 0.34, 1)
      const bSmooth = burst * burst * (3 - 2 * burst)
      // Immediate sharp break: camera shatters the moment scroll begins.
      // snapBreak jumps to ~1.6 in the first 12% of the zone (ease-out).
      // longDrift then carries pieces slowly across the full remaining scroll — 3+ viewport heights.
      const breakPhase = Math.min(p / 0.12, 1)
      const snapBreak = (1 - Math.pow(1 - breakPhase, 2.5)) * 1.6
      const spread = snapBreak + p * 7.0 + bgRef.current.blast * 2.2 + bgRef.current.intro * 1.6

      group.rotation.y += 0.0038
      group.rotation.x += (pointerRef.current.y * 0.20 - group.rotation.x) * 0.04
      group.rotation.z = Math.sin(t * 0.3) * 0.05 + pointerRef.current.x * 0.07

      shards.forEach((m) => {
        const d = m.userData as ShardData
        // Stagger: each shard waits its own delay before joining the break
        const localSpread = Math.max(0, spread - d.delay)
        m.position.copy(d.home)
          .addScaledVector(d.dir, localSpread)
          .addScaledVector(d.drift, Math.sin(t * 0.4 + d.home.y) * localSpread * 0.4)
        // parabolic gravity — pieces arc and fall downward as they scatter
        m.position.y -= localSpread * localSpread * 0.14
        // Per-shard spin personality: deceleration shape is shared but scale varies
        const localSpin = (localSpread / (1 + localSpread * 0.38)) * d.spinMult
        m.rotation.set(
          d.homeRot.x + d.spin.x * localSpin * 0.45,
          d.homeRot.y + d.spin.y * localSpin * 0.45,
          d.homeRot.z + d.spin.z * localSpin * 0.45,
        )
        // Fade out: pieces stay fully opaque through the break and early drift,
        // then slowly dissolve across the long scroll burn (spread 3.5 → 8.0)
        if (d.mats.length > 0) {
          const opacity = Math.max(0, 1 - Math.max(0, localSpread - 3.5) * 0.222)
          d.mats.forEach((mat) => { mat.opacity = opacity })
        }
      })

      ghosts.forEach((g, i) => {
        g.rotation.y += g.userData.speed
        g.rotation.x = Math.sin(t * 0.12 + i) * 0.14
        g.position.y = Math.sin(t * 0.16 + i * 2) * 0.5
        g.children.forEach((ln) => {
          ((ln as THREE.LineSegments).material as THREE.LineBasicMaterial).opacity = (0.10 - i * 0.022) * (0.35 + bSmooth * 0.65)
        })
      })

      streaks.forEach((s) => {
        s.position.x += s.userData.speed * dt * 9
        s.position.y -= s.userData.speed * dt * 5
        ;(s.material as THREE.LineBasicMaterial).opacity = 0.42 * (0.25 + bSmooth * 0.75)
        if (s.position.x > 13 || s.position.y < -8) s.userData.reset(s)
      })

      camera.position.x += (pointerRef.current.x * 0.75 - camera.position.x) * 0.04
      camera.position.y += (pointerRef.current.y * 0.5 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      canvas!.style.opacity = String(1 - Math.max(0, (p - 0.86) / 0.14))
      renderer.render(scene, camera)
    }
    gsap.ticker.add(renderFn)

    return () => {
      st.kill()
      gsap.ticker.remove(renderFn)
      renderer.dispose()
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', blastOff)
      window.removeEventListener('pointercancel', blastOff)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="bg-canvas" />
}
