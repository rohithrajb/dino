import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { DinoScene } from './scenes/MainScene'

function GameContainer() {
   const canvasRef = useRef(null)

   const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#697e96',
      scale: {
         mode: Phaser.Scale.FIT,
         // autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: DinoScene,
      physics: {
         default: 'arcade',
         arcade: {
            gravity: {
               y: 2000
            }
         }
      },
      // pixelArt: true
   }

   useEffect(() => {
      const newConfig = { ...config, parent: canvasRef.current }
      const game = new Phaser.Game(newConfig)

      return () => {
         game.destroy(true)
      }
   }, [])

   return (
      <>
         <div ref={canvasRef}></div>
      </>
   )
}

export default GameContainer
