import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import LightType from 'consts/LightType'

export default class Lamp extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.LightOff)

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

  /** Ánh sáng LED từ đèn trần xuống mặt bàn */
  public drawLedLight(
    scene: Phaser.Scene,
    ceilingX: number,
    ceilingY: number,
    left: { x: number; y: number },
    right: { x: number; y: number },
    topY: number
  ) {
    const g = scene.add.graphics();
    g.fillStyle(0x99ccff, 0.5);

    g.beginPath();
    g.moveTo(ceilingX - 40, ceilingY);
    g.lineTo(ceilingX + 40, ceilingY);
    g.lineTo(right.x, topY);
    g.lineTo(left.x, topY);
    g.closePath();
    g.fillPath();

    g.setDepth(1);
    return g;
  }

  /** Highlight 4 ô kính bằng overlay màu vàng nhạt */
  public setLightMode(lightType: LightType) {
    if (lightType === LightType.Led || lightType === LightType.Mixed) {
      this.setTexture(TextureKeys.LightOn)
    } else {
      this.setTexture(TextureKeys.LightOff)
    }
  }
}
