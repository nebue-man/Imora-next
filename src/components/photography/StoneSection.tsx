'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface CharData {
  x: number
  y: number
  r: number
  s: number
}

const SERVICES: { cls: string; title: string; desc: string }[] = [
  { cls: 'c1', title: 'Wedding',     desc: 'Full-day coverage from getting-ready to reception, delivered as one considered, editorial story.' },
  { cls: 'c2', title: 'Portrait',    desc: 'Individual, couple and family portraits shot on location or in studio, with a natural, unposed feel.' },
  { cls: 'c3', title: 'Product',     desc: 'Clean, considered product sets built on controlled light and honest colour.' },
  { cls: 'c4', title: 'Event',       desc: 'Live coverage of launches, functions and corporate days — unobtrusive, and delivered fast.' },
  { cls: 'c5', title: 'Commercial',  desc: 'Campaign and brand imagery made to work across print, social and everything in between.' },
  { cls: 'c6', title: 'Videography', desc: 'Films and motion work — wedding films, brand pieces and social cuts, shot and graded in house.' },
]

const ST_LINES = ['Wedding', 'Portrait', 'Product', 'Event', 'Commercial', 'Videography']

export default function StoneSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const sect = sectionRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const typeEl = typeRef.current
    if (!sect || !sticky || !typeEl) return

    // Split st-line text into individual character spans
    const chars: Array<HTMLElement & { __d: CharData }> = []
    typeEl.querySelectorAll<HTMLElement>('.st-line').forEach((line) => {
      const txt = line.textContent ?? ''
      line.innerHTML = txt.split('').map((c) => `<b>${c}</b>`).join('')
      line.querySelectorAll<HTMLElement>('b').forEach((b) => {
        const el = b as HTMLElement & { __d: CharData }
        el.__d = {
          x: (Math.random() - 0.5) * 900,
          y: (Math.random() - 0.5) * 700,
          r: (Math.random() - 0.5) * 150,
          s: 0.6 + Math.random() * 1.2,
        }
        chars.push(el)
      })
    })

    const st = { p: 0 }

    // THREE.JS setup
    let renderer: THREE.WebGLRenderer | null = null
    let rock: THREE.Object3D | null = null
    let slab: THREE.Group | null = null

    function setRockOpacity(obj: THREE.Object3D, v: number) {
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh && mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.transparent = true
          mat.opacity = v
        }
      })
    }

    let t2 = 0
    let renderFn: (() => void) | null = null
    let resizeStone: (() => void) | null = null

    if (canvas) {
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.25

        const scene = new THREE.Scene()
        const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
        cam.position.set(0, 0, 7)

        // Dramatic product-photography environment: bright white top, deep black floor
        const envC = document.createElement('canvas')
        envC.width = 32; envC.height = 256
        const eg = envC.getContext('2d')!
        const envGrad = eg.createLinearGradient(0, 0, 0, 256)
        envGrad.addColorStop(0.00, '#ffffff')
        envGrad.addColorStop(0.08, '#e8edf4')
        envGrad.addColorStop(0.20, '#2a2a35')
        envGrad.addColorStop(0.50, '#060608')
        envGrad.addColorStop(1.00, '#0c0c10')
        eg.fillStyle = envGrad; eg.fillRect(0, 0, 32, 256)
        const envT = new THREE.CanvasTexture(envC)
        envT.mapping = THREE.EquirectangularReflectionMapping
        try {
          const cubeRT = new THREE.WebGLCubeRenderTarget(256)
          cubeRT.fromEquirectangularTexture(renderer, envT)
          scene.environment = cubeRT.texture
        } catch { /* ignore */ }

        // Lights: warm key from upper-left, cool fill, blue rim from behind
        scene.add(new THREE.AmbientLight(0xffffff, 0.22))
        const key = new THREE.DirectionalLight(0xfff5e8, 3.8); key.position.set(-3, 9, 6); scene.add(key)
        const fill = new THREE.DirectionalLight(0x8fa8c8, 0.55); fill.position.set(5, -2, 3); scene.add(fill)
        const rim = new THREE.DirectionalLight(0x2060c0, 1.4); rim.position.set(0, -4, -6); scene.add(rim)
        const front = new THREE.PointLight(0xffffff, 0.7, 18); front.position.set(0.5, 1.5, 6); scene.add(front)

        function noise(x: number, y: number, z: number) {
          return Math.sin(x * 2.1 + y * 1.3) * Math.cos(y * 1.9 - z * 2.2) * 0.5
               + Math.sin(x * 4.7 - z * 3.1) * 0.28
               + Math.cos(y * 7.3 + x * 5.1) * 0.13
        }
        function roughen(geo: THREE.BufferGeometry, amount: number) {
          const pos = geo.attributes.position as THREE.BufferAttribute
          const v = new THREE.Vector3()
          for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i)
            const n = noise(v.x, v.y, v.z)
            const len = v.length() || 1
            v.addScaledVector(v.clone().divideScalar(len), n * amount)
            pos.setXYZ(i, v.x, v.y, v.z)
          }
          pos.needsUpdate = true
          geo.computeVertexNormals()
          return geo
        }

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9c968a, roughness: 0.98, metalness: 0.02, transparent: true })
        const rockMesh = new THREE.Mesh(roughen(new THREE.IcosahedronGeometry(1.25, 5), 0.20), stoneMat)
        scene.add(rockMesh)
        rock = rockMesh

        // Load camera_lens.glb — polyfill KHR_materials_pbrSpecularGlossiness (removed in three.js r152+)
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
              diffuseFactor?: number[]; diffuseTexture?: { index: number }
              specularFactor?: number[]; glossinessFactor?: number
            } | undefined
            if (!ext) return Promise.resolve()
            const pending: Promise<void>[] = []
            if (ext.diffuseTexture) pending.push(this.parser.assignTexture(params, 'map', ext.diffuseTexture))
            if (ext.diffuseFactor) params.color = new THREE.Color(ext.diffuseFactor[0], ext.diffuseFactor[1], ext.diffuseFactor[2])
            const gloss = ext.glossinessFactor ?? 1.0
            const spec = ext.specularFactor ?? [1, 1, 1]
            params.roughness = Math.max(0.22, 1.0 - gloss * 0.72)
            params.metalness = Math.max(spec[0] as number, spec[1] as number, spec[2] as number) * 0.48
            return Promise.all(pending)
          }
        }
        const gltfLoader = new GLTFLoader()
        gltfLoader.register((parser) => new PbrSpecularGlossinessPlugin(parser as unknown as PbrSGParser))
        const draco = new DRACOLoader()
        draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        gltfLoader.setDRACOLoader(draco)
        gltfLoader.load('/camera_lens.glb', (gltf) => {
          const m = gltf.scene
          const b = new THREE.Box3().setFromObject(m)
          const sz = b.getSize(new THREE.Vector3())
          const ct = b.getCenter(new THREE.Vector3())
          const kk = 2.6 / (Math.max(sz.x, sz.y, sz.z) || 1)
          m.scale.setScalar(kk)
          m.position.set(-ct.x * kk, -ct.y * kk, -ct.z * kk)
          m.traverse((o) => {
            const mesh = o as THREE.Mesh
            if (mesh.isMesh && mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial
              mat.transparent = true
              mat.envMapIntensity = 1.8
              mat.needsUpdate = true
            }
          })
          const holder = new THREE.Group()
          holder.add(m)
          scene.add(holder)
          if (rock) scene.remove(rock)
          rock = holder
        }, undefined, (err) => {
          console.warn('[imora] could not load camera_lens.glb — keeping rock', err)
        })

        // Aperture slab
        slab = new THREE.Group()
        const apMetal = new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.34, metalness: 0.92, transparent: true, opacity: 0 })
        const apBlade = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.42, metalness: 0.78, transparent: true, opacity: 0, side: THREE.DoubleSide })
        const apGlass = new THREE.MeshStandardMaterial({ color: 0x08111c, roughness: 0.05, metalness: 1.0, transparent: true, opacity: 0, emissive: new THREE.Color(0x061828), emissiveIntensity: 0 })

        const apRing = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.13, 18, 64), apMetal); slab.add(apRing)
        const apRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.055, 14, 56), apMetal); apRing2.position.z = 0.07; slab.add(apRing2)
        const apGlassMesh = new THREE.Mesh(new THREE.CircleGeometry(1.02, 64), apGlass); apGlassMesh.position.z = -0.14; slab.add(apGlassMesh)

        const blades: THREE.Mesh[] = []
        for (let bi = 0; bi < 8; bi++) {
          const shape = new THREE.Shape()
          shape.moveTo(0, 0); shape.lineTo(1.16, 0.30); shape.lineTo(1.16, -0.62); shape.lineTo(0.10, -0.34); shape.lineTo(0, 0)
          const blade = new THREE.Mesh(new THREE.ShapeGeometry(shape), apBlade)
          blade.rotation.z = (bi / 8) * Math.PI * 2
          blade.position.z = 0.02 + bi * 0.002
          blade.userData.base = blade.rotation.z
          slab.add(blade); blades.push(blade)
        }
        slab.userData.blades = blades
        slab.userData.mats = [apMetal, apBlade, apGlass]
        slab.userData.glass = apGlass
        scene.add(slab)

        resizeStone = () => {
          const w = sticky.clientWidth, h = sticky.clientHeight
          renderer!.setSize(w, h, false)
          cam.aspect = w / h
          cam.updateProjectionMatrix()
        }
        resizeStone()
        window.addEventListener('resize', resizeStone)

        renderFn = () => {
          if (!rock) return
          const p = st.p
          t2 += 0.016

          // Quartic ease from y=12 — sharper deceleration = more dramatic arrival
          const drop = Math.min(p / 0.18, 1)
          const ease = 1 - Math.pow(1 - drop, 4)
          const y = 12 - ease * 12
          const scale = 0.20 + ease * 0.80

          const turn = Math.min(Math.max((p - 0.34) / 0.26, 0), 1)
          const turnE = turn * turn * (3 - 2 * turn)

          // Breathing: subtle scale + z pulse once lens is facing forward
          const settled = Math.max(0, (turnE - 0.55) / 0.45)
          const breathe = 1 + settled * Math.sin(t2 * 0.85) * 0.018

          rock.position.y = y
          rock.position.z = settled * Math.sin(t2 * 0.75) * 0.12
          rock.scale.setScalar(scale * (1 + p * 0.30) * breathe)
          rock.rotation.x = 0.25 + p * 0.45 - turnE * 0.62
          rock.rotation.y += 0.0016 * (1 - turnE)
          rock.rotation.y *= (1 - turnE * 0.06)
          setRockOpacity(rock, 1)
          rock.visible = true

          // Camera micro-drift once lens settles — handhold feel
          cam.position.x = Math.sin(t2 * 0.14) * 0.20 * turnE
          cam.position.y = Math.cos(t2 * 0.10) * 0.14 * turnE
          cam.lookAt(0, 0, 0)

          if (slab) {
            const apOpen = Math.min(Math.max((p - 0.46) / 0.22, 0), 1)
            slab.position.y = y * 0.10
            slab.position.z = -4.0
            slab.scale.setScalar(1.8 + turnE * 1.2 + p * 0.4)
            slab.rotation.z = turnE * 0.22
            slab.visible = turnE > 0.01
            const fade = turnE * 0.65
            ;(slab.userData.mats as THREE.MeshStandardMaterial[]).forEach((mt) => { mt.opacity = fade })
            ;(slab.userData.blades as THREE.Mesh[]).forEach((bl, i) => {
              bl.rotation.z = bl.userData.base + apOpen * 0.42 + Math.sin(t2 + i) * 0.012
            })
            // Aperture glass glows when iris opens
            const glassRef = slab.userData.glass as THREE.MeshStandardMaterial
            if (glassRef) glassRef.emissiveIntensity = apOpen * 0.5
          }

          renderer!.render(scene, cam)
        }
        gsap.ticker.add(renderFn)
      } catch { /* no WebGL */ }
    }

    // ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: sect,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) {
        const p = self.progress
        st.p = p

        // Background
        const dark = Math.min(p / 0.2, 1)
        const c = Math.round(215 - dark * 205)
        sticky.style.background = `rgb(${c},${c},${c + 2})`
        const ink = dark > 0.5 ? 'rgba(240,237,232,0.92)' : '#1b1b1b'
        sticky.querySelectorAll<HTMLElement>('.stone-label,.stone-foot,.stone-link').forEach((el) => { el.style.color = ink })

        // Character scatter
        const scatter = Math.min(Math.max((p - 0.20) / 0.20, 0), 1)
        const quiet = Math.min(Math.max((p - 0.44) / 0.16, 0), 1)
        chars.forEach((b) => {
          const d = b.__d
          b.style.transform = `translate(${d.x * scatter}px,${d.y * scatter}px) rotate(${d.r * scatter}deg) scale(${1 + (d.s - 1) * scatter})`
          b.style.opacity = String((1 - scatter * 0.86) * (1 - quiet * 0.75))
          b.style.color = dark > 0.5 ? '#e8e5df' : '#1b1b1b'
        })

        // Cards slide in
        const cardsIn = Math.min(Math.max((p - 0.50) / 0.28, 0), 1)
        const out = Math.min(Math.max((p - 0.94) / 0.06, 0), 1)
        const cardCfg: [string, number][] = [['.c1', -1], ['.c4', 1], ['.c2', -1], ['.c5', 1], ['.c3', -1], ['.c6', 1]]
        cardCfg.forEach(([cls, dir], i) => {
          const el = sticky.querySelector<HTMLElement>(cls)
          if (!el) return
          const t = Math.min(Math.max((cardsIn * 1.45) - i * 0.075, 0), 1)
          const e = 1 - Math.pow(1 - t, 3)
          el.style.opacity = String(e * (1 - out))
          el.style.transform = `translateX(${dir * (1 - e) * 42}vw)`
        })
      },
    })

    return () => {
      trigger.kill()
      if (renderFn) gsap.ticker.remove(renderFn)
      if (resizeStone) window.removeEventListener('resize', resizeStone)
      if (renderer) renderer.dispose()
    }
  }, [])

  return (
    <section className="stone" id="services" ref={sectionRef}>
      <div className="stone-sticky" ref={stickyRef}>
        <canvas className="stone-canvas" ref={canvasRef} />
        {SERVICES.map((s, i) => (
          <div className={`svc-card ${s.cls}`} key={s.cls}>
            <h4>{s.title}<i>0{i + 1}</i></h4>
            <p>{s.desc}</p>
          </div>
        ))}
        <div className="stone-ui">
          <div className="stone-label">Our Services</div>
          <div className="stone-type" ref={typeRef}>
            {ST_LINES.map((line) => (
              <div className="st-line" key={line}>{line}</div>
            ))}
          </div>
          <div className="stone-foot">&#10022; Different disciplines. One standard of craft.</div>
          <Link href="#contact" className="stone-link">View services <span>&rarr;</span></Link>
        </div>
      </div>
    </section>
  )
}
