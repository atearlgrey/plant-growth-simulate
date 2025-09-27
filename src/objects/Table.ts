import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import EventKeys from 'consts/EventKeys'
import PotType from 'consts/PotType'

export default class Table extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.Table)

    this.setOrigin(0.5).setScale(1.5).setName(TextureKeys.Table)
    scene.add.existing(this)
  }

  public getSurfacePoints(): { left: { x: number; y: number }, right: { x: number; y: number } } {
    const topY = this.y - this.displayHeight / 2
    const halfWidth = this.displayWidth / 2

    return {
      left: { x: this.x - halfWidth, y: topY },
      right: { x: this.x + halfWidth, y: topY }
    }
  }

  /** Trả về vị trí mặt bàn (center trên cùng) */
  public getSurfacePosition(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y - this.displayHeight / 2
    }
  }

  public checkDrop(
    icon: Phaser.GameObjects.Image,
    potType: PotType,
    factor: number = 1.0,
    debug: boolean = false
  ) {
    const cx = this.x
    const cy = this.y
    const rx = (this.displayWidth * 1.5) * factor
    const ry = (this.displayHeight * 1.2) * factor

    if (debug) {
      const g = this.scene.add.graphics()
      g.lineStyle(2, 0x00ff00, 0.5)
      g.strokeEllipse(cx, cy, rx * 2, ry * 2)
      g.setDepth(1000)
      this.scene.time.delayedCall(500, () => g.destroy())
    }

    const dx = (icon.x - cx) / rx
    const dy = (icon.y - cy) / ry
    const inside = dx * dx + dy * dy <= 1

    if (inside) {
      // 👇 Tính toạ độ mép trên của bàn
      const topY = this.y - this.displayHeight / 2

      this.emit(EventKeys.PotDrop, {
        x: this.x,
        y: topY - 10, // đặt pot trên mặt bàn
        potType
      })
      icon.destroy()
    } else {
      this.scene.tweens.add({
        targets: icon,
        alpha: 0,
        duration: 200,
        onComplete: () => icon.destroy()
      })
    }
  }

  public getTopY(): number {
    return this.y - this.displayHeight / 2
  }
}
