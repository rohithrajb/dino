export default class Cactus {
   constructor(scene) {
      this.scene = scene
      this.obstacle = scene.physics.add
         .sprite(scene.myCam.scrollX + scene.width + 100, scene.height - 250, 'cactus', 2)
         .setSize(35, 100)
         .setScale(0.6)
         .setOrigin(0, 0)

      scene.physics.add.collider(scene.platform, this.obstacle)
      scene.physics.add.collider(scene.player, this.obstacle, scene.endGame, null, scene)
   }
}
