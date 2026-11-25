import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FlagIcon } from '../ui/BrandIcons.jsx'

const cities = [
  { id: 'shanghai', name: 'Shanghai', lat: 31.23, lon: 121.47, country: 'cn', side: 'right' },
  { id: 'yiwu', name: 'Yiwu', lat: 29.31, lon: 120.08, country: 'cn', side: 'left' },
  { id: 'guangzhou', name: 'Guangzhou', lat: 23.13, lon: 113.26, country: 'cn', side: 'right' },
  { id: 'shenzhen', lat: 22.54, lon: 114.06, country: 'cn', showLabel: false },
  { id: 'mumbai', name: 'Nhava Sheva', lat: 18.95, lon: 72.95, country: 'in', side: 'left' },
  { id: 'chennai', name: 'Chennai', lat: 13.08, lon: 80.27, country: 'in', side: 'right' },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.39, lon: 78.49, country: 'in', side: 'right' },
  { id: 'vizag', lat: 17.69, lon: 83.22, country: 'in', showLabel: false },
]

const routePairs = [
  ['shanghai', 'chennai', 0xe3241b, 0],
  ['yiwu', 'mumbai', 0xff3b30, 0.33],
  ['guangzhou', 'vizag', 0xffffff, 0.66],
  ['shenzhen', 'hyderabad', 0xffffff, 0.15],
  ['shanghai', 'hyderabad', 0xe3241b, 0.5],
  ['guangzhou', 'chennai', 0xff3b30, 0.82],
]

const labelPriority = ['hyderabad', 'shanghai', 'guangzhou', 'mumbai', 'chennai', 'yiwu']

