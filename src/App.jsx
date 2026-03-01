import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const [weather, setWeather] = useState(null);

  async function handleonClick() {
    const response = await fetch('http://localhost:3001/california');
    const data = await response.json();
    setWeather(data);
  }

  return (
    <>
      <h1>Weather API</h1>
      <button onClick={handleonClick}>FETCH DATA</button>
      {weather && <pre>{JSON.stringify(weather, null, 2)}</pre>}
    </>
  )
}

export default App
