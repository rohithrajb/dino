import React, { useEffect, useRef } from 'react'
import '../App.css'
import Phaser from 'phaser'
import { DinoScene } from './scenes/MainScene'

function GameContainer() {
   const canvasRef = useRef(null)
   // const pressToPlayRef = useRef(null)
   // const gameOverRef = useRef(null)

   // const handleClick = () => {
   //    pressToPlayRef.current.style.display = 'none'
   // }

   const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight, 
      backgroundColor: '#697e96',
      scale: {
         mode: Phaser.Scale.FIT,
      },
      scene: DinoScene,
      physics: {
         default: 'arcade',
         arcade: {
            gravity: {
               y: 1700, 
            },
            // debug: true
         },
      },
      // pixelArt: true
   }

   useEffect(() => {
      const newConfig = { ...config, parent: canvasRef.current }
      const game = new Phaser.Game(newConfig)

      // game.scene.add('dino', DinoScene)
      // game.scene.start('dino')

      return () => {
         game.destroy(true)
      }
   }, [])

   return (
      <>
         <div ref={canvasRef}></div>
         {/* <div onClick={handleClick} ref={pressToPlayRef} className='start-and-stop'>
            <p>Touch to play</p>
         </div>
         <div className='start-and-stop' style={{ marginTop: '30px'}}>
            <p>Game over</p>
         </div> */}
      </>
   )
}

export default GameContainer
