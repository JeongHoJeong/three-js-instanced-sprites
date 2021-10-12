import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import React, { useImperativeHandle, useRef } from 'react'
import Img from './heart.png'

const NUM_ITEMS = 10

function getEmptyArray(size) {
  return new Array(size).fill()
}

const POSITION_RANGE = 4
const X_SPEED_RANGE = 1.5
const ROTATION_SPEED_RANGE = 1

/**
 * TODOs
 * - [x] 매 프레임마다 위치 바뀌게 하기
 * - [x] 각 plane에 다른 색상 적용하기
 * - [x] 각 plane에 다른 opacity 적용하기
 * - [x] 매 프레임마다 opacity 바뀌게 하기
 * - [x] 투명 텍스처 적용하기
 * - [x] 점점 사라지게 하기
 * - [x] y축 가속 운동 처리
 * - [ ] 회전 처리
 * - [ ] 여러 이미지 중 하나 랜덤 어사인해 사용
 */
function _Planes(_, ref) {
  const [texture] = useLoader(THREE.TextureLoader, [Img])
  const meshRef = useRef()
  const shaderMaterialRef = useRef()
  const positionArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS * 3).map(() => 0))).current
  const timeArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
  const xSpeedArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
  const rotationSpeedArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
  const count = useRef(0)
  const now = useRef(0)

  useImperativeHandle(ref, () => ({
    create() {
      const idx = count.current
      timeArray[idx] = now.current
      positionArray[idx * 3] = (Math.random() - 0.5) * POSITION_RANGE
      positionArray[idx * 3 + 1] = (Math.random() - 0.5) * POSITION_RANGE
      positionArray[idx * 3 + 2] = 0

      xSpeedArray[idx] = (Math.random() - 0.5) * X_SPEED_RANGE
      rotationSpeedArray[idx] = (Math.random() - 0.5) * ROTATION_SPEED_RANGE

      count.current = (idx + 1) % NUM_ITEMS
      if (meshRef.current) {
        meshRef.current.geometry.attributes.planePos.needsUpdate = true
        meshRef.current.geometry.attributes.startTime.needsUpdate = true
        meshRef.current.geometry.attributes.xSpeed.needsUpdate = true
        meshRef.current.geometry.attributes.rotationSpeed.needsUpdate = true
      }
    }
  }))

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    now.current = t
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.time.value = t
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, NUM_ITEMS]}>
      <planeGeometry args={[0.5, 0.5, 1]}>
        <instancedBufferAttribute attachObject={['attributes', 'planePos']} args={[positionArray, 3]} />
        <instancedBufferAttribute attachObject={['attributes', 'startTime']} args={[timeArray, 1]} />
        <instancedBufferAttribute attachObject={['attributes', 'xSpeed']} args={[xSpeedArray, 1]} />
        <instancedBufferAttribute attachObject={['attributes', 'rotationSpeed']} args={[rotationSpeedArray, 1]} />
      </planeGeometry>
      <shaderMaterial
        ref={(ref) => {
          if (ref) {
            ref.transparent = true
            shaderMaterialRef.current = ref
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
              },
              time: {
                type: 'float',
                value: 0
              }
            },
            vertexShader: `
                uniform float time;
                attribute vec3 planePos;
                attribute float startTime;
                attribute float xSpeed;
                attribute float rotationSpeed;
                varying vec2 vUv;
                varying float alpha;

                mat2 rotate2d(float _angle){
                  return mat2(cos(_angle), -sin(_angle),
                              sin(_angle),  cos(_angle));
                }

                void main() {
                  float v0 = 1.2;
                  float a = -1.8;
                  float t = time - startTime;
                  float y = v0 * t + 0.5 * a * t * t;
                  float x = xSpeed * t;
                  mat2 rot = rotate2d(t * rotationSpeed);
                  vec2 pos = vec2(x, y) + rot * position.xy + planePos.xy;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
                  vUv = uv;
                  alpha = 1.0 - clamp(t * 0.7, 0.0, 1.0);
                }
              `,
            fragmentShader: `
                varying vec2 vUv;
                varying float alpha;
                uniform sampler2D tex;

                void main() {
                  gl_FragColor = texture2D(tex, vUv);
                  gl_FragColor.a = alpha * gl_FragColor.a;
                }
              `
          }
        ]}
      />
    </instancedMesh>
  )
}

export const Planes = React.forwardRef(_Planes)
