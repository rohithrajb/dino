export default class Cactus {
   constructor(scene) {
      this.scene = scene
      this.obstacle = scene.physics.add
         .sprite(scene.width + 50, scene.height - 250, 'cactus', 2)
         .setSize(35, 100)
         .setScale(0.6)
         .setOrigin(0, 0)
         .setCollideWorldBounds(true)

      this.obstacle.body.customBoundsRectangle.left = -100
      this.obstacle.body.customBoundsRectangle.right = scene.width + 300

      scene.physics.add.collider(scene.platform, this.obstacle)
      scene.physics.add.collider(scene.player, this.obstacle, scene.endGame, null, scene)

      this.update()
   }

   update() {
      // TODO: the relative motion between the platform and the cactuses isn't consistent. fixing this is very important
      this.obstacle.setVelocityX(-250)
   }
}
