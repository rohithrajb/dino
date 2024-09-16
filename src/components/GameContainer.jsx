import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import generatePlayerAnimations from './animations'
import { gsap } from 'gsap/dist/gsap'

function GameContainer() {
   const canvasRef = useRef(null)

   const width = window.innerWidth
   const height = window.innerHeight

   const config = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      backgroundColor: '#697e96',
      scale: {
         mode: Phaser.Scale.FIT,
      },
      scene: {
         preload: preload,
         create: create,
         update: update,
      },
      physics: {
         default: 'arcade',
         arcade: {
            gravity: {
               y: 1700,
            },
            // debug: false,
         },
      },
      pixelArt: false,
   }

   let gameStart = false
   let gameOver = false

   let timeFromLastCactus = 0
   let timeToNextCactus = 2000
   let loopTimer = 0

   let score = 0
   let highScore = !localStorage.getItem('highscore') ? '000' : localStorage.getItem('highscore')

   let mountainsBack,
      mountainsMid,
      mountainsFront,
      platformGroup,
      platformLoopCount,
      player,
      obstacleTimer,
      obstacleGroup,
      gameCamera,
      scoreText,
      gameOverText,
      pressToPlayText
      // allowLevelUpgrade = true

   let gameSpeed = 0
   let nextLevelPoints = 100

   function preload() {
      this.load.image('mountains-back', 'game-assets/mountains-back.png')
      this.load.image('mountains-mid', 'game-assets/mountains-mid.png')
      this.load.image('mountains-front', 'game-assets/mountains-front.png')
      this.load.image('ground', 'game-assets/ground.png')
      this.load.spritesheet('dino', 'game-assets/dino.png', { frameWidth: 88, frameHeight: 97 })
      this.load.spritesheet('cactus', 'game-assets/cactuses.png', { frameWidth: 50, frameHeight: 101 })

      this.load.on('complete', () => {
         generatePlayerAnimations(this)
      })
   }

   function create() {
      // background layers
      mountainsBack = this.add
         .tileSprite(0, height - 894, width, 894, 'mountains-back')
         .setOrigin(0, 0)
         .setScrollFactor(0)

      mountainsMid = this.add
         .tileSprite(0, height - 770, width, 770, 'mountains-mid')
         .setOrigin(0, 0)
         .setScrollFactor(0)

      mountainsFront = this.add
         .tileSprite(0, height - 482, width, 482, 'mountains-front')
         .setOrigin(0, 0)
         .setScrollFactor(0)

      // platformGroup
      platformGroup = this.physics.add.group({
         defaultKey: 'ground',
         maxSize: 5,
      })

      const firstPlatform = platformGroup
         .get(0, height - 100, 'ground', null, false)
         .setOrigin(0, 0)
         .setSize(2404, -25)
      firstPlatform.body.setAllowGravity(false).setImmovable()
      firstPlatform.setActive(true).setVisible(true)

      const secondPlatform = platformGroup
         .get(2404, height - 100, 'ground', null, false)
         .setOrigin(0, 0)
         .setSize(2404, -25)
      secondPlatform.body.setAllowGravity(false).setImmovable()
      secondPlatform.setActive(true).setVisible(true)
      platformLoopCount = 2

      // player(dino)
      player = this.physics.add
         .sprite(80, height - 100, 'dino')
         .setOrigin(0, 1)
         .setScale(0.6)

      this.physics.add.collider(player, platformGroup)

      // obstacle(cactus) group
      obstacleGroup = this.physics.add.group({
         defaultKey: 'cactus',
         maxSize: 10,
      })

      this.physics.add.collider(obstacleGroup, platformGroup)
      this.physics.add.collider(player, obstacleGroup, endGame, null, this)

      obstacleTimer = this.time.addEvent({
         delay: 2000,
         loop: true,
         callback: () => {
            const obstacle = obstacleGroup
               .get(gameCamera.scrollX + width + 100, height - 150, 'cactus', Phaser.Math.Between(0, 2), true)
               .setSize(35, 100)
               .setScale(0.6)

            obstacle.setActive(true).setVisible(true)
         },
      })

      // camera
      gameCamera = this.cameras.main

      // score text
      scoreText = this.add
         .text(width - (20 / 375) * width, (20 / 667) * height, 'HI ' + highScore + ' 0', {
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(1, 0)
         .setScrollFactor(0)

      // press to play text
      pressToPlayText = this.add
         .text(width / 2, height / 2, 'Press to play', {
            textAlign: 'center',
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(0.5, 0.5)

      // game over text
      gameOverText = this.add
         .text(width / 2, height / 2, 'Game over', {
            textAlign: 'center',
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(0.5, 0.5)
         .setScrollFactor(0)
      gameOverText.visible = false

      // touch events
      this.input.on('pointerdown', () => {
         if (!gameStart) {
            pressToPlayText.destroy(true)
            gameStart = true
            this.game.resume()
         }

         if (gameStart && !gameOver && player.body.onFloor()) {
            // TODO: double check the following bug doesn't occur in any device. the bug occurs when a particularly small object falls from a height and goes through the object it is supposed to collide with. since the objects are not being scaled up for any resolution, this shouldn't be a problem
            // refer: https://stackoverflow.com/questions/48836168/falling-from-long-distances-can-make-phaser-sprite-to-ignore-collision-over-tile
            player.setVelocityY(-700)
         }

         if (gameOver) {
            // TODO: see if there is a better way to reset all these
            gameStart = false
            gameOver = false
            timeFromLastCactus = 0
            timeToNextCactus = 2000
            score = 0
            highScore = localStorage.getItem('highscore')
            loopTimer = 0
            this.scene.restart()
         }
      })
   }

   function update(time, delta) {
      // TODO: this way of getting starting the game on click is pretty good, but may not be the best. research if there is a better approach like the way using game.add+game.start
      // pausing the game right on the first re-render so that all the game objects are loaded
      if (!gameStart) {
         this.game.pause()
      }

      if (gameStart && !gameOver) {
         if (player.body.onFloor()) {
            player.anims.play('run', true)
         } else {
            player.anims.play('idle', true)
         }

         if(score >= nextLevelPoints) {
            gameSpeed += 1
            nextLevelPoints += 100
         }

         player.x = player.x + (2 * delta/8 + gameSpeed)

         gameCamera.scrollX = gameCamera.scrollX + (2 * delta/8 + gameSpeed)

         mountainsBack.tilePositionX = gameCamera.scrollX * 0.06
         mountainsMid.tilePositionX = gameCamera.scrollX * 0.13
         mountainsFront.tilePositionX = gameCamera.scrollX * 0.4

         // TODO: research an alternative for this. iterating 2 object pools on every update is very costly in terms of memory
         platformGroup.children.iterate((platform) => {
            if (platform.active && platform.x < gameCamera.scrollX - 2600) {
               platformGroup.killAndHide(platform)

               const newPlatform = platformGroup
                  .get(2404 * platformLoopCount, height - 100, 'ground', null, false)
                  .setOrigin(0, 0)
                  .setSize(2404, -25)

               newPlatform.body.setAllowGravity(false).setImmovable()
               newPlatform.setActive(true).setVisible(true)
               platformLoopCount += 1
            }
         })

         obstacleGroup.children.iterate((obstacle) => {
            if (obstacle.active && obstacle.x < gameCamera.scrollX - 200) {
               obstacleGroup.killAndHide(obstacle)
            }
         })

         // timeFromLastCactus += delta

         // if (timeFromLastCactus > timeToNextCactus) {
         //    timeToNextCactus = Phaser.Math.Between(800, 2000)
         //    obstacleGroup
         //       .create(gameCamera.scrollX + width + 100, height - 150, 'cactus', Phaser.Math.Between(0, 2))
         //       .setSize(35, 100)
         //       .setScale(0.6)
         //    timeFromLastCactus = 0
         // }

         // increase the loop timer also using delta and check if it is still slow in production just as the game
         loopTimer += delta

         if (loopTimer > 100) {
            score += 1
            loopTimer = 0
         }

         scoreText.setText('HI ' + highScore + ' ' + score)
      }
   }

   function endGame() {
      this.physics.pause()
      player.anims.play('idle', true)

      obstacleTimer.paused = true

      if (score > highScore) {
         localStorage.setItem('highscore', score)

         const newHighScore = localStorage.getItem('highscore')
         scoreText.setText('HI ' + newHighScore + ' ' + score)

         const tween = { color: 'white' }

         // TODO: come back here and experiment with the ununsed variables
         // "to" tween - animate to provided values
         const animation = gsap.to(tween, {
            // selector text, Array, or object
            color: '#656566', // any properties (not limited to CSS)
            duration: 0.1, // seconds
            // ease: 'power2.inOut',
            // stagger: 0.1, // stagger start times
            // overwrite: 'auto', // default is false
            repeat: 5, // number of repeats (-1 for infinite)
            // repeatDelay: 1, // seconds between repeats
            // repeatRefresh: true, // invalidates on each repeat
            yoyo: true, // if true > A-B-B-A, if false > A-B-A-B
            // yoyoEase: true, // or ease like "power2"
            immediateRender: false,
            // onComplete: () => {
            //    scoreText.setColor(tween.color)
            // },
            // other callbacks:
            onUpdate: () => {
               scoreText.setColor(tween.color)
            },
         })
      }

      gameOverText.visible = true
      gameOver = true
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
