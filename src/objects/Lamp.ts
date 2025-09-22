import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'

export default class Lamp extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.LampBulb)

    this.setOrigin(0.5, 0) // gốc ở trên cùng (đầu dây treo)
    this.setScale(0.7)

    scene.add.existing(this)
  }

  /** Bật/tắt hiệu ứng sáng (đổi màu tint hoặc alpha) */
  public toggle(on: boolean) {
    if (on) {
      this.setTint(0xffffcc) // sáng vàng
    } else {
      this.clearTint()
    }
  }

  /** Vị trí tâm bóng đèn (để vẽ ánh sáng) */
  public getBulbPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y + this.displayHeight * 0.6)
  }

  /** Hiệu ứng lắc lư */
  public swing() {
    this.scene.tweens.add({
      targets: this,
      angle: { from: -5, to: 5 },
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }
}
