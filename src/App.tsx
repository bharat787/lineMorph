import { SuspensionBridge } from './components/SuspensionBridge'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1 className="app__title">Suspension bridge</h1>
      <p className="app__hint">Side view — 4 strokes</p>
      <div className="app__bridge">
        <SuspensionBridge />
      </div>
    </main>
  )
}

export default App
