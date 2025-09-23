import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import EventKeys from 'consts/EventKeys'

export default class Pot extends Phaser.GameObjects.Image {
  private currentPlantType: string | null = null

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.PlantPot)

    this.setOrigin(0.5).setScale(0.3).setName(TextureKeys.PlantPot)
    scene.add.existing(this)
  }

  /** Kiểm tra lá có rơi vào chậu không, animate nếu trúng */
  public checkDrop(leaf: Phaser.GameObjects.Image, plantType: string) {
    const dx = leaf.x - this.x
    const dy = leaf.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= this.displayWidth / 2) {
      this.currentPlantType = plantType

      // chỉ move thẳng + scale nhẹ về nhỏ hơn
      this.scene.tweens.add({
        targets: leaf,
        x: this.x,
        y: this.y - this.displayHeight / 4,
        // scale: 0.1,
        duration: 300,
        // ease: 'Sine.easeOut',
        onComplete: () => {
          leaf.destroy()
          this.emit(EventKeys.PlantDrop, plantType)
        }
      })
    } else {
      // fade out nếu thả ngoài chậu
      this.scene.tweens.add({
        targets: leaf,
        alpha: 0,
        duration: 200,
        onComplete: () => leaf.destroy()
      })
    }
  }

  /** Lấy loại cây hiện tại */
  public getCurrentPlant(): string | null {
    return this.currentPlantType
  }

  /** Xóa cây trong chậu */
  public clearPlant() {
    this.currentPlantType = null
  }
}
