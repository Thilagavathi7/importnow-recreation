import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import { Water } from 'three/addons/objects/Water.js'
import {
  getShipProgress,
  getVoyageDay,
} from '../../data/shipmentStages.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)
const hash = (n) => (Math.sin(n * 127.1) * 43758.5453) % 1

const L = 46
const B = 7.6
const D = 4.6
const T = 2.0
const DECK = D - T
const yMin = -T
const yMax = DECK + 1.3
const CW = 3.05
const CH = 1.3
const CD = 1.52
const HATCH = DECK + 0.38
const QUAY = 2.5
const SAIL = 520
const DOCK_OUT = 0.4
const DOCK_IN = 0.84
const LOAD0 = 0.03
const LOAD_STEP = 0.33 / 12
const UNL0 = 0.86
const UNL_STEP = 0.125 / 12
const HMAX = 21

const PALETTE = [
  0xb5362b, 0x2b5d8f, 0x3f7a4c, 0xd98a2b, 0x8a9097, 0x6b2e2e,
  0xe1c04a, 0xe9ecef, 0x1f6f8b, 0xb5362b, 0x2b5d8f, 0x8a9097,
]

const KF = [
  { p: 0, o: [58, 34, 74], l: [-2, 10, -8] },
  { p: 0.13, o: [24, 42, 84], l: [0, 10, -10] },
  { p: 0.27, o: [-52, 30, 64], l: [0, 8, -6] },
  { p: 0.4, o: [-74, 16, 42], l: [6, 5, 0] },
  { p: 0.52, o: [-50, 10, 40], l: [8, 4, 0] },
  { p: 0.64, o: [38, 9, 56], l: [0, 4, 0] },
  { p: 0.76, o: [66, 16, 46], l: [-4, 4, 0] },
  { p: 0.84, o: [44, 32, 76], l: [0, 9, -8] },
  { p: 0.92, o: [-22, 42, 88], l: [0, 10, -10] },
  { p: 1, o: [-50, 54, 104], l: [4, 7, -14] },
]

function makeMaterial(color, roughness = 0.6, metalness = 0.1, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra })
}

function addBox(w, h, d, mat, x = 0, y = 0, z = 0, parent, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  mesh.position.set(x, y, z)
  if (shadow) {
    mesh.castShadow = true
    mesh.receiveShadow = true
  }
  parent.add(mesh)
  return mesh
}

const UP = new THREE.Vector3(0, 1, 0)
function addStrut(a, b, r, mat, parent) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, A.distanceTo(B), 8),
    mat,
  )
  mesh.position.copy(A).add(B).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize())
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}

function createCanvasTexture(w, h, draw, srgb = true, textures = []) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  textures.push(t)
  return t
}

function addNoise(g, w, h, count, colorFn) {
  for (let i = 0; i < count; i += 1) {
    g.fillStyle = colorFn(Math.random())
    g.fillRect(
      Math.random() * w,
      Math.random() * h,
      1 + Math.random() * 3,
      1 + Math.random() * 3,
    )
  }
}

