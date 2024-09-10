export default function (scene) {
   scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNumbers('dino', { frames: [2, 3] }),
      frameRate: 13,
      repeat: -1,
   })

   scene.anims.create({
      key: 'idle',
      frames: [{ key: 'dino', frame: 0 }]
   })
}
