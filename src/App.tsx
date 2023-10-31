import React, { useState } from 'react'
import smallImg from './assets/imgs/smallImg.png'
import bigImg from './assets/imgs/bigImg.png'
import './App.css'
import { Visualization } from './components/Visualization'

function App() {
  const [count, setCount] = useState('')
  const onChange = (e: any) => {
    setCount(e.target.value)
  }

  return (
    <>
      <h2>hushcfjijidnj</h2>
      <p>受控组件</p>
      <input type='text' value={count} onChange={onChange} />
      <br />
      <p>非受控组件</p>
      <input type='text' />
    </>
  )
}
export default App
