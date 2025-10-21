import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import dotenv from 'dotenv'

// dotenv.config();
// import SummarizeButton from './components/SummarizeButton'
// import process from 'process'

function App() {
  const [count, setCount] = useState(0)
  // const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY ?? "";

  return (
    <>
      <div className="summarize">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <p className='summarize'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lacinia
        massa in nisi suscipit, sit amet efficitur metus tincidunt. Sed vel
        cursus magna.
      </p>
      <p>
        Phasellus eu velit sed enim faucibus tincidunt. Vivamus euismod, justo
        nec vulputate pharetra, enim urna faucibus lacus.
      </p>
      <h1>Vite + React</h1>
      
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
