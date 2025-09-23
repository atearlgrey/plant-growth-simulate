import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'

export default class Window extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.Window)

    this.setOrigin(0.5, 0.5)   // căn giữa
    this.setScale(0.3)         // tuỳ chỉnh scale theo kích thước phòng

    scene.add.existing(this)
  }

  /** Lấy vị trí tâm cửa sổ (để vẽ ánh sáng mặt trời chiếu xuống) */
  public getCenterPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y)
  }

  /** Lấy tọa độ 4 góc cửa sổ (sau khi scale) */
  public getCorners(): { topLeft: Phaser.Math.Vector2, topRight: Phaser.Math.Vector2, bottomLeft: Phaser.Math.Vector2, bottomRight: Phaser.Math.Vector2 } {
    const halfW = this.displayWidth / 2
    const halfH = this.displayHeight / 2

    return {
      topLeft: new Phaser.Math.Vector2(this.x - halfW, this.y - halfH),
      topRight: new Phaser.Math.Vector2(this.x + halfW, this.y - halfH),
      bottomLeft: new Phaser.Math.Vector2(this.x - halfW, this.y + halfH),
      bottomRight: new Phaser.Math.Vector2(this.x + halfW, this.y + halfH),
    }
  }

  /** Lấy cạnh trên, dưới, trái, phải */
  public getEdges(): { left: number, right: number, top: number, bottom: number } {
    const halfW = this.displayWidth / 2
    const halfH = this.displayHeight / 2

    return {
      left: this.x - halfW,
      right: this.x + halfW,
      top: this.y - halfH,
      bottom: this.y + halfH,
    }
  }

  /** Highlight 4 ô kính bằng overlay màu vàng nhạt */
  public highlightGlass(scene: Phaser.Scene) {
    const edges = this.getEdges()
    const halfW = this.displayWidth / 2
    const halfH = this.displayHeight / 2

    const paneW = this.displayWidth / 2 - 10 // trừ khung gỗ
    const paneH = this.displayHeight / 2 - 10

    const offsetX = [-1, 1]
    const offsetY = [-1, 1]

    offsetX.forEach((ox) => {
      offsetY.forEach((oy) => {
        const rect = scene.add.rectangle(
          this.x + ox * paneW / 2,
          this.y + oy * paneH / 2,
          paneW,
          paneH,
          0xffff99,
          0.3 // alpha
        )
        rect.setOrigin(0.5)
        rect.setDepth(this.depth + 1)
      })
    })
  }
}
