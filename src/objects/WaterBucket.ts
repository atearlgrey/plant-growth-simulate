import Phaser from 'phaser';
import TextureKeys from 'consts/TextureKeys';

export default class WaterBucket extends Phaser.GameObjects.Image {
  private isWatering = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y, '');

    scene.add.existing(this);
    this.setTexture(TextureKeys.BucketNoWater);
    this.setDepth(100);
    this.setDisplaySize(width, height);
    this.setVisible(false);
  }

  public wateringPlants(x1, y1, x2, y2) {
    if (this.isWatering) return;
    this.isWatering = true;

    var totalTime = 1500
    this.setPosition(x1, y1);
    this.setVisible(true);

    // Tạo tween di chuyển từ A tới B
    this.scene.tweens.add({
      targets: this,
      x: x2,
      y: y2,
      duration: totalTime * 2 / 5,
      ease: 'Linear',
      onComplete: () => {
        // Khi đến B thì đổi sang texture Tưới nước
        this.setTexture(TextureKeys.BucketWater);

        // Sau 1s lại đổi ngược thành texture ban đầu
        this.scene.time.delayedCall(totalTime * 2 / 5, () => {
          this.setTexture(TextureKeys.BucketNoWater);

          this.scene.time.delayedCall(totalTime * 1 / 5, () => {
            this.setVisible(false);
            this.isWatering = false;
          })
        });
      }
    });
  }
}
