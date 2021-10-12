import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import { Sprites } from './Planes'

export default function App() {
  const sprites = React.useRef()

  return (
    <div
      style={{
        height: '100%'
      }}
      onClick={() => {
        // eslint-disable-next-line no-unused-expressions
        sprites.current?.create()
      }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas style={{ backgroundColor: 'black' }}>
          <Sprites ref={sprites} />
        </Canvas>
      </Suspense>
    </div>
  )
}
