import generatePlayerAnimations from '../animations'
import Cactus from '../objects/Cactus'
import { gsap } from 'gsap/dist/gsap'

export class DinoScene extends Phaser.Scene {
   constructor() {
      super('dino')
      this.gameStart = false
      this.gameOver = false
      this.width = window.innerWidth
      this.height = window.innerHeight

      this.cactuses = []
      this.timeFromLastCactus = 0
      this.timeToNextCactus = 2000

      this.score = 0
      this.highScore = !localStorage.getItem('highscore') ? '000' : localStorage.getItem('highscore')
      this.loopTimer = 0 // we essentially use this as a means to record every 100ms
   }

   preload() {
      this.load.image('mountains-back', 'assets/mountains-back.png')
      this.load.image('mountains-mid', 'assets/mountains-mid.png')
      this.load.image('mountains-front', 'assets/mountains-front.png')
      this.load.image('ground', 'assets/objects-sprites.png')
      // TODO: use the clearer spritesheet for dino and cactus
      this.load.spritesheet('dino', 'assets/dino.png', { frameWidth: 88, frameHeight: 97 })
      this.load.spritesheet('cactus', 'assets/cactuses.png', { frameWidth: 50, frameHeight: 101 })

      this.load.on('complete', () => {
         generatePlayerAnimations(this)
      })
   }

   create() {
      this.mountainsBack = this.add
         .tileSprite(0, this.height - 894, this.width, 894, 'mountains-back')
         .setOrigin(0, 0)

      this.mountainsMid = this.add
         .tileSprite(0, this.height - 770, this.width, 770, 'mountains-mid')
         .setOrigin(0, 0)

      this.mountainsFront = this.add
         .tileSprite(0, this.height - 482, this.width, 482, 'mountains-front')
         .setOrigin(0, 0)

      // setting the height as -28 considers the 28px from the bottom of the spritesheet
      this.platform = this.add
         .tileSprite(0, this.height - 100, this.width + 100, -28, 'ground')
         .setOrigin(0, 0)

      // physics.add.existing gives physics to any game object
      this.physics.add.existing(this.platform, true)

      // TODO: make the player a seperate reusable component
      // scaling the dino's size according to width as standard
      this.player = this.physics.add
         .sprite(80, this.height - (40 / 100) * this.height, 'dino')
         .setOrigin(0, 0)
         .setScale(0.6)
         .setCollideWorldBounds(true)

      this.physics.add.collider(this.player, this.platform)

      this.scoreText = this.add
         .text(
            this.width - (20 / 375) * this.width,
            (20 / 667) * this.height,
            'HI ' + this.highScore + ' 0',
            {
               fontFamily: 'font1',
               fontSize: (12 / 375) * this.width,
            }
         )
         .setOrigin(1, 0)

      this.pressToPlay = this.add
         .text(this.width / 2, this.height / 2, 'Press to play', {
            textAlign: 'center',
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(0.5, 0.5)

      this.input.on('pointerdown', () => {
         if (!this.gameStart) {
            this.pressToPlay.destroy(true)
            this.gameStart = true
            this.game.resume()
         }

         if (this.gameStart && !this.gameOver && this.player.body.onFloor()) {
            // TODO: double check the following bug doesn't occur in any device. the bug occurs when a particularly small object falls from a height and goes through the object it is supposed to collide with. since the objects are not being scaled up for any resolution, this shouldn't be a problem
            // refer: https://stackoverflow.com/questions/48836168/falling-from-long-distances-can-make-phaser-sprite-to-ignore-collision-over-tile
            this.player.setVelocityY(-700)
         }
      })
   }

   update(time, delta) {
      // TODO: this way of getting to start the game on click is pretty good, but may not be the best. research if there is a better approach like the way using game.add+game.start
      // pausing the game right on the first re-render so that all the game objects are loaded
      if (!this.gameStart) {
         this.game.pause()
      }

      if (this.gameStart && !this.gameOver) {
         if (this.player.body.onFloor()) {
            this.player.anims.play('run', true)
         } else {
            this.player.anims.play('idle', true)
         }

         this.mountainsBack.tilePositionX += 0.05
         this.mountainsMid.tilePositionX += 0.2
         this.mountainsFront.tilePositionX += 0.8

         this.platform.tilePositionX += 2

         this.timeFromLastCactus += delta

         if (this.timeFromLastCactus > this.timeToNextCactus) {
            this.timeToNextCactus = Phaser.Math.Between(800, 2000)
            this.cactuses.push(new Cactus(this))
            this.timeFromLastCactus = 0
         }

         this.loopTimer += 10

         if (this.loopTimer > 100) {
            this.score += 1
            this.loopTimer = 0
         }

         this.scoreText.setText('HI ' + this.highScore + ' ' + this.score)
      }
   }

   endGame() {
      this.physics.pause()
      this.player.anims.play('idle', true)

      if (this.score > this.highScore) {
         localStorage.setItem('highscore', this.score)

         const newHighScore = localStorage.getItem('highscore')
         this.scoreText.setText('HI ' + newHighScore + ' ' + this.score)

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
            //    this.scoreText.setColor(tween.color)
            // },
            // other callbacks:
            onUpdate: () => {
               this.scoreText.setColor(tween.color)
            },
         })

         console.log(animation)
      }

      this.gameOver = true
   }
}
