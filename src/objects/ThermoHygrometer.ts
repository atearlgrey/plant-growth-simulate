import Phaser from 'phaser';
import TextureKeys from 'consts/TextureKeys';

export default class ThermoHygrometer extends Phaser.GameObjects.Image {
  private isPointerOver: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y, '');

    this.setTexture(TextureKeys.ThermoHygrometer);
    this.setDisplaySize(width, height);
    this.setDepth(1000);
    this.setInteractive();

    scene.add.existing(this);
    scene.input.setDraggable(this);
    this.setVisible(false);

    // Bắt sự kiện chuột vào/ra
    this.on('pointerover', () => {
      this.isPointerOver = true;
    });

    this.on('pointerout', () => {
      this.isPointerOver = false;
    });

    // Lắng nghe lăn chuột
    scene.input.on('wheel', (_pointer: any, _gameObjects: any, _dx: number, dy: number) => {
      if (!this.isPointerOver) return; // chỉ zoom khi trỏ lên đối tượng này

      var minHeigh = 100;
      var maxHeigh = 1000;

      if (dy > 0) {
        if (this.displayHeight > minHeigh) this.setScale(this.scale * 0.9); // zoom out
      } else {
        if (this.displayHeight < maxHeigh) this.setScale(this.scale * 1.1); // zoom in
      }
    });
  }
}
