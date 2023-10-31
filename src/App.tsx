import React, { lazy, Suspense, useState } from 'react'
import smallImg from './assets/imgs/smallImg.png'
import bigImg from './assets/imgs/bigImg.png'
import '@/App.css'
import { Visualization } from './components/Visualization'
import { Demo1, Demo2 } from '@/components'
import LazyDemo from './components/LazyDemo'

const PreFetchDemo = lazy(
  () =>
    import(
      /* webpackChunkName: "PreFetchDemo" */
      /*webpackPrefetch: true*/
      '@/components/PreFetchDemo'
    )
)
const PreloadDemo = lazy(
  () =>
    import(
      /* webpackChunkName: "PreloadDemo" */
      /*webpackPreload: true*/
      '@/components/PreloadDemo'
    )
)

function App() {
  const [show, setShow] = useState(false)

  //点击事件中动态引入css，设置show为true
  const onClick = () => {
    import('@/App.css')
    setShow(true)
  }
  return (
    <>
      <h2 onClick={onClick}>展示</h2>
      {show && (
        <>
          <Suspense fallback={null}>
            <PreFetchDemo />
          </Suspense>
          <Suspense fallback={null}>
            <PreFetchDemo />
          </Suspense>
        </>
      )}
    </>
  )
}
export default App