function toSpherePoint(latitude, longitude, radius) {
  const phi = ((90 - latitude) * Math.PI) / 180
  const theta = ((longitude + 180) * Math.PI) / 180

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function createGlowTexture() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(255,255,255,1)')
  gr.addColorStop(0.22, 'rgba(255,190,120,.95)')
  gr.addColorStop(0.5, 'rgba(255,110,60,.35)')
  gr.addColorStop(1, 'rgba(255,90,40,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function EarthGlobe() {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const labelsRef = useRef({})

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return undefined

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const radius = 2
    const textureLoader = new THREE.TextureLoader()
    const loadedTextures = []
    let disposed = false
    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      })
    } catch {
      host.dataset.renderer = 'svg-fallback'
      delete canvas.dataset.engine
      return undefined
    }

    host.dataset.renderer = 'three'
    if (!canvas.dataset.engine) {
      canvas.dataset.engine = `three.js r${THREE.REVISION}`
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200)
    camera.position.set(0, 0, 9)

    const outer = new THREE.Group()
    const globe = new THREE.Group()
    scene.add(outer)
    outer.add(globe)

    // Sun from upper-left-front: China/India in daylight, night falls on right limb
    const sun = new THREE.Vector3(-0.62, 0.32, 0.72).normalize()
    const ambientLight = new THREE.AmbientLight(0x9fb4d8, 0.12)
    const sunlight = new THREE.DirectionalLight(0xffffff, 2.6)
    sunlight.position.copy(sun).multiplyScalar(10)
    scene.add(ambientLight, sunlight)

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0x5a76a0),
      shininess: 28,
      emissive: new THREE.Color(0xffc27a),
      emissiveIntensity: 1.6,
    })
    // Mask city lights strictly to the night hemisphere
    earthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uSun = { value: sun }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWN;')
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvWN=normalize(mat3(modelMatrix)*normal);',
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vWN;\nuniform vec3 uSun;',
        )
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance*=smoothstep(.05,-.28,dot(normalize(vWN),uSun));',
        )
    }

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 128, 128),
      earthMaterial,
    )
    globe.add(earth)

    const cloudMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      shininess: 4,
    })
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.012, 96, 96),
      cloudMaterial,
    )
    globe.add(clouds)

    // Thin Fresnel rim on planet edge + soft outer halo
    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.02, 96, 96),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uSun: { value: sun } },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          varying vec3 vWN;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vWN = normalize(mat3(modelMatrix) * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uSun;
          varying vec3 vN;
          varying vec3 vV;
          varying vec3 vWN;
          void main() {
            float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.2);
            float day = smoothstep(-0.35, 0.4, dot(vWN, uSun));
            gl_FragColor = vec4(mix(vec3(0.25, 0.45, 0.9), vec3(0.45, 0.72, 1.0), day), f * (0.35 + 0.65 * day));
          }
        `,
      }),
    )
    outer.add(rim)

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.11, 96, 96),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        vertexShader: `
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vN;
          void main() {
            float i = pow(max(0.58 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 2.4);
            gl_FragColor = vec4(0.42, 0.66, 1.0, i * 1.05);
          }
        `,
      }),
    )
    outer.add(halo)

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
    let textureCount = 0
    const earthTextureMaps = [
      ['/assets/earth_atmos_2048.jpg', true, (texture) => {
        earthMaterial.map = texture
        earthMaterial.needsUpdate = true
      }],
      ['/assets/earth_clouds_1024.png', true, (texture) => {
        cloudMaterial.map = texture
        cloudMaterial.needsUpdate = true
      }],
      ['/assets/earth_normal_2048.jpg', false, (texture) => {
        earthMaterial.normalMap = texture
        earthMaterial.normalScale.set(0.85, -0.85)
        earthMaterial.needsUpdate = true
      }],
      ['/assets/earth_specular_2048.jpg', false, (texture) => {
        earthMaterial.specularMap = texture
        earthMaterial.needsUpdate = true
      }],
      ['/assets/earth_lights_2048.png', true, (texture) => {
        earthMaterial.emissiveMap = texture
        earthMaterial.needsUpdate = true
      }],
    ]

    function finishTextureLoad() {
      if (disposed) return
      textureCount += 1
      if (textureCount === earthTextureMaps.length) {
        host.classList.add('earth-globe--ready')
      }
    }

    earthTextureMaps.forEach(([url, isColorMap, applyTexture]) => {
      textureLoader.load(
        url,
        (texture) => {
          if (disposed) {
            texture.dispose()
            return
          }
          loadedTextures.push(texture)
          texture.colorSpace = isColorMap
            ? THREE.SRGBColorSpace
            : THREE.NoColorSpace
          texture.anisotropy = maxAnisotropy
          applyTexture(texture)
          finishTextureLoad()
        },
        undefined,
        finishTextureLoad,
      )
    })

    const glowTex = createGlowTexture()
    loadedTextures.push(glowTex)

    const markers = []
    const cityPoints = new Map()
    const cityById = new Map(cities.map((c) => [c.id, c]))

    cities.forEach((city, idx) => {
      const position = toSpherePoint(city.lat, city.lon, radius * 1.004)
      cityPoints.set(city.id, position)

      const markerColor = city.country === 'cn' ? 0xe3241b : 0xffffff
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 16, 16),
        new THREE.MeshBasicMaterial({ color: markerColor }),
      )
      dot.position.copy(position)
      globe.add(dot)

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.028, 0.04, 40),
        ringMaterial,
      )
      ring.position.copy(position)
      ring.lookAt(position.clone().multiplyScalar(2))
      globe.add(ring)
      markers.push({ ring, ringMaterial, phase: (idx * 0.17) % 1 })
    })

    const movingRoutes = []
    routePairs.forEach(([from, to, color, offset]) => {
      const origin = cityPoints.get(from)
      const destination = cityPoints.get(to)
      if (!origin || !destination) return

      const distance = origin.distanceTo(destination)
      const curve = new THREE.QuadraticBezierCurve3(
        origin,
        origin
          .clone()
          .add(destination)
          .normalize()
          .multiplyScalar(radius + distance * 0.5),
        destination,
      )

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uT: { value: 0 },
          uC: { value: new THREE.Color(color) },
          uO: { value: offset },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uT;
          uniform vec3 uC;
          uniform float uO;
          varying vec2 vUv;
          void main() {
            float h = fract(uT * 0.15 + uO);
            float d = h - vUv.x;
            float tr = (d > 0.0 && d < 0.4) ? pow(1.0 - d / 0.4, 1.6) : 0.0;
            float a = 0.35 + tr * 0.65;
            a *= smoothstep(0.0, 0.03, vUv.x) * smoothstep(1.0, 0.97, vUv.x);
            gl_FragColor = vec4(mix(uC, vec3(1.0, 0.95, 0.85), tr * tr * 0.6), a);
          }
        `,
      })

      globe.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.0065, 8, false), mat))

      const head = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      )
      head.scale.setScalar(0.15)
      globe.add(head)
      movingRoutes.push({ curve, mat, head, offset })
    })

    // Face China-India toward camera
    const focus = toSpherePoint(22, 96, 1)
    const baseY = -Math.atan2(focus.x, focus.z)
    const baseX = Math.asin(focus.y)
    outer.rotation.x = baseX
    globe.rotation.y = baseY

    let scale = 1
    let yawOff = 0
    const labelElements = labelsRef.current
    const pointer = { x: 0, y: 0 }
    const tmp = new THREE.Vector3()
    const camDir = new THREE.Vector3()
    const center = new THREE.Vector3()
    const normal = new THREE.Vector3()
    const placedLabels = []
    const clockStartedAt = performance.now()
    let intro = reducedMotion ? 1 : 0
    let animationFrame = 0
    let isVisible = true
    let lastFrameTime = 0

    function positionLabels(width, height, ei) {
      outer.getWorldPosition(center)
      placedLabels.length = 0

      labelPriority.forEach((id) => {
        const city = cityById.get(id)
        const element = labelElements[id]
        const point = cityPoints.get(id)
        if (!city || !element || !point) return

        tmp.copy(point)
        globe.localToWorld(tmp)
        camDir.copy(camera.position).sub(tmp).normalize()
        normal.copy(tmp).sub(center).normalize()
        const facing = normal.dot(camDir)
        tmp.project(camera)

        const x = (tmp.x * 0.5 + 0.5) * width
        const y = (-tmp.y * 0.5 + 0.5) * height
        const lw = element.offsetWidth
        const lh = element.offsetHeight
        const lx = Math.max(
          6,
          Math.min(width - lw - 6, city.side === 'left' ? x - 10 - lw : x + 10),
        )
        let ly = y - lh / 2
        let ok = false

        if (facing > 0.15 && ei > 0.9) {
          for (const dy of [0, -(lh + 3), lh + 3, -(lh + 3) * 2]) {
            const rect = [lx - 2, ly + dy - 2, lx + lw + 2, ly + dy + lh + 2]
            const overlaps = placedLabels.some(
              (p) =>
                rect[0] < p[2] &&
                rect[2] > p[0] &&
                rect[1] < p[3] &&
                rect[3] > p[1],
            )
            if (rect[1] > 4 && rect[3] < height - 4 && !overlaps) {
              ly += dy
              placedLabels.push(rect)
              ok = true
              break
            }
          }
        }

        element.style.transform = `translate(${lx}px, ${ly}px)`
        element.style.opacity = ok ? '1' : '0'
      })
    }

    function resize() {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      const asp = w / h
      renderer.setSize(w, h, false)
      camera.aspect = asp
      camera.updateProjectionMatrix()

      if (w > 820) {
        const hh = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        const hw = hh * asp
        const txt = document.querySelector('.hero-section__content')
        const hr = host.getBoundingClientRect()
        const tr = txt ? Math.min(txt.getBoundingClientRect().right - hr.left, w * 0.62) : w * 0.5
        const trw = (tr / w - 0.5) * 2 * hw
        const avail = hw - trw
        const r = Math.min(hh * 0.8, Math.max(avail * 0.78, hh * 0.5))
        outer.position.set(trw + 0.18 + r * 1.12, -0.15, 0)
        scale = r / radius
        const bleed = outer.position.x + r - hw
        yawOff = bleed > 0 ? -Math.asin(Math.min(1, bleed / r)) * 0.75 : 0
      } else {
        yawOff = 0
        const hh = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        const k = (2 * hh) / h
        const vh = Math.min(window.innerHeight, h)
        const rPx = Math.min(vh * 0.2, w * 0.42)
        const cyPx = Math.max(vh * 0.27, rPx + 84)
        outer.position.set(0, hh - cyPx * k, 0)
        scale = (rPx * k) / radius
      }

      if (reducedMotion) {
        outer.scale.setScalar(scale)
        globe.rotation.y = baseY + yawOff
        outer.rotation.x = baseX
        renderer.render(scene, camera)
        positionLabels(w, h, 1)
      }
    }

    function onPointerMove(event) {
      pointer.x = event.clientX / window.innerWidth - 0.5
      pointer.y = event.clientY / window.innerHeight - 0.5
    }

    function onContextLost(event) {
      event.preventDefault()
      host.classList.remove('earth-globe--ready')
      host.dataset.renderer = 'svg-fallback'
      delete canvas.dataset.engine
    }

    function animate(timestamp = performance.now()) {
      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(animate)
      }
      if (!isVisible || document.hidden) return
      if (!reducedMotion && lastFrameTime && timestamp - lastFrameTime < 30) return
      lastFrameTime = timestamp

      const t = reducedMotion ? 3 : (performance.now() - clockStartedAt) / 1000
      intro = reducedMotion ? 1 : Math.min(1, t / 1.4)
      const ei = easeInOutCubic(intro)
      const sway = reducedMotion ? 0 : Math.sin(t * 0.22) * 0.16

      if (reducedMotion) {
        globe.rotation.y = baseY + yawOff
        outer.rotation.x = baseX
      } else {
        globe.rotation.y +=
          (baseY + yawOff + sway + pointer.x * 0.3 - (1 - ei) * 1.3 - globe.rotation.y) *
          0.05
        outer.rotation.x += (baseX + pointer.y * 0.12 - outer.rotation.x) * 0.05
      }
      outer.scale.setScalar(scale * (0.82 + 0.18 * ei))
      clouds.rotation.y = reducedMotion ? 0.03 : t * 0.012

      movingRoutes.forEach(({ curve, mat, head, offset }) => {
        mat.uniforms.uT.value = t
        const h = (t * 0.15 + offset) % 1
        head.position.copy(curve.getPoint(h))
        head.material.opacity = Math.sin(h * Math.PI)
      })

      markers.forEach(({ ring, ringMaterial, phase }) => {
        const k = (t * 0.6 + phase) % 1
        ring.scale.setScalar(1 + k * 2.2)
        ringMaterial.opacity = (1 - k) * 0.9
      })

      renderer.render(scene, camera)
      positionLabels(host.clientWidth, host.clientHeight, ei)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    visibilityObserver.observe(host)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', resize)
    canvas.addEventListener('webglcontextlost', onContextLost)
    resize()
    animate()

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material?.dispose()
        }
      })
      loadedTextures.forEach((texture) => texture.dispose())
      renderer.dispose()
      host.classList.remove('earth-globe--ready')
      delete host.dataset.renderer
      delete canvas.dataset.engine
    }
  }, [])

  return (
    <div
      className="route-illustration earth-globe"
      aria-label="Animated China-to-India trade routes"
      ref={hostRef}
    >
      <canvas
        className="earth-globe__canvas"
        id="globe"
        ref={canvasRef}
        aria-hidden="true"
      />
      <svg
        className="route-illustration__svg"
        viewBox="0 0 720 720"
        role="img"
        aria-labelledby="earth-title earth-description"
      >
        <title id="earth-title">China-to-India trade routes</title>
        <desc id="earth-description">
          A rotating illustrated Earth with routes linking sourcing hubs in
          China to destinations in India.
        </desc>
        <defs>
          <radialGradient id="earth-ocean" cx="34%" cy="28%" r="74%">
            <stop offset="0" stopColor="#79b5df" />
            <stop offset=".34" stopColor="#276b9a" />
            <stop offset=".72" stopColor="#102d4b" />
            <stop offset="1" stopColor="#071321" />
          </radialGradient>
          <linearGradient id="earth-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c8d6bd" />
            <stop offset=".45" stopColor="#728a70" />
            <stop offset="1" stopColor="#344c45" />
          </linearGradient>
          <clipPath id="earth-clip">
            <circle cx="360" cy="360" r="258" />
          </clipPath>
        </defs>
        <circle cx="360" cy="360" r="270" fill="#80b7e5" opacity=".16" />
        <circle cx="360" cy="360" r="262" fill="url(#earth-ocean)" />
        <g clipPath="url(#earth-clip)" className="earth-map-rotation">
          <g fill="url(#earth-land)" stroke="#d5e0cb" strokeOpacity=".38" strokeWidth="2">
            <path d="m178 194 28-25 43-9 24 12 13 27 35 5 17 20-9 20-29 5-13 22-27 4-10 34-23 13-5 34-21 7-11-24-25-10-13-25-24-15-6-32 19-16-5-25z" />
            <path d="m322 190 24-19 31 6 13 19 24-4 18 17 24-1 19 17 24 4 21 20-12 22-22 8-5 20-22 6-15-16-14 3-10-20-19 6-12-17-25 2-17-16-28 4-15-18-28-2-9-18z" />
            <path d="m415 276 28 8 21 23-5 31-16 20-8 32-19 29-20-12-8-28-17-18 2-28 18-21 5-23z" />
            <path d="m300 264 21 3 19 18-8 22-17 8-4 22-18 7-15-16 3-25-9-18 9-16z" />
            <path d="m470 382 33 4 26 19-8 28-29 15-33-10-12-24z" />
            <path d="m123 349 18-8 21 12 4 26-18 17-22-9-10-21z" />
          </g>
          <g fill="none" stroke="#d4e9f8" strokeOpacity=".2" strokeWidth="1.2">
            <ellipse cx="360" cy="360" rx="98" ry="258" />
            <ellipse cx="360" cy="360" rx="184" ry="258" />
            <path d="M102 360h516M118 290h484M143 225h434M143 495h434M118 430h484" />
          </g>
          <path
            d="M466 260Q440 306 414 335M488 278Q457 315 420 345"
            fill="none"
            stroke="#ef382d"
            strokeWidth="3"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="globe-labels" id="glabels" aria-hidden="true">
        {cities.filter((city) => city.showLabel !== false).map((city) => (
          <div
            className={`earth-location earth-location--${city.id}`}
            data-city={city.id}
            key={city.id}
            ref={(element) => {
              if (element) labelsRef.current[city.id] = element
            }}
          >
            <FlagIcon country={city.country} />
            {city.name}
          </div>
        ))}
      </div>
      <span className="earth-globe__fallback" role="status">
        WebGL is unavailable; showing the illustrated Earth.
      </span>
    </div>
  )
}

export default EarthGlobe
