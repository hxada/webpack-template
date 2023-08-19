
import { useState } from 'react';
import './App.css';
import Graph from './components/Graph.tsx';
import Inspector from './components/Inspector.tsx';
import InsepctorControl from './components/InspectorControl.tsx';

function App() {
  const [inspectorOpen, setInspectorOpen] = useState();

  return (
    <div id='App'>
      <Graph />
      <InsepctorControl
        isOpen={inspectorOpen}
        onClick={() => setInspectorOpen(!inspectorOpen)}
      />
      <Inspector className={inspectorOpen ? 'open' : ''} />
    </div>
  )
}

export default App;
