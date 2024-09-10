import './App.css'
import GameContainer from './components/GameContainer'

function App() {
   return (
      <>
         <GameContainer />
         {/* TODO: find a better way to use a custom font family inside canvas */}
         <div style={{ fontFamily: '"Press Start 2P"', visibility: 'hidden' }}>.</div>
      </>
   )
}

export default App
