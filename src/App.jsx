import './App.css'
import GameContainer from './components/GameContainer'

function App() {
   return (
      <>
         <GameContainer />
         {/* below div is used to load the font family so that it can be used in canvas */}
         <div style={{ fontFamily: '"Press Start 2P"', visibility: 'hidden' }}>.</div>
      </>
   )
}

export default App
