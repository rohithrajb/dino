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

   create() {
      this.mountainsBack = this.add
         .tileSprite(0, this.height - 894, this.width, 894, 'mountains-back')
         .setOrigin(0, 0)
         .setScrollFactor(0)

      this.mountainsMid = this.add
         .tileSprite(0, this.height - 770, this.width, 770, 'mountains-mid')
         .setOrigin(0, 0)
         .setScrollFactor(0)

      this.mountainsFront = this.add
         .tileSprite(0, this.height - 482, this.width, 482, 'mountains-front')
         .setOrigin(0, 0)
         .setScrollFactor(0)

      this.obstacles = this.physics.add.group({
         defaultKey: 'cactus',
         active: false,
      })

      this.timer = this.time.addEvent({
         delay: 2000,
         loop: true,
         callback: () => {
            const obstacle = this.obstacles.get(gameCamera.scrollX + width + 100, height - 150)

            if (!obstacle) return

            obstacle.setActive(true).setVisible(true)
         },
      })

      console.log(this.timer)

      this.timer.paused = true

      // different approaches for the ground/platform

      // 1. wrap approach: it is very complicated, but better in terms of memory management
      // this.platform = this.physics.add
      //    .sprite(0, this.height - 100, 'ground')
      //    .setOrigin(0, 0)
      //    .setSize(2404, -25)
      // this.physics.world.setBounds(0, 0, 2300, this.height)
      // this.platform.body.setImmovable().setAllowGravity(false)

      // 2.(working): making the platform physics-enabled, immovable, unaffected by gravity and moving backwards at the same speed as the cactuses
      // this.platform.body.setImmovable().setAllowGravity(false).setVelocityX(-250).setFriction(0)

      // 3.(best approach): making it a repeating tilesprite and following camera
      // height -25 because the player should collide with the bottom bound of the ground, not the top border

      // platformGroup
      this.platformGroup = this.physics.add.group({
         defaultKey: 'ground',
         maxSize: 5,
      })

      this.time.addEvent({
         delay: 2000,
         loop: true,
         callback: () => {
            const obstacle = obstacleGroup.get(0, height - 100, 'ground', null, false)

            obstacle.body.setImmovable().setAllowGravity(false)
         },
      })

      // TODO: make the player a seperate reusable component
      this.player = this.physics.add
         .sprite(80, this.height - 100, 'dino')
         .setOrigin(0, 1)
         .setScale(0.6)

      this.physics.add.collider(this.player, this.platform)

      // camera
      this.myCam = this.cameras.main
      this.myCam.setBounds(0, 0, Number.MAX_SAFE_INTEGER, this.height)
      this.myCam.startFollow(this.player, true, 1, 1, -120)

      this.myCam.setSize(this.width, this.height)

      this.scoreText = this.add
         .text(this.width - (20 / 375) * this.width, (20 / 667) * this.height, 'HI ' + this.highScore + ' 0', {
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(1, 0)
         .setScrollFactor(0)

      this.pressToPlayText = this.add
         .text(this.width / 2, this.height / 2, 'Press to play', {
            textAlign: 'center',
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(0.5, 0.5)

      this.gameOverText = this.add
         .text(this.width / 2, this.height / 2, 'Game over', {
            textAlign: 'center',
            fontFamily: '"Press Start 2P"',
            fontSize: 20,
         })
         .setOrigin(0.5, 0.5)
         .setScrollFactor(0)
      this.gameOverText.visible = false

      this.input.on('pointerdown', () => {
         if (!this.gameStart) {
            this.pressToPlayText.destroy(true)
            this.gameStart = true
            this.game.resume()
         }

         if (this.gameStart && !this.gameOver && this.player.body.onFloor()) {
            // TODO: double check the following bug doesn't occur in any device. the bug occurs when a particularly small object falls from a height and goes through the object it is supposed to collide with. since the objects are not being scaled up for any resolution, this shouldn't be a problem
            // refer: https://stackoverflow.com/questions/48836168/falling-from-long-distances-can-make-phaser-sprite-to-ignore-collision-over-tile
            this.player.setVelocityY(-700)
         }

         if (this.gameOver) {
            this.gameStart = false
            this.gameOver = false
            this.cactuses = []
            this.timeFromLastCactus = 0
            this.timeToNextCactus = 2000
            this.score = 0
            this.highScore = localStorage.getItem('highscore')
            this.loopTimer = 0
            this.scene.restart()
         }
      })
   }

   update(time, delta) {
      // TODO: this way of getting starting the game on click is pretty good, but may not be the best. research if there is a better approach like the way using game.add+game.start
      // pausing the game right on the first re-render so that all the game objects are loaded
      if (!this.gameStart) {
         this.game.pause()
      }

      global.gameTick++

      if (this.gameStart && !this.gameOver) {
         if (this.player.body.onFloor()) {
            this.player.anims.play('run', true)
         } else {
            this.player.anims.play('idle', true)
         }

         this.player.x += 2

         this.mountainsBack.tilePositionX = this.myCam.scrollX * 0.06
         this.mountainsMid.tilePositionX = this.myCam.scrollX * 0.13
         this.mountainsFront.tilePositionX = this.myCam.scrollX * 0.4

         this.platform.tilePositionX = this.myCam.scrollX

         // Phaser.Actions.IncX(this.obstacles.getChildren(), )

         this.obstacles.incX(2)

         this.obstacles.children.iterate((obstacle) => {
            if (obstacle.active && obstacle.x < gameCamera.scrollX) {
               this.obstacles.killAndHide(obstacle)
            }
         })

         // this.timeFromLastCactus += delta

         // if (this.timeFromLastCactus > this.timeToNextCactus) {
         //    this.timeToNextCactus = Phaser.Math.Between(800, 2000)
         //    this.cactuses.push(new Cactus(this))
         //    this.timeFromLastCactus = 0
         // }

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
      }

      this.gameOverText.visible = true
      this.gameOver = true
   }
}

function create() {
   // create coins
   for (var i = 0; i < vars.coinTotal; i++) {
      var coin = game.coins.create(x, 0, 'coin')
      coin.tween = game.add.tween(coin).to({ alpha: 0, y: 80, x: coin.x + game.width / 1.8 }, 1000, Phaser.Easing.Cubic.Out)
      coin.pickedUp = false // set flag on each coin to prevent multiple update calls
      coin.tween.onComplete.add(function (coin, tween) {
         coin.kill()
      })
   }
}
function update() {
   // add collide event for pickup
   game.physics.arcade.overlap(player, coin, coinPickup, null, this)
}
function coinPickup(player, coin) {
   if (!coin.pickedUp) {
      // check if coin has already been picked up, if not proceed...
      coin.pickedUp = true // then immediately set it to true so it is only called once
      game.coinCount += 1
      coin.tween.start()
   }
}
