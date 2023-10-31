import * as React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)
