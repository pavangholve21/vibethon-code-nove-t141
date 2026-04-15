import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'

function seededRandom(seed) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export function NeuralBackground({ mode = 'network' }) {
  const canvasRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  const config = useMemo(() => {
    const isBrain = mode === 'brain'
    return {
      count: isBrain ? 650 : 950,
      maxLinks: isBrain ? 1100 : 1400,
      linkDist: isBrain ? 0.24 : 0.19,
      opacity: isBrain ? 0.28 : 0.35,
      drift: isBrain ? 0.0005 : 0.0007,
    }
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // WebGL can fail on some GPUs / drivers or when the context is lost.
    // This background must never crash the app.
    let renderer = null
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    } catch {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 10)
    camera.position.z = 2.2

    const css = getComputedStyle(document.documentElement)
    const cCyan = (css.getPropertyValue('--np-accent2') || '#06B6D4').trim()
    const cViolet = (css.getPropertyValue('--np-accent1') || '#7C3AED').trim()

    const rnd = seededRandom(141) // stable layout
    const positions = new Float32Array(config.count * 3)
    const velocities = new Float32Array(config.count * 3)

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3
      // points in a squashed sphere
      const r = Math.pow(rnd(), 0.6) * 1.05
      const theta = rnd() * Math.PI * 2
      const phi = Math.acos(2 * rnd() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.cos(phi) * 0.8
      const z = r * Math.sin(phi) * Math.sin(theta) * 0.9
      positions[i3 + 0] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      velocities[i3 + 0] = (rnd() - 0.5) * config.drift
      velocities[i3 + 1] = (rnd() - 0.5) * config.drift
      velocities[i3 + 2] = (rnd() - 0.5) * config.drift
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const ptsMat = new THREE.PointsMaterial({
      color: new THREE.Color(cCyan),
      size: 0.012,
      sizeAttenuation: true,
      transparent: true,
      opacity: config.opacity,
      depthWrite: false,
    })
    const points = new THREE.Points(geom, ptsMat)
    scene.add(points)

    // lines (updated each frame with a cap)
    const linePositions = new Float32Array(config.maxLinks * 2 * 3)
    const lineGeom = new THREE.BufferGeometry()
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeom.setDrawRange(0, 0)
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(cViolet),
      transparent: true,
      opacity: config.opacity * 0.55,
      depthWrite: false,
    })
    const lines = new THREE.LineSegments(lineGeom, lineMat)
    scene.add(lines)

    let raf = 0
    let w = 0
    let h = 0
    let stopped = false
    const tmpA = new THREE.Vector3()
    const tmpB = new THREE.Vector3()

    function onContextLost(e) {
      // Prevent default so the browser doesn't spam warnings.
      e.preventDefault?.()
      stopped = true
      cancelAnimationFrame(raf)
      // Fade the canvas out to avoid “frozen” artifacts.
      canvas.style.opacity = '0'
    }
    canvas.addEventListener('webglcontextlost', onContextLost, { passive: false })

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      renderer?.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    resize()

    function updateLinks() {
      let linkCount = 0
      // lightweight O(n*k) sampling rather than O(n^2)
      const step = mode === 'brain' ? 4 : 3
      for (let i = 0; i < config.count; i += step) {
        const i3 = i * 3
        tmpA.set(positions[i3], positions[i3 + 1], positions[i3 + 2])
        // sample a few neighbors deterministically
        for (let j = i + 1; j < Math.min(config.count, i + 24); j += step) {
          const j3 = j * 3
          tmpB.set(positions[j3], positions[j3 + 1], positions[j3 + 2])
          const d = tmpA.distanceTo(tmpB)
          if (d < config.linkDist) {
            const base = linkCount * 6
            linePositions[base + 0] = tmpA.x
            linePositions[base + 1] = tmpA.y
            linePositions[base + 2] = tmpA.z
            linePositions[base + 3] = tmpB.x
            linePositions[base + 4] = tmpB.y
            linePositions[base + 5] = tmpB.z
            linkCount++
            if (linkCount >= config.maxLinks) break
          }
        }
        if (linkCount >= config.maxLinks) break
      }
      lineGeom.setDrawRange(0, linkCount * 2)
      lineGeom.attributes.position.needsUpdate = true
    }

    function tick() {
      raf = requestAnimationFrame(tick)
      if (stopped) return
      if (reducedMotion) {
        renderer?.render(scene, camera)
        return
      }

      for (let i = 0; i < config.count; i++) {
        const i3 = i * 3
        positions[i3 + 0] += velocities[i3 + 0]
        positions[i3 + 1] += velocities[i3 + 1]
        positions[i3 + 2] += velocities[i3 + 2]

        // gentle wrap
        for (let k = 0; k < 3; k++) {
          const v = positions[i3 + k]
          if (v > 1.2) positions[i3 + k] = -1.2
          if (v < -1.2) positions[i3 + k] = 1.2
        }
      }
      geom.attributes.position.needsUpdate = true

      updateLinks()
      points.rotation.y += 0.00035
      points.rotation.x += 0.00012
      lines.rotation.copy(points.rotation)

      renderer?.render(scene, camera)
    }

    updateLinks()
    tick()

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      ro.disconnect()
      geom.dispose()
      lineGeom.dispose()
      ptsMat.dispose()
      lineMat.dispose()
      renderer?.dispose?.()
    }
  }, [config, mode, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.85]"
    />
  )
}

