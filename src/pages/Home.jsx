import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import state from '../contexts/state'

export default observer(() => {
  const [traceLength, setTraceLength] = React.useState(40)
  const [registerCount, setRegisterCount] = React.useState(2)
  const [result, setResult] = React.useState([])
  const { stark } = React.useContext(state)
  return (
    <div style={{ textAlign: 'center', padding: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{display: 'flex', flexDirection: 'column', }}>
          <span>Trace length (number of steps)</span>
          <input
            type="range"
            min="2"
            max="300"
            value={traceLength}
            onChange={e => setTraceLength(e.target.value)}
          />
          <input type="number" value={traceLength} onChange={e => setTraceLength(e.target.value)} />
        </div>
        <div style={{ width: '8px', height: '8px'}} />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span>Register count (number of operations per step)</span>
          <input
            type="range"
            min="1"
            max="50"
            value={registerCount}
            onChange={e => setRegisterCount(e.target.value)}
          />
          <input type="number" value={registerCount} onChange={e => setRegisterCount(e.target.value)} />
        </div>
      </div>
      <div style={{ height: '8px'}} />
      <button onClick={() => setResult(stark.buildProof(traceLength, registerCount))}>build stark</button>
      <div style={{ height: '8px'}} />
      <div>
        {result.map(txt => (
          <div style={{ margin: '2px' }} key={txt}>{txt}</div>
        ))}
      </div>
    </div>
  )
})
