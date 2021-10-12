import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import { Planes } from './Planes'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Canvas
        style={{ backgroundColor: 'black' }}
        onCreated={(state) => {
          // const gl = state.gl.getContext()
          // console.log()
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.NEAREST)
        }}>
        <Planes />
      </Canvas>
    </Suspense>
  )
}