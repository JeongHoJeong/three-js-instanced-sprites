import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import React, { useRef } from 'react'
import Img from './heart.png'

const NUM_ITEMS = 10

function getEmptyArray(size) {
  return new Array(size).fill()
}

/**
 * TODOs
 * - [x] 매 프레임마다 위치 바뀌게 하기
 * - [x] 각 plane에 다른 색상 적용하기
 * - [x] 각 plane에 다른 opacity 적용하기
 * - [x] 매 프레임마다 opacity 바뀌게 하기
 * - [x] 투명 텍스처 적용하기
 */
export function Planes() {
  const [texture] = useLoader(THREE.TextureLoader, [Img])
  const meshRef = useRef()
  const positionArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS * 3).map(() => 0))).current
  // const timeArray = useRef(Uint32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    for (let i = 0; i < NUM_ITEMS; i += 1) {
      const speed = 1 + i * 0.01
      positionArray[i * 3] = Math.sin(t * speed) + i - NUM_ITEMS / 2
      positionArray[i * 3 + 1] = Math.cos(t * speed) + i - NUM_ITEMS / 2
    }
    meshRef.current.geometry.attributes.planePos.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, NUM_ITEMS]}>
      <planeGeometry args={[0.5, 0.5, 1]}>
        <instancedBufferAttribute attachObject={['attributes', 'planePos']} args={[positionArray, 3]} />
      </planeGeometry>
      <shaderMaterial
        ref={(r) => {
          if (r) {
            r.transparent = true
          }
        }}
        attach="material"
        // `position`, `uv`는 gl_Position과 같은 예약어이다.
        args={[
          {
            uniforms: {
              tex: {
                type: 't',
                value: texture
              }
            },
            vertexShader: `
                attribute vec3 planePos;
                varying vec2 vUv;

                void main() {
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + planePos, 1.0);
                  vUv = uv;
                }
              `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D tex;

                void main() {
                  gl_FragColor = texture2D(tex, vUv);
                }
              `
          }
        ]}
      />
    </instancedMesh>
  )
}
