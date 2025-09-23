import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import EventKeys from 'consts/EventKeys'

export default class Pot extends Phaser.GameObjects.Image {
  private currentPlantType: string | null = null

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.PlantPot)

    this.setOrigin(0.5).setDisplaySize(120, 140).setName(TextureKeys.PlantPot)
    scene.add.existing(this)
  }

  /** Kiểm tra lá có rơi vào chậu không, animate nếu trúng */
  public checkDrop(
    leaf: Phaser.GameObjects.Image,
    plantType: string,
    factor: number = 3,
    debug: boolean = false
  ) {
    // Oval bao quanh toàn bộ chậu
    const soilCenterX = this.x;
    const soilCenterY = this.y;
    const rx = (this.displayWidth / 2) * factor;
    const ry = (this.displayHeight / 2) * factor;

    // Debug ellipse
    if (debug) {
      const g = this.scene.add.graphics();
      g.lineStyle(2, 0x00ff00, 0.5);
      g.strokeEllipse(soilCenterX, soilCenterY, rx * 2, ry * 2);
      g.setDepth(1000);
      this.scene.time.delayedCall(500, () => g.destroy());
    }

    // Check ellipse
    const dx = (leaf.x - soilCenterX) / rx;
    const dy = (leaf.y - soilCenterY) / ry;
    const insideEllipse = dx * dx + dy * dy <= 1;

    if (insideEllipse) {
      this.currentPlantType = plantType;
      const soilPos = this.getSoilPosition(0.5);
      this.scene.tweens.add({
        targets: leaf,
        x: soilPos.x,
        y: soilPos.y, // Hoặc gọi getSoilPosition() nếu muốn đặt cây ở đất
        duration: 300,
        onComplete: () => {
          leaf.destroy();
          this.emit(EventKeys.PlantDrop, plantType);
        }
      });
    } else {
      this.scene.tweens.add({
        targets: leaf,
        alpha: 0,
        duration: 200,
        onComplete: () => leaf.destroy()
      });
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

  /** Lấy vị trí đất trong chậu để đặt gốc cây */
  public getSoilPosition(fraction: number = 0.25): { x: number; y: number } {
    const soilDepth = this.displayHeight * fraction;
    return {
      x: this.x,
      y: this.y - this.displayHeight / 2 + soilDepth / 2
    };
  }
}
