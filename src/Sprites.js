import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import React, { useImperativeHandle, useRef } from 'react'
import Tex0 from './images/heart.png'
import Tex1 from './images/clap.png'
import Tex2 from './images/thumbs.png'

const NUM_ITEMS = 100

function getEmptyArray(size) {
  return new Array(size).fill()
}

const POSITION_RANGE = 4
const X_SPEED_RANGE = 1.5
const ROTATION_SPEED_RANGE = 1

function _Sprites(_, ref) {
  const [tex0, tex1, tex2] = useLoader(THREE.TextureLoader, [Tex0, Tex1, Tex2])
  const meshRef = useRef()
  const shaderMaterialRef = useRef()
  const positionArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS * 3).map(() => 0))).current
  const timeArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
  const xSpeedArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
  const rotationSpeedArray = useRef(Float32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
  const itemTypeArray = useRef(Int32Array.from(getEmptyArray(NUM_ITEMS)).map(() => 0)).current
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
      itemTypeArray[idx] = Math.floor(Math.random() * 3)

      count.current = (idx + 1) % NUM_ITEMS
      if (meshRef.current) {
        meshRef.current.geometry.attributes.planePos.needsUpdate = true
        meshRef.current.geometry.attributes.startTime.needsUpdate = true
        meshRef.current.geometry.attributes.xSpeed.needsUpdate = true
        meshRef.current.geometry.attributes.rotationSpeed.needsUpdate = true
        meshRef.current.geometry.attributes.itemType.needsUpdate = true
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
        <instancedBufferAttribute attachObject={['attributes', 'itemType']} args={[itemTypeArray, 1]} />
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
              tex0: {
                type: 't',
                value: tex0
              },
              tex1: {
                type: 't',
                value: tex1
              },
              tex2: {
                type: 't',
                value: tex2
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
                attribute int itemType;
                varying vec2 vUv;
                varying float alpha;
                flat varying lowp int texId;

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
                  texId = itemType;
                }
              `,
            fragmentShader: `
                varying vec2 vUv;
                varying float alpha;
                flat varying lowp int texId;
                uniform sampler2D tex0;
                uniform sampler2D tex1;
                uniform sampler2D tex2;

                void main() {
                  switch (texId) {
                    case 0:
                      gl_FragColor = texture2D(tex0, vUv);
                      break;   
                    case 1:
                      gl_FragColor = texture2D(tex1, vUv);
                      break;
                    default:
                      gl_FragColor = texture2D(tex2, vUv);
                  }
                  gl_FragColor.a = alpha * gl_FragColor.a;
                }
              `
          }
        ]}
      />
    </instancedMesh>
  )
}

export const Sprites = React.forwardRef(_Sprites)
