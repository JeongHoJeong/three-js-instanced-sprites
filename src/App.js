import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import { Sprites } from './Sprites'
import { NUM_ITEMS } from './util'

function Slider({ name, value, min, max, onChange }) {
  return (
    <div>
      <div>{name}</div>
      <div>{value}</div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange?.(e.currentTarget.value)} />
    </div>
  )
}

function Selector({ interval, onChangeInterval }) {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, background: 'limegreen' }}>
      <Slider name="NUM_ITEMS" min={0} max={300} value={NUM_ITEMS} />
      <Slider name="INTERVAL" min={1} max={100} value={interval} onChange={onChangeInterval} />
    </div>
  )
}

export default function App() {
  const sprites = React.useRef()
  const [createInterval, setCreateInterval] = React.useState(10)

  React.useEffect(() => {
    const _int = setInterval(() => {
      // eslint-disable-next-line no-unused-expressions
      sprites.current?.create()
    }, createInterval)
    return () => clearInterval(_int)
  }, [createInterval])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'black'
      }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas>
          <Sprites ref={sprites} />
        </Canvas>
      </Suspense>
      <Selector interval={createInterval} onChangeInterval={setCreateInterval} />
    </div>
  )
}
