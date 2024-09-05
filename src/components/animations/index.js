export default function (scene) {
   scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNumbers('dino', { start: 1, end: 2 }),
      frameRate: 10,
      repeat: -1,
   })

   scene.anims.create({
      key: 'idle',
      frames: [{ key: 'dino', frame: 0 }],
   })
}
