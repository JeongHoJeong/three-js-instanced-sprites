import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import { Planes } from './Planes'

export default function App() {
  const planes = React.useRef()

  return (
    <div
      style={{
        height: '100%'
      }}
      onClick={() => {
        // eslint-disable-next-line no-unused-expressions
        planes.current?.create()
      }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas style={{ backgroundColor: 'black' }}>
          <Planes ref={planes} />
        </Canvas>
      </Suspense>
    </div>
  )
}
