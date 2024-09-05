import generatePlayerAnimations from '../animations'

export class DinoScene extends Phaser.Scene {
   constructor() {
      super('Dino')
      this.width = window.innerWidth
      this.height = window.innerHeight
   }

   preload() {
      this.load.image('mountains-back', 'assets/mountains-back.png')
      this.load.image('mountains-mid', 'assets/mountains-mid.png')
      this.load.image('mountains-front', 'assets/mountains-front.png')
      this.load.spritesheet('dino', 'assets/dino.png', { frameWidth: 16, frameHeight: 16 })
      this.load.spritesheet('cactus', 'assets/tiles.png', { frameWidth: 16, frameHeight: 16 })
      this.load.image('ground', 'assets/objects-sprites.png')

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
      this.platform = this.add.tileSprite(0, this.height - 100, this.width, -28, 'ground').setOrigin(0, 0)

      // physics.add.existing gives physics to any game object
      this.physics.add.existing(this.platform, true)

      this.player = this.physics.add
         .sprite(80, this.height - (40 / 100) * this.height, 'dino')
         .setOrigin(0, 0)
         .setScale(4)
         .setCollideWorldBounds(true)

      this.physics.add.collider(this.player, this.platform)

      this.input.on('pointerdown', () => {
         if (this.player.body.touching.down) {
            this.player.setVelocityY(-800)
         }
      })
   }

   update() {
      this.mountainsBack.tilePositionX += 0.05
      this.mountainsMid.tilePositionX += 0.2
      this.mountainsFront.tilePositionX += 0.8

      this.platform.tilePositionX += 1

      this.player.anims.play('run', true)
   }
}