function buildHullGeometry() {
  const NS = 84
  const pos = []
  const uv = []
  const idx = []
  const deckP = []
  const st0 = []
  let NP = 0

  for (let s = 0; s <= NS; s += 1) {
    const u = s / NS
    const x0 = -L / 2 + u * L
    let top = B / 2
    let bot = B / 2
    let keel = -T
    let vb = 0
    let rake = 0
    let sheer = 0

    if (u > 0.7) {
      const k = (u - 0.7) / 0.3
      top = (B / 2) * (1 - Math.pow(k, 2.6))
      bot = (B / 2) * (1 - Math.pow(k, 1.3))
      vb = Math.pow(k, 1.1) * 0.9
    }
    if (u > 0.8) {
      const k = (u - 0.8) / 0.2
      sheer = k * k * 1.2
    }
    if (u > 0.9) {
      const k = (u - 0.9) / 0.1
      keel = -T + Math.pow(k, 1.7) * T * 1.2
      rake = k * 3
    }
    if (u < 0.12) {
      const k = (0.12 - u) / 0.12
      top = (B / 2) * (1 - 0.07 * k)
      bot = (B / 2) * (1 - 0.5 * k)
      vb = Math.max(vb, 0.2 * k)
    }
    if (u < 0.05) {
      const k = (0.05 - u) / 0.05
      keel = -T + Math.pow(k, 1.3) * T * 0.7
    }

    top = Math.max(top, 0.015)
    bot = Math.max(Math.min(bot, top), 0.01)
    const dk = DECK + sheer
    if (keel > dk - 0.3) keel = dk - 0.3
    const r = Math.max(0.01, Math.min(1.1, bot * 0.8, (dk - keel) * 0.45))

    const U = []
    for (let i = 0; i < 10; i += 1) {
      const t = i / 10
      U.push([lerp(top, bot, t), lerp(dk, keel + r, t)])
    }
    for (let i = 0; i <= 6; i += 1) {
      const a = (i / 6) * (Math.PI / 2)
      U.push([bot - r + Math.cos(a) * r, keel + r - Math.sin(a) * r])
    }
    for (let i = 1; i <= 4; i += 1) {
      U.push([(bot - r) * (1 - i / 4), keel])
    }

    const n = U.length
    const half = U.map((p, i) => {
      const f = i / (n - 1)
      return [lerp(p[0], top * (1 - f), vb), lerp(p[1], lerp(dk, keel, f), vb)]
    })
    const full = half.concat(half.slice(0, -1).reverse().map((p) => [-p[0], p[1]]))
    NP = full.length

    const ring = []
    for (const [z, y] of full) {
      const x = x0 + rake * ((y - keel) / (dk - keel))
      pos.push(x, y, z)
      uv.push(u, (y - yMin) / (yMax - yMin))
      ring.push([x, y, z])
    }
    if (s === 0) st0.push(...ring)
    deckP.push({ x: x0 + rake, y: dk, w: top })
  }

  for (let s = 0; s < NS; s += 1) {
    for (let j = 0; j < NP - 1; j += 1) {
      const a = s * NP + j
      const b = a + 1
      const c = a + NP
      const d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  }

  const base = pos.length / 3
  let cy = 0
  st0.forEach((p) => {
    cy += p[1]
  })
  cy /= st0.length
  st0.forEach((p) => {
    pos.push(p[0], p[1], p[2])
    uv.push(0, (p[1] - yMin) / (yMax - yMin))
  })
  pos.push(-L / 2, cy, 0)
  uv.push(0, (cy - yMin) / (yMax - yMin))
  for (let j = 0; j < NP - 1; j += 1) {
    idx.push(base + NP, base + j + 1, base + j)
  }

  const hull = new THREE.BufferGeometry()
  hull.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  hull.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  hull.setIndex(idx)
  hull.computeVertexNormals()

  const dp = []
  const di = []
  deckP.forEach((d, i) => {
    dp.push(d.x, d.y, d.w, d.x, d.y, -d.w)
    if (i < deckP.length - 1) {
      const a = i * 2
      di.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const deck = new THREE.BufferGeometry()
  deck.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3))
  deck.setIndex(di)
  deck.computeVertexNormals()

  const bw = []
  const bi = []
  const fwd = deckP.filter((_, i) => i / NS > 0.86)
  fwd.forEach((d, i) => {
    for (const sg of [1, -1]) {
      bw.push(d.x, d.y, d.w * sg, d.x + 0.05, d.y + 1.1, (d.w * 1.03 + 0.02) * sg)
    }
    if (i < fwd.length - 1) {
      for (const o of [0, 2]) {
        const a = i * 4 + o
        bi.push(a, a + 4, a + 1, a + 1, a + 4, a + 5)
      }
    }
  })
  const bulwark = new THREE.BufferGeometry()
  bulwark.setAttribute('position', new THREE.Float32BufferAttribute(bw, 3))
  bulwark.setIndex(bi)
  bulwark.computeVertexNormals()

  return { hull, deck, bulwark, deckP }
}

function slotsFor(withTop) {
  const s = []
  for (let l = 0; l < 3; l += 1) {
    for (let c = 0; c < 9; c += 1) {
      for (let r = 0; r < 4; r += 1) s.push({ c, r, l })
    }
  }
  if (withTop) {
    for (let c = 1; c <= 6; c += 1) {
      for (let r = 0; r < 4; r += 1) s.push({ c, r, l: 3, top: true })
    }
  }
  s.forEach((o) => {
    o.x = -12.4 + o.c * 3.18
    o.y = HATCH + CH / 2 + o.l * (CH + 0.03)
    o.z = -2.4 + o.r * 1.6
    o.brand = (o.c * 7 + o.r * 3 + o.l * 5) % 9 === 0
    o.col = PALETTE[(o.c * 5 + o.r * 7 + o.l * 3) % PALETTE.length]
  })
  return s
}

function setCranePose(cr, z, y) {
  cr.trolley.position.z = z
  cr.spreader.position.set(0, y, z)
  const top = cr.gy - 1.8
  const len = top - (y + 0.2)
  for (const cb of cr.cables) {
    cb.m.position.set(cb.ox, (top + y + 0.2) / 2, z + cb.oz)
    cb.m.scale.y = Math.max(0.01, len)
  }
}

function pathPoint(t, from, to) {
  if (t < 0.28) {
    const k = smooth(t / 0.28)
    return [from[0], lerp(from[1], HMAX, k), from[2]]
  }
  if (t < 0.62) {
    const k = smooth((t - 0.28) / 0.34)
    return [lerp(from[0], to[0], k), HMAX, lerp(from[2], to[2], k)]
  }
  const k = smooth((t - 0.62) / 0.38)
  return [to[0], lerp(HMAX, to[1], k), to[2]]
}

function VoyageScene({ progressRef, hostRef, onReady, onSyncUI }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return undefined

    const mobile = window.matchMedia('(max-width:820px)').matches
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
      })
    } catch {
      host.dataset.renderer = 'svg-fallback'
      delete canvas.dataset.engine
      onReady?.()
      return undefined
    }

    host.dataset.renderer = 'three'
    if (!canvas.dataset.engine) {
      canvas.dataset.engine = `three.js r${THREE.REVISION}`
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.5
    renderer.shadowMap.enabled = !mobile
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xc6d4e2, 200, 1700)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 20000)

    const sun = new THREE.Vector3().setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(90 - 13),
      THREE.MathUtils.degToRad(122),
    )

    const sky = new Sky()
    sky.scale.setScalar(10000)
    const su = sky.material.uniforms
    su.turbidity.value = 5
    su.rayleigh.value = 1.4
    su.mieCoefficient.value = 0.004
    su.mieDirectionalG.value = 0.82
    su.sunPosition.value.copy(sun)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    envScene.add(sky)
    const envRT = pmrem.fromScene(envScene)
    scene.environment = envRT.texture
    scene.add(sky)

    const textures = []
    let disposed = false

    const waterNormals = new THREE.TextureLoader().load(
      '/assets/waternormals.jpg',
      () => {
        if (!disposed) onReady?.()
      },
      undefined,
      () => {
        if (!disposed) onReady?.()
      },
    )
    waterNormals.wrapS = THREE.RepeatWrapping
    waterNormals.wrapT = THREE.RepeatWrapping
    textures.push(waterNormals)

    const water = new Water(new THREE.PlaneGeometry(10000, 10000), {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals,
      sunDirection: sun.clone(),
      sunColor: 0xfff4e0,
      waterColor: 0x0b3a55,
      distortionScale: 2.4,
      fog: true,
    })
    water.rotation.x = -Math.PI / 2
    water.material.uniforms.size.value = 2.6
    scene.add(water)

    scene.add(new THREE.HemisphereLight(0xdde8ff, 0x50606c, 0.35))
    const sunL = new THREE.DirectionalLight(0xfff0dc, 2.6)
    sunL.castShadow = !mobile
    sunL.shadow.mapSize.set(1024, 1024)
    Object.assign(sunL.shadow.camera, {
      left: -75,
      right: 75,
      top: 75,
      bottom: -75,
      near: 1,
      far: 500,
    })
    sunL.shadow.bias = -0.0004
    sunL.shadow.normalBias = 0.03
    scene.add(sunL)
    scene.add(sunL.target)

    const hullTex = createCanvasTexture(
      512,
      1024,
      (g, w, h) => {
        for (let row = 0; row < h; row += 1) {
          const y = yMin + (1 - row / h) * (yMax - yMin)
          g.fillStyle = y < -0.05 ? '#8f2a1f' : y < 0.42 ? '#16181d' : '#111214'
          g.fillRect(0, row, w, 1)
        }
        g.globalAlpha = 0.07
        for (let x = 0; x < w; x += 32) {
          g.fillStyle = '#000'
          g.fillRect(x, 0, 1, h)
        }
        g.globalAlpha = 1
        addNoise(
          g,
          w,
          h,
          2500,
          (r) => `rgba(${r > 0.5 ? 255 : 0},${r > 0.5 ? 255 : 0},${r > 0.5 ? 255 : 0},.035)`,
        )
        for (let i = 0; i < 40; i += 1) {
          const x = Math.random() * w
          const y0 = h * (0.08 + Math.random() * 0.25)
          const gr = g.createLinearGradient(0, y0, 0, y0 + 60 + Math.random() * 80)
          gr.addColorStop(0, 'rgba(120,60,30,.18)')
          gr.addColorStop(1, 'rgba(120,60,30,0)')
          g.fillStyle = gr
          g.fillRect(x, y0, 1.5, 140)
        }
      },
      true,
      textures,
    )

    const HG = buildHullGeometry()

    const winTex = createCanvasTexture(
      256,
      64,
      (g, w, h) => {
        g.fillStyle = '#eef1f4'
        g.fillRect(0, 0, w, h)
        for (let i = 0; i < 9; i += 1) {
          const x = 10 + i * 27
          const gr = g.createLinearGradient(0, 18, 0, 42)
          gr.addColorStop(0, '#3e5672')
          gr.addColorStop(1, '#1b2838')
          g.fillStyle = gr
          g.fillRect(x, 20, 17, 22)
        }
        g.fillStyle = 'rgba(0,0,0,.08)'
        g.fillRect(0, h - 3, w, 3)
      },
      true,
      textures,
    )

    const bridgeTex = createCanvasTexture(
      256,
      64,
      (g, w, h) => {
        g.fillStyle = '#eef1f4'
        g.fillRect(0, 0, w, h)
        const gr = g.createLinearGradient(0, 12, 0, 44)
        gr.addColorStop(0, '#5b7896')
        gr.addColorStop(1, '#14202e')
        g.fillStyle = gr
        g.fillRect(0, 14, w, 28)
        g.fillStyle = '#eef1f4'
        for (let x = 0; x < w; x += 21) g.fillRect(x, 14, 2, 28)
      },
      true,
      textures,
    )

    const white = makeMaterial(0xeef1f4, 0.55, 0.1)
    const winMat = new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.45, metalness: 0.1 })
    const bridgeMat = new THREE.MeshStandardMaterial({
      map: bridgeTex,
      roughness: 0.3,
      metalness: 0.2,
    })

    const corrugated = (base, label = false) =>
      createCanvasTexture(
        512,
        256,
        (g, w, h) => {
          g.fillStyle = base
          g.fillRect(0, 0, w, h)
          for (let x = 10; x < w - 10; x += 14) {
            g.fillStyle = 'rgba(255,255,255,.28)'
            g.fillRect(x, 14, 4, h - 28)
            g.fillStyle = 'rgba(0,0,0,.2)'
            g.fillRect(x + 6, 14, 5, h - 28)
          }
          g.fillStyle = 'rgba(0,0,0,.38)'
          g.fillRect(0, 0, w, 13)
          g.fillRect(0, h - 13, w, 13)
          g.fillRect(0, 0, 10, h)
          g.fillRect(w - 10, 0, 10, h)
          addNoise(
            g,
            w,
            h,
            900,
            (r) => `rgba(${(90 + r * 40) | 0},${(55 + r * 20) | 0},30,${0.05 + r * 0.08})`,
          )
          if (label) {
            g.fillStyle = '#fff'
            g.font = '800 64px Sora, Arial Black, sans-serif'
            g.textAlign = 'center'
            g.textBaseline = 'middle'
            g.fillText('IMPORTNOW', w / 2, h / 2 + 4)
            g.font = '600 22px Inter, Arial, sans-serif'
            g.fillText('importnow.in', w / 2, h / 2 + 50)
          }
        },
        true,
        textures,
      )

    const contMat = new THREE.MeshStandardMaterial({
      map: corrugated('#ffffff'),
      roughness: 0.55,
      metalness: 0.3,
    })
    const brandMat = new THREE.MeshStandardMaterial({
      map: corrugated('#101010', true),
      roughness: 0.5,
      metalness: 0.3,
    })
    const contGeo = new THREE.BoxGeometry(CW, CH, CD)

    function shipBody() {
      const g = new THREE.Group()
      const hull = new THREE.Mesh(
        HG.hull,
        new THREE.MeshStandardMaterial({
          map: hullTex,
          roughness: 0.5,
          metalness: 0.35,
          side: THREE.DoubleSide,
        }),
      )
      hull.castShadow = true
      hull.receiveShadow = true
      g.add(hull)

      const deck = new THREE.Mesh(
        HG.deck,
        makeMaterial(0x6a3f33, 0.85, 0.1, { side: THREE.DoubleSide }),
      )
      deck.receiveShadow = true
      g.add(deck)

      const bw = new THREE.Mesh(
        HG.bulwark,
        new THREE.MeshStandardMaterial({
          color: 0x111214,
          roughness: 0.5,
          metalness: 0.35,
          side: THREE.DoubleSide,
        }),
      )
      bw.castShadow = true
      g.add(bw)

      const rp = []
      HG.deckP.forEach((d, i) => {
        const u = i / (HG.deckP.length - 1)
        if (u < 0.03 || u > 0.86) return
        for (const s of [1, -1]) {
          const z = (d.w - 0.08) * s
          if (i % 2 === 0) rp.push(d.x, d.y, z, d.x, d.y + 0.7, z)
          const n = HG.deckP[i + 1]
          if (n && (i + 1) / (HG.deckP.length - 1) <= 0.86) {
            rp.push(d.x, d.y + 0.7, z, n.x, n.y + 0.7, (n.w - 0.08) * s)
          }
        }
      })
      const rg = new THREE.BufferGeometry()
      rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3))
      g.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xcfd5dc })))

      const hatch = makeMaterial(0x4b5560, 0.7, 0.3)
      for (let c = 0; c < 9; c += 1) {
        addBox(3.05, 0.36, B - 1.2, hatch, -12.4 + c * 3.18, DECK + 0.18, 0, g)
      }
      const lash = makeMaterial(0xb9c0c8, 0.6, 0.4)
      for (let c = 0; c < 8; c += 1) {
        addBox(0.18, 2.6, B - 1, lash, -12.4 + c * 3.18 + 1.59, HATCH + 1.3, 0, g)
      }

      const ax = -17.6
      const mats = [winMat, winMat, white, white, winMat, winMat]
      for (let i = 0; i < 5; i += 1) {
        addBox(5.4 - i * 0.12, 1.25, B - 0.9, mats, ax, DECK + 0.625 + i * 1.25, 0, g)
      }
      const by = DECK + 5 * 1.25 + 0.7
      addBox(
        4.6,
        1.4,
        B + 2.6,
        [bridgeMat, bridgeMat, white, white, bridgeMat, bridgeMat],
        ax + 0.3,
        by,
        0,
        g,
      )
      addBox(4.9, 0.16, B + 2.9, white, ax + 0.3, by + 0.78, 0, g)
      const mast = makeMaterial(0xdfe3e8, 0.5, 0.4)
      addBox(0.18, 3.2, 0.18, mast, ax - 0.6, by + 2.4, 0, g)
      addBox(0.12, 0.12, 2.2, mast, ax - 0.6, by + 3.2, 0, g)
      const radar = addBox(1.8, 0.1, 0.28, makeMaterial(0x2b2f36, 0.4, 0.5), ax + 0.6, by + 2.1, 0, g)
      radar.name = 'radar'

      const fun = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.2, 4.6, 28),
        makeMaterial(0x111214, 0.45, 0.3),
      )
      fun.scale.z = 0.72
      fun.position.set(-21.4, DECK + 6.6, 0)
      fun.castShadow = true
      g.add(fun)

      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(1.08, 1.12, 0.9, 28),
        makeMaterial(0xc8352a, 0.5, 0.2),
      )
      band.scale.z = 0.72
      band.position.set(-21.4, DECK + 7.4, 0)
      g.add(band)

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(1.06, 1.06, 0.4, 28),
        makeMaterial(0x111316, 0.6, 0.3),
      )
      cap.scale.z = 0.72
      cap.position.set(-21.4, DECK + 8.95, 0)
      g.add(cap)

      const lb = makeMaterial(0xff6a1a, 0.45, 0.1)
      for (const s of [1, -1]) {
        const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.9, 6, 14), lb)
        b.rotation.z = Math.PI / 2
        b.position.set(ax + 0.2, DECK + 2.7, s * (B / 2 + 0.35))
        b.castShadow = true
        g.add(b)
        addBox(0.12, 1.2, 0.6, mast, ax - 0.9, DECK + 2.9, s * (B / 2 + 0.1), g)
        addBox(0.12, 1.2, 0.6, mast, ax + 1.3, DECK + 2.9, s * (B / 2 + 0.1), g)
      }

      addBox(0.22, 4.2, 0.22, mast, 18.4, DECK + 1.2 + 2.1, 0, g)
      const win = makeMaterial(0x3b4450, 0.6, 0.5)
      addBox(1, 0.6, 1.2, win, 20.2, DECK + 1.2 + 0.3, 1.2, g)
      addBox(1, 0.6, 1.2, win, 20.2, DECK + 1.2 + 0.3, -1.2, g)
      addBox(1.2, 0.6, 1.4, win, -21.8, DECK + 0.3, 2, g)
      addBox(1.2, 0.6, 1.4, win, -21.8, DECK + 0.3, -2, g)
      return g
    }

    const ship = shipBody()
    scene.add(ship)
    const radar = ship.getObjectByName('radar')

    const nameTex = createCanvasTexture(
      1024,
      128,
      (g, w, h) => {
        g.fillStyle = '#fff'
        g.font = '800 96px Sora, Arial Black, sans-serif'
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.fillText('IMPORTNOW', w / 2, h / 2 + 6)
      },
      true,
      textures,
    )
    const nameMat = new THREE.MeshStandardMaterial({
      map: nameTex,
      transparent: true,
      roughness: 0.5,
      metalness: 0.2,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
    for (const s of [1, -1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(15, 1.9), nameMat)
      p.position.set(-2, 1.45, s * (B / 2 + 0.03))
      if (s < 0) p.rotation.y = Math.PI
      ship.add(p)
    }

    const slots = slotsFor(true)
    const plainSlots = slots.filter((s) => !s.brand)
    const brandSlots = slots.filter((s) => s.brand)
    const plainIM = new THREE.InstancedMesh(contGeo, contMat, plainSlots.length)
    const brandIM = new THREE.InstancedMesh(contGeo, brandMat, brandSlots.length)
    ;[plainIM, brandIM].forEach((m) => {
      m.castShadow = true
      m.receiveShadow = true
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      ship.add(m)
    })
    plainSlots.forEach((s, i) => {
      s.mesh = plainIM
      s.i = i
      plainIM.setColorAt(i, new THREE.Color(s.col))
    })
    brandSlots.forEach((s, i) => {
      s.mesh = brandIM
      s.i = i
      brandIM.setColorAt(i, new THREE.Color(0xffffff))
    })

    const dummy = new THREE.Object3D()
    function placeSlot(s, x, y, z, ry = 0, vis = true) {
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, ry, 0)
      dummy.scale.setScalar(vis ? 1 : 0)
      dummy.updateMatrix()
      s.mesh.setMatrixAt(s.i, dummy.matrix)
    }
    slots.forEach((s) => placeSlot(s, s.x, s.y, s.z))

    const animated = slots.filter((s) => s.top)
    const qA = animated.filter((s) => s.c <= 3)
    const qB = animated.filter((s) => s.c >= 4)
    qA.forEach((s, k) => {
      s.crane = 0
      s.k = k
    })
    qB.forEach((s, k) => {
      s.crane = 1
      s.k = k
    })

    const others = []
    function addStaticContainers(parent) {
      const ss = slotsFor(false)
      const im = new THREE.InstancedMesh(contGeo, contMat, ss.length)
      ss.forEach((s, i) => {
        dummy.position.set(s.x, s.y, s.z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        im.setMatrixAt(i, dummy.matrix)
        im.setColorAt(i, new THREE.Color(s.col))
      })
      parent.add(im)
    }
    ;[
      [160, -330, -1, 1.0],
      [300, 260, 1, 0.9],
      [-120, 420, 1, 1.1],
    ].forEach(([x, z, dir, sc]) => {
      const g = shipBody()
      addStaticContainers(g)
      g.position.set(x, 0, z)
      g.rotation.y = dir < 0 ? Math.PI : 0
      g.scale.setScalar(sc)
      g.traverse((o) => {
        o.castShadow = false
      })
      scene.add(g)
      others.push({ g, x, dir })
    })

    const createFoamMaterial = () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        uniforms: { uT: { value: 0 }, uA: { value: 0 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uT, uA;
          varying vec2 vUv;
          float hs(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float ns(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hs(i), hs(i + vec2(1, 0)), f.x), mix(hs(i + vec2(0, 1)), hs(i + vec2(1, 1)), f.x), f.y);
          }
          void main() {
            float x = vUv.x;
            float y = abs(vUv.y - 0.5) * 2.0;
            float w = mix(1.0, 0.3, x);
            float e = smoothstep(w, w - 0.35, y) * (0.45 + 0.55 * smoothstep(w - 0.3, w - 0.05, y));
            float n = ns(vec2(x * 60.0 - uT * 3.0, vUv.y * 16.0)) * 0.55 + ns(vec2(x * 140.0 - uT * 6.0, vUv.y * 40.0)) * 0.45;
            float a = e * smoothstep(0.0, 0.8, x) * smoothstep(1.0, 0.96, x) * smoothstep(0.35, 0.75, n) * uA;
            gl_FragColor = vec4(vec3(0.96, 0.98, 1.0), a * 0.85);
          }
        `,
      })
    const wake = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 18).rotateX(-Math.PI / 2),
      createFoamMaterial(),
    )
    wake.position.y = 0.06
    scene.add(wake)
    const sideFoam = [1, -1].map((s) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(34, 3.2).rotateX(-Math.PI / 2),
        createFoamMaterial(),
      )
      m.position.set(0, 0.07, s * (B / 2 + 0.9))
      if (s > 0) m.rotation.y = Math.PI
      ship.add(m)
      return m
    })

    const flags = []
    const flagCN = createCanvasTexture(
      150,
      100,
      (g) => {
        g.fillStyle = '#de2910'
        g.fillRect(0, 0, 150, 100)
        g.fillStyle = '#ffde00'
        const star = (cx, cy, r) => {
          g.beginPath()
          for (let i = 0; i < 10; i += 1) {
            const a = -Math.PI / 2 + (i * Math.PI) / 5
            const rr = i % 2 ? r * 0.4 : r
            g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
          }
          g.fill()
        }
        star(25, 25, 15)
        star(50, 10, 5)
        star(60, 20, 5)
        star(60, 35, 5)
        star(50, 45, 5)
      },
      true,
      textures,
    )
    const flagIN = createCanvasTexture(
      150,
      100,
      (g) => {
        g.fillStyle = '#ff9933'
        g.fillRect(0, 0, 150, 34)
        g.fillStyle = '#fff'
        g.fillRect(0, 33, 150, 34)
        g.fillStyle = '#138808'
        g.fillRect(0, 66, 150, 34)
        g.strokeStyle = '#000080'
        g.lineWidth = 3
        g.beginPath()
        g.arc(75, 50, 13, 0, Math.PI * 2)
        g.stroke()
        for (let i = 0; i < 24; i += 1) {
          const a = (i * Math.PI) / 12
          g.beginPath()
          g.moveTo(75, 50)
          g.lineTo(75 + Math.cos(a) * 13, 50 + Math.sin(a) * 13)
          g.lineWidth = 1
          g.stroke()
        }
      },
      true,
      textures,
    )

    function createCrane(parent, cx, color) {
      const c = new THREE.Group()
      c.position.x = cx
      parent.add(c)
      const st = makeMaterial(color, 0.5, 0.35)
      const wh = makeMaterial(0xf1f3f5, 0.5, 0.15)
      const dk = makeMaterial(0x2a2f36, 0.6, 0.5)
      const zs = -9.5
      const zl = -24
      const H = 27
      for (const lx of [-3.6, 3.6]) {
        for (const lz of [zs, zl]) {
          addBox(0.9, H, 0.9, st, lx, QUAY + H / 2, lz, c)
          addBox(1.6, 1.1, 2.4, dk, lx, QUAY + 0.55, lz, c)
        }
      }
      for (const lx of [-3.6, 3.6]) {
        addBox(0.8, 0.8, zs - zl, st, lx, QUAY + 12, (zs + zl) / 2, c)
        addStrut([lx, QUAY + 1.5, zs], [lx, QUAY + 12, zl], 0.22, st, c)
      }
      for (const lz of [zs, zl]) addBox(8.1, 0.9, 0.9, st, 0, QUAY + H - 0.4, lz, c)
      const gy = QUAY + H + 0.9
      for (const lx of [-2.2, 2.2]) addBox(0.8, 1.6, 58, st, lx, gy, -11, c)
      for (let z = -38; z <= 16; z += 5) addBox(5.2, 0.25, 0.25, st, 0, gy - 0.55, z, c)
      const ap = [0, gy + 13, -17]
      for (const lx of [-2.2, 2.2]) {
        addStrut([lx, gy, zs], [lx * 0.55, ap[1], ap[2]], 0.32, st, c)
        addStrut([lx, gy, zl], [lx * 0.55, ap[1], ap[2]], 0.32, st, c)
        addStrut([lx * 0.55, ap[1], ap[2]], [lx, gy + 0.7, 17], 0.08, dk, c)
        addStrut([lx * 0.55, ap[1], ap[2]], [lx, gy + 0.7, -39], 0.08, dk, c)
      }
      addBox(2.8, 0.9, 1.1, st, 0, ap[1], ap[2], c)
      addBox(6.6, 3.8, 8.5, wh, 0, gy + 2.7, -33, c)
      addBox(6.7, 0.5, 8.6, st, 0, gy + 4.7, -33, c)

      const trolley = new THREE.Group()
      trolley.position.set(0, gy - 1.2, 4)
      c.add(trolley)
      addBox(4.6, 1, 3.2, wh, 0, 0, 0, trolley)
      addBox(1.8, 1.8, 2, makeMaterial(0x2a3b55, 0.15, 0.6), 1.3, -1.4, 0, trolley)

      const spreader = addBox(3.3, 0.42, 1.75, makeMaterial(0xf2c230, 0.5, 0.3), 0, 14, 4, c)
      const cables = [
        [-1.3, -0.6],
        [1.3, -0.6],
        [-1.3, 0.6],
        [1.3, 0.6],
      ].map(([ox, oz]) => ({ m: addBox(0.05, 1, 0.05, dk, 0, 0, 0, c, false), ox, oz }))
      const cr = { g: c, trolley, spreader, cables, gy, cx }
      setCranePose(cr, 4, 14)
      return cr
    }

    function createPort(x0, craneColor, flagTex, roof, skylineCol) {
      const g = new THREE.Group()
      g.position.x = x0
      scene.add(g)
      addBox(300, 4, 53, makeMaterial(0xa8a49b, 0.92, 0), 0, 0.5, -33.5, g)
      addBox(300, 4, 260, makeMaterial(0xb4afa4, 0.95, 0), 0, 0.45, -190, g)
      addBox(300, 0.3, 0.7, makeMaterial(0xe2c046, 0.6, 0), 0, QUAY + 0.15, -7.35, g, false)

      const fender = makeMaterial(0x16181b, 0.8, 0.1)
      for (let x = -140; x <= 140; x += 9) {
        const f = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.6, 14), fender)
        f.position.set(x, 1.1, -6.8)
        g.add(f)
      }
      const bol = makeMaterial(0x2c3036, 0.6, 0.5)
      for (let x = -136; x <= 136; x += 12) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.6, 10), bol)
        b.position.set(x, QUAY + 0.3, -8.1)
        g.add(b)
      }
      for (const z of [-9.5, -24]) {
        addBox(300, 0.12, 0.35, makeMaterial(0x3a3f46, 0.5, 0.7), 0, QUAY + 0.06, z, g, false)
      }
      const cranes = [createCrane(g, -6, craneColor), createCrane(g, 4, craneColor)]

      const yard = []
      for (let lane = 0; lane < 4; lane += 1) {
        for (let col = 0; col < 56; col += 1) {
          if (col % 11 === 10) continue
          const x = -92 + col * 3.35
          const h = 1 + Math.floor(Math.abs(hash(col * 13 + lane * 71 + x0)) * 4)
          for (let l = 0; l < h; l += 1) {
            yard.push([
              x,
              QUAY + CH / 2 + l * (CH + 0.02),
              -31 - lane * 4.4,
              PALETTE[(col * 3 + lane * 5 + l * 7) % PALETTE.length],
            ])
          }
        }
      }
      const ym = new THREE.InstancedMesh(contGeo, contMat, yard.length)
      yard.forEach(([x, y, z, c], i) => {
        dummy.position.set(x, y, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        ym.setMatrixAt(i, dummy.matrix)
        ym.setColorAt(i, new THREE.Color(c))
      })
      ym.castShadow = true
      ym.receiveShadow = true
      g.add(ym)

      const yard2 = new THREE.InstancedMesh(contGeo, contMat, yard.length)
      yard.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z - 1.62)
        dummy.updateMatrix()
        yard2.setMatrixAt(i, dummy.matrix)
        yard2.setColorAt(i, new THREE.Color(PALETTE[(i * 7) % PALETTE.length]))
      })
      yard2.castShadow = true
      g.add(yard2)

      const wall = makeMaterial(0xd9dde2, 0.8, 0.05)
      const rf = makeMaterial(roof, 0.6, 0.3)
      for (const [x, w] of [
        [-70, 44],
        [-12, 36],
        [46, 50],
      ]) {
        addBox(w, 11, 26, wall, x, QUAY + 5.5, -74, g)
        const r = new THREE.Mesh(
          new THREE.CylinderGeometry(13.6, 13.6, w + 0.4, 24, 1, false, 0, Math.PI),
          rf,
        )
        r.rotation.z = Math.PI / 2
        r.scale.set(1, 1, 0.32)
        r.position.set(x, QUAY + 11, -74)
        r.castShadow = true
        g.add(r)
      }
      addBox(14, 16, 12, makeMaterial(0x9fb7cf, 0.15, 0.6), 104, QUAY + 8, -40, g)
      addBox(14.4, 0.6, 12.4, white, 104, QUAY + 16.3, -40, g)

      const pole = makeMaterial(0x8c939c, 0.5, 0.6)
      for (const x of [-100, -50, 0, 50, 100]) {
        addBox(0.5, 24, 0.5, pole, x, QUAY + 12, -28, g)
        addBox(2.4, 0.8, 1, white, x, QUAY + 24, -28, g)
      }

      addBox(0.22, 16, 0.22, makeMaterial(0xdddddd, 0.4, 0.6), -40, QUAY + 8, -9, g)
      const fl = new THREE.Mesh(
        new THREE.PlaneGeometry(5.6, 3.7, 14, 4),
        new THREE.MeshStandardMaterial({
          map: flagTex,
          side: THREE.DoubleSide,
          roughness: 0.8,
        }),
      )
      fl.position.set(-37.2, QUAY + 14.1, -9)
      g.add(fl)
      flags.push(fl)

      const towerTex = createCanvasTexture(
        64,
        256,
        (g2, w, h) => {
          g2.fillStyle = '#fff'
          g2.fillRect(0, 0, w, h)
          g2.fillStyle = 'rgba(40,60,90,.35)'
          for (let y = 6; y < h; y += 10) g2.fillRect(0, y, w, 5)
        },
        true,
        textures,
      )
      const far = new THREE.Group()
      g.add(far)
      const sk = new THREE.MeshStandardMaterial({
        color: skylineCol,
        map: towerTex,
        roughness: 0.35,
        metalness: 0.4,
      })
      for (let i = 0; i < 46; i += 1) {
        const w = 10 + Math.abs(hash(i * 3.1 + x0)) * 20
        const h = 18 + Math.pow(Math.abs(hash(i * 7.7 + x0)), 1.8) * 75
        addBox(
          w,
          h,
          w * 0.8,
          sk,
          -420 + i * 18 + hash(i) * 10,
          h / 2,
          -950 - Math.abs(hash(i * 1.3)) * 150,
          far,
          false,
        )
      }
      const hill = makeMaterial(0x83937e, 1, 0, { flatShading: true })
      for (let i = 0; i < 10; i += 1) {
        const r = 90 + Math.abs(hash(i * 9 + x0)) * 110
        const m = new THREE.Mesh(new THREE.ConeGeometry(r, r * 0.42, 9), hill)
        m.position.set(-420 + i * 95, 0, -980 - Math.abs(hash(i)) * 160)
        far.add(m)
      }
      return { g, x0, cranes, far }
    }

    const CN = createPort(0, 0xc8372d, flagCN, 0xb5463a, 0x8c9aab)
    const IN = createPort(SAIL, 0x2b2b2e, flagIN, 0x2b2b2e, 0x9aa3ad)

    let camDist = 1.15
    const vA = new THREE.Vector3()
    const vB = new THREE.Vector3()
    function camAt(p, sx) {
      let i = 0
      while (i < KF.length - 2 && p > KF[i + 1].p) i += 1
      const a = KF[i]
      const b = KF[i + 1]
      const t = smooth(clamp((p - a.p) / (b.p - a.p), 0, 1))
      vA.set(
        lerp(a.o[0], b.o[0], t),
        lerp(a.o[1], b.o[1], t),
        lerp(a.o[2], b.o[2], t),
      ).multiplyScalar(camDist)
      vB.set(
        lerp(a.l[0], b.l[0], t),
        lerp(a.l[1], b.l[1], t),
        lerp(a.l[2], b.l[2], t),
      )
      camera.position.set(sx + vA.x, Math.max(3, vA.y), vA.z)
      camera.lookAt(sx + vB.x, vB.y, vB.z)
    }

    let prog = clamp(progressRef.current || 0, 0, 1)
    let lastX = 0
    let lastDay = -1
    let visible = false
    let animationFrame = 0
    let lastFrameTime = 0
    const clock = new THREE.Clock()

    function resize() {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.fov = w < 820 ? 58 : 42
      if (w > 820) {
        camera.setViewOffset(w, h, -w * 0.17, 0, w, h)
      } else {
        camera.clearViewOffset()
      }
      camDist = w < 820 ? 1.3 : 1.15
      camera.updateProjectionMatrix()
    }

    function onContextLost(event) {
      event.preventDefault()
      host.dataset.renderer = 'svg-fallback'
      delete canvas.dataset.engine
    }

    function frame(timestamp = performance.now()) {
      animationFrame = window.requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      if (!reducedMotion && lastFrameTime && timestamp - lastFrameTime < 30) return
      lastFrameTime = timestamp
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      const target = clamp(progressRef.current || 0, 0, 1)
      prog += (target - prog) * (reducedMotion ? 1 : Math.min(1, dt * 4))
      const p = prog

      const shipFrac = getShipProgress(p)
      const sx = shipFrac * SAIL
      const speed = Math.abs(sx - lastX) / Math.max(dt, 0.001)
      lastX = sx
      const sail = Math.sin(
        Math.PI * clamp((p - DOCK_OUT) / (DOCK_IN - DOCK_OUT), 0, 1),
      )
      const amp = 0.1 + 0.9 * sail
      ship.position.set(sx, reducedMotion ? -0.04 : Math.sin(t * 0.8) * 0.14 * amp - 0.04, 0)
      ship.rotation.set(
        reducedMotion ? 0 : Math.sin(t * 0.6) * 0.014 * amp,
        0,
        reducedMotion ? 0 : Math.sin(t * 0.45 + 1) * 0.007 * amp,
      )
      if (radar && !reducedMotion) radar.rotation.y = t * 1.6

      const active = [null, null]
      for (const s of animated) {
        let x = s.x
        let y = s.y
        let z = s.z
        const lt = clamp((p - (LOAD0 + s.k * LOAD_STEP)) / (LOAD_STEP * 0.92), 0, 1)
        const ut = clamp(
          (p - (UNL0 + (11 - s.k) * UNL_STEP)) / (UNL_STEP * 0.92),
          0,
          1,
        )
        if (p < DOCK_OUT) {
          const quay = [s.x, QUAY + CH / 2, -12.4 - s.r * 1.7]
          const slot = [s.x, s.y + ship.position.y, s.z]
          const w = lt <= 0 ? quay : lt >= 1 ? slot : pathPoint(lt, quay, slot)
          x = w[0] - sx
          y = w[1] - ship.position.y
          z = w[2]
          if (lt > 0 && lt < 1) active[s.crane] = { w, port: CN }
        } else if (p > DOCK_IN) {
          const slot = [SAIL + s.x, s.y + ship.position.y, s.z]
          const quay = [SAIL + s.x, QUAY + CH / 2, -12.4 - s.r * 1.7]
          const w = ut <= 0 ? slot : ut >= 1 ? quay : pathPoint(ut, slot, quay)
          x = w[0] - sx
          y = w[1] - ship.position.y
          z = w[2]
          if (ut > 0 && ut < 1) active[s.crane] = { w, port: IN }
        }
        placeSlot(s, x, y, z, 0, true)
      }
      plainIM.instanceMatrix.needsUpdate = true
      brandIM.instanceMatrix.needsUpdate = true

      for (const P of [CN, IN]) {
        P.cranes.forEach((cr, ci) => {
          const a = active[ci]
          if (a && a.port === P) {
            cr.g.position.x = a.w[0] - P.x0
            setCranePose(cr, a.w[2], a.w[1] + CH / 2 + 0.21)
          }
        })
      }

      water.material.uniforms.time.value = reducedMotion ? 0 : t * 0.55
      const wa = clamp(speed / 24, 0, 1)
      wake.position.set(sx - L / 2 - 55, 0.06, 0)
      wake.material.uniforms.uT.value = t
      wake.material.uniforms.uA.value += (wa - wake.material.uniforms.uA.value) * 0.08
      sideFoam.forEach((f) => {
        f.material.uniforms.uT.value = t
        f.material.uniforms.uA.value = wake.material.uniforms.uA.value * 0.8
      })
      if (!reducedMotion) {
        for (const o of others) o.g.position.x = o.x + o.dir * ((t * 2.2) % 400)
        for (const f of flags) {
          const pa = f.geometry.attributes.position
          for (let i = 0; i < pa.count; i += 1) {
            const x = pa.getX(i)
            pa.setZ(i, (Math.sin(x * 1.3 - t * 5) * 0.28 * (x + 2.8)) / 5.6)
          }
          pa.needsUpdate = true
        }
      }

      CN.far.visible = sx < 120
      IN.far.visible = sx > SAIL - 120
      sunL.target.position.set(sx, 0, -8)
      sunL.position.copy(sunL.target.position).addScaledVector(sun, 220)

      camAt(p, sx)
      renderer.render(scene, camera)

      const day = getVoyageDay(p)
      if (day !== lastDay) {
        lastDay = day
        onSyncUI?.(Math.round(shipFrac * 100), day)
      } else {
        onSyncUI?.(shipFrac * 100, null)
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { rootMargin: '300px' },
    )
    resizeObserver.observe(host)
    visibilityObserver.observe(host)
    canvas.addEventListener('webglcontextlost', onContextLost)
    window.addEventListener('resize', resize)
    resize()
    animationFrame = window.requestAnimationFrame(frame)

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('resize', resize)
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material?.dispose()
        }
      })
      textures.forEach((t) => t.dispose())
      envRT.dispose()
      pmrem.dispose()
      renderer.dispose()
      delete host.dataset.renderer
      delete canvas.dataset.engine
    }
  }, [hostRef, onReady, onSyncUI, progressRef])

  return (
    <canvas
      className="voyage-visual__canvas"
      id="sea"
      ref={canvasRef}
      aria-hidden="true"
    />
  )
}

export default VoyageScene
