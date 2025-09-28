import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import LightType from 'consts/LightType'

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

  /** Ánh sáng mặt trời từ cửa sổ xuống mặt bàn */
  public drawSunLightFromWindow(
    scene: Phaser.Scene,
    window: Window,
    left: { x: number; y: number },
    right: { x: number; y: number },
    topY: number
  ) {
    const { bottomLeft, bottomRight, topRight } = window.getCorners();
    const g = scene.add.graphics();
    g.fillStyle(0xffff99, 0.25);

    // ánh sáng phủ toàn bộ chiều ngang mặt bàn
    g.beginPath();
    g.moveTo(bottomRight.x, bottomRight.y);
    g.lineTo(topRight.x, topRight.y);
    g.lineTo(right.x - 55, topY - 90);
    g.lineTo(left.x, topY);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(bottomLeft.x, bottomLeft.y);
    g.lineTo(bottomRight.x, bottomRight.y);
    g.lineTo(left.x, topY);
    g.lineTo(left.x, topY);
    g.closePath();
    g.fillPath();

    g.setDepth(1);
    return g;
  }

  /** Highlight 4 ô kính bằng overlay màu vàng nhạt */
  public setLightMode(lightType: LightType) {
    if (lightType === LightType.Sun || lightType === LightType.Mixed) {
      this.setTexture(TextureKeys.WindowSun)
    } else {
      this.setTexture(TextureKeys.Window)
    }
  }
}
