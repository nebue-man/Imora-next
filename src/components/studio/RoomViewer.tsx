'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function RoomViewer() {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const stageEl = stageRef.current
    const hint = hintRef.current
    if (!canvas || !stageEl) return
    const stage: HTMLDivElement = stageEl

    function webglOK() {
      try {
        const c = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
      } catch { return false }
    }
    if (!webglOK()) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x08080a)
    scene.fog = new THREE.Fog(0x08080a, 9, 22)

    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 100)
    camera.position.set(0, 1.55, 0)
    camera.rotation.order = 'YXZ'

    const W = 8, D = 9, H = 3.2

    function noiseTex(base: string, spec: string, size = 256) {
      const c = document.createElement('canvas')
      c.width = c.height = size
      const x = c.getContext('2d')!
      x.fillStyle = base; x.fillRect(0, 0, c.width, c.height)
      for (let i = 0; i < 14000; i++) {
        x.fillStyle = `rgba(${spec},${0.03 + Math.random() * 0.16})`
        x.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2)
      }
      const t = new THREE.CanvasTexture(c)
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      return t
    }

    const matFloor = new THREE.MeshStandardMaterial({ color: 0x16161a, roughness: 0.94 })
    const matCeil  = new THREE.MeshStandardMaterial({ color: 0x0c0c0f, roughness: 1 })
    const matWall  = new THREE.MeshStandardMaterial({ map: noiseTex('#1a1a1f', '90,88,84'), roughness: 0.95 })
    const matPanel = new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: 1 })
    const matDark  = new THREE.MeshStandardMaterial({ color: 0x0e0e11, roughness: 0.7, metalness: 0.25 })
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x8d9198, roughness: 0.35, metalness: 0.9 })
    const matWood  = new THREE.MeshStandardMaterial({ color: 0x4a3527, roughness: 0.68 })
    const matGold  = new THREE.MeshStandardMaterial({ color: 0xc9a76a, roughness: 0.4, metalness: 0.7 })

    function addBox(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      m.position.set(x, y, z); scene.add(m); return m
    }
    function addCyl(rt: number, rb: number, h: number, mat: THREE.Material, x: number, y: number, z: number, seg = 20) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)
      m.position.set(x, y, z); scene.add(m); return m
    }

    // Shell
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), matFloor)
    floor.rotation.x = -Math.PI / 2; scene.add(floor)
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), matCeil)
    ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil)

    const wallConfigs: [number, number, number][] = [[0, -D / 2, 0], [0, D / 2, Math.PI], [-W / 2, 0, Math.PI / 2], [W / 2, 0, -Math.PI / 2]]
    wallConfigs.forEach((w, i) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(i < 2 ? W : D, H), matWall)
      wall.position.set(i < 2 ? 0 : w[0], H / 2, i < 2 ? w[1] : 0)
      wall.rotation.y = w[2]; scene.add(wall)
    })

    // Acoustic treatment
    for (let px = -3; px <= 3; px += 1.0) {
      for (let py = 0; py < 3; py++) {
        const p = addBox(0.86, 0.72, 0.09, matPanel, px, 0.85 + py * 0.8, -D / 2 + 0.06)
        p.rotation.z = (px + py) % 2 ? 0 : Math.PI / 2
      }
    }
    ;[[-W / 2 + 0.35, -D / 2 + 0.35], [W / 2 - 0.35, -D / 2 + 0.35]].forEach((c) => {
      addCyl(0.28, 0.28, H, matPanel, c[0], H / 2, c[1], 12)
    })

    // Table
    addBox(2.6, 0.09, 1.25, matWood, 0, 0.74, -0.2)
    ;[[-1.15, -0.9], [1.15, -0.9], [-1.15, 0.1], [1.15, 0.1]].forEach((l) => {
      addCyl(0.05, 0.05, 0.74, matDark, l[0], 0.37, l[1], 10)
    })

    // Seats
    const seats: [number, number][] = [[-0.85, 0.75], [0.85, 0.75], [-0.85, -1.2], [0.85, -1.2]]
    seats.forEach((s) => {
      addBox(0.52, 0.08, 0.5, matDark, s[0], 0.45, s[1])
      addBox(0.52, 0.62, 0.08, matDark, s[0], 0.78, s[1] + (s[1] > 0 ? 0.22 : -0.22))
      addCyl(0.05, 0.05, 0.45, matMetal, s[0], 0.22, s[1], 10)
      addCyl(0.26, 0.26, 0.03, matMetal, s[0], 0.02, s[1], 14)
    })

    // Microphones on boom arms
    seats.forEach((s) => {
      const dir = s[1] > 0 ? -1 : 1
      const arm = addBox(0.045, 0.045, 0.85, matDark, s[0], 1.16, s[1] + dir * 0.42)
      arm.rotation.x = dir * 0.32
      const mic = addCyl(0.05, 0.062, 0.2, matDark, s[0], 1.02, s[1] + dir * 0.74, 14)
      mic.rotation.x = dir * 0.85
      addCyl(0.058, 0.058, 0.02, matGold, s[0], 0.94, s[1] + dir * 0.8, 14)
    })

    // Three camera rigs
    const camRigs = [
      { x: 0, z: 2.9, ry: Math.PI },
      { x: -2.2, z: 1.9, ry: Math.PI - 0.62 },
      { x: 2.2, z: 1.9, ry: Math.PI + 0.62 },
    ]
    camRigs.forEach((c) => {
      addCyl(0.035, 0.035, 1.35, matMetal, c.x, 0.68, c.z, 10)
      ;[0, 2.1, 4.2].forEach((a) => {
        const leg = addCyl(0.02, 0.02, 0.8, matMetal, c.x + Math.sin(a) * 0.22, 0.33, c.z + Math.cos(a) * 0.22, 8)
        leg.rotation.z = Math.sin(a) * 0.3
        leg.rotation.x = Math.cos(a) * 0.3
      })
      const body = addBox(0.3, 0.21, 0.19, matDark, c.x, 1.45, c.z)
      body.rotation.y = c.ry
      const lensGrp = new THREE.Group()
      const lens = addCyl(0.075, 0.085, 0.26, matDark, 0, 0, -0.2, 20)
      lens.rotation.x = Math.PI / 2
      scene.remove(lens); lensGrp.add(lens)
      const ring = addCyl(0.088, 0.088, 0.03, matMetal, 0, 0, -0.33, 20)
      ring.rotation.x = Math.PI / 2
      scene.remove(ring); lensGrp.add(ring)
      lensGrp.position.set(c.x, 1.45, c.z)
      lensGrp.rotation.y = c.ry
      scene.add(lensGrp)
      const tallyMat = new THREE.MeshStandardMaterial({ color: 0xe8703a, emissive: new THREE.Color(0xe8703a), emissiveIntensity: 2.4 })
      const tally = addCyl(0.014, 0.014, 0.012, tallyMat, c.x, 1.57, c.z, 10)
      tally.rotation.x = Math.PI / 2
    })

    // Lighting rig
    function softbox(x: number, z: number, tint: number, power: number) {
      const panel = addBox(0.86, 0.86, 0.07, new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: new THREE.Color(tint), emissiveIntensity: 1.5,
      }), x, 2.42, z)
      panel.lookAt(0, 1.2, -0.2)
      const l = new THREE.PointLight(tint, power, 12, 2)
      l.position.set(x, 2.35, z); scene.add(l)
      addCyl(0.02, 0.02, 0.75, matMetal, x, 2.82, z, 8)
    }
    softbox(-1.9, 1.7, 0xfff2e0, 12)
    softbox(1.9, 1.7, 0xfff2e0, 12)
    softbox(0, -2.6, 0xffe9d0, 8)

    ;[-2.6, -1.3, 1.3, 2.6].forEach((x, i) => {
      const col = i % 2 ? 0xc9a76a : 0xe8703a
      addBox(0.06, 1.7, 0.06, new THREE.MeshStandardMaterial({
        color: col, emissive: new THREE.Color(col), emissiveIntensity: 2.2,
      }), x, 1.5, -D / 2 + 0.16)
      const pl = new THREE.PointLight(col, 3.2, 6, 2)
      pl.position.set(x, 1.5, -D / 2 + 0.5); scene.add(pl)
    })

    const mon = addBox(1.0, 0.58, 0.05, new THREE.MeshStandardMaterial({
      color: 0x0a0a0c, emissive: new THREE.Color(0x24303c), emissiveIntensity: 0.85,
    }), 0, 1.75, D / 2 - 0.12)
    mon.rotation.y = Math.PI

    scene.add(new THREE.AmbientLight(0xffffff, 0.34))
    scene.add(new THREE.HemisphereLight(0xbfd0e8, 0x201a14, 0.5))

    // Look-around controls
    let yaw = Math.PI, pitch = -0.04, tYaw = Math.PI, tPitch = -0.04
    let fov = 68, tFov = 68
    let dragging = false, lx = 0, ly = 0, touched = false

    function hideHint() {
      if (touched) return
      touched = true
      if (hint) hint.classList.add('hide')
    }

    const onPointerDown = (e: PointerEvent) => {
      dragging = true; lx = e.clientX; ly = e.clientY
      stage.classList.add('dragging')
      stage.setPointerCapture(e.pointerId)
      hideHint()
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      tYaw -= (e.clientX - lx) * 0.0042
      tPitch -= (e.clientY - ly) * 0.0034
      tPitch = Math.max(-0.62, Math.min(0.55, tPitch))
      lx = e.clientX; ly = e.clientY
    }
    const onPointerUp = () => { dragging = false; stage.classList.remove('dragging') }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      tFov = Math.max(38, Math.min(88, tFov + e.deltaY * 0.045))
    }

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    ;['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => {
      stage.addEventListener(ev, onPointerUp)
    })
    stage.addEventListener('wheel', onWheel, { passive: false })

    // Preset views
    const views = [
      { yaw: Math.PI * 0.72, pitch: -0.05, fov: 62 },
      { yaw: Math.PI * 1.28, pitch: -0.05, fov: 62 },
      { yaw: 0,              pitch: 0.02,  fov: 66 },
      { yaw: Math.PI,        pitch: -0.06, fov: 84 },
    ]
    const viewButtons = stage.closest('.room')?.querySelectorAll<HTMLButtonElement>('.room-legend button')
    const onViewClick = (b: HTMLButtonElement) => () => {
      const v = views[+(b.dataset.view ?? 3)] ?? views[3]
      tYaw = v.yaw; tPitch = v.pitch; tFov = v.fov
      hideHint()
    }
    const viewHandlers: Array<{ btn: HTMLButtonElement; fn: () => void }> = []
    viewButtons?.forEach((b) => {
      const fn = onViewClick(b)
      b.addEventListener('click', fn)
      viewHandlers.push({ btn: b, fn })
    })

    // Resize
    function resizeRoom() {
      const w = stage.clientWidth, h = stage.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resizeRoom()
    window.addEventListener('resize', resizeRoom)

    // Render loop (uses requestAnimationFrame, not GSAP ticker — this runs always, not scroll-dependent)
    let idle = 0
    let rafId: number
    const loop = () => {
      rafId = requestAnimationFrame(loop)
      if (!touched) { idle += 0.0016; tYaw = Math.PI + Math.sin(idle) * 0.32 }
      yaw   += (tYaw - yaw) * 0.075
      pitch += (tPitch - pitch) * 0.075
      fov   += (tFov - fov) * 0.09
      camera.fov = fov
      camera.updateProjectionMatrix()
      camera.rotation.y = yaw
      camera.rotation.x = pitch
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      window.removeEventListener('resize', resizeRoom)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      ;['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => {
        stage.removeEventListener(ev, onPointerUp)
      })
      stage.removeEventListener('wheel', onWheel)
      viewHandlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn))
    }
  }, [])

  return (
    <div className="room-stage" id="stage" ref={stageRef}>
      <canvas id="room-canvas" ref={canvasRef} />
      <div className="room-fallback">
        Your browser can&rsquo;t render the 3D room.<br />
        The equipment list below covers everything in it.
      </div>
      <div className="room-hint" id="hint" ref={hintRef}>Drag to look around</div>
    </div>
  )
}
