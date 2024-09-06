import generatePlayerAnimations from '../animations'
import Cactus from '../objects/Cactus'

export class DinoScene extends Phaser.Scene {
   constructor() {
      super('Dino')
      this.gameOver = false
      this.width = window.innerWidth
      this.height = window.innerHeight

      this.cactuses = []
      this.timeFromLastCactus = 0
      this.timeToNextCactus = 2000

      this.score = 0
      this.loopTimer = 0 // we essentially use this as a means to record every 100ms
   }

   preload() {
      this.load.image('mountains-back', 'assets/mountains-back.png')
      this.load.image('mountains-mid', 'assets/mountains-mid.png')
      this.load.image('mountains-front', 'assets/mountains-front.png')
      // TODO: use the clearer spritesheet for dino and cactus
      this.load.spritesheet('dino', 'assets/dino.png', { frameWidth: 16, frameHeight: 16 })
      this.load.spritesheet('cactus', 'assets/tiles.png', { frameWidth: 16, frameHeight: 16 })
      this.load.image('ground', 'assets/objects-sprites.png')

      this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js')

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

      // TODO: learn why physics couldn't be added to this tileSprite directly and why it had to be done seperately like below
      // setting the height as -28 considers the 28px from the bottom of the spritesheet
      this.platform = this.add
         .tileSprite(0, this.height - 100, this.width, -28, 'ground')
         .setOrigin(0, 0)

      // physics.add.existing gives physics to any game object
      this.physics.add.existing(this.platform, true)

      // TODO: make the player a seperate reusable component
      this.player = this.physics.add
         .sprite(80, this.height - (40 / 100) * this.height, 'dino')
         .setOrigin(0, 0)
         .setScale(4)
         .setCollideWorldBounds(true)

      this.player.anims.play('run', true)

      this.physics.add.collider(this.player, this.platform)

      this.input.on('pointerdown', () => {
         if (!this.gameOver && this.player.body.touching.down) {
            this.player.setVelocityY(-800)
         }
      })

      this.scoreText = this.add.text(this.width - (20 / 375) * this.width, (20 / 667) * this.height, 'HI 000000 000000', {
         fontFamily: 'font1',
         fontSize: 12/375 * this.width
      }).setOrigin(1, 0)
   }

   update(time, delta) {
      if (!this.gameOver) {
         this.mountainsBack.tilePositionX += 0.05
         this.mountainsMid.tilePositionX += 0.2
         this.mountainsFront.tilePositionX += 0.8

         this.platform.tilePositionX += 2

         this.timeFromLastCactus += delta

         if (this.timeFromLastCactus > this.timeToNextCactus) {
            this.timeToNextCactus = 1500
            this.cactuses.push(new Cactus(this))
            this.timeFromLastCactus = 0
         }

         this.loopTimer += 10

         if(this.loopTimer > 100) {
            this.score += 1
            this.loopTimer = 0
         }

         this.scoreText.setText('HI 000000 ' + this.score)
      }
   }

   endGame() {
      this.physics.pause()
      this.player.anims.play('idle', true)

      this.gameOver = true
   }
}
