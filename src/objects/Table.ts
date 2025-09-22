import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'

export default class Table extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.Table)

    this.setOrigin(0.5)
    this.setScale(0.4)
    this.setName(TextureKeys.Table)

    scene.add.existing(this)
  }
}
