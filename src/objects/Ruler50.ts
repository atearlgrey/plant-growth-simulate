import Phaser from 'phaser';
import TextureKeys from 'consts/TextureKeys';

interface PlantConfig {
  leaves: number;
  height: number;
  width: number;
  heightPx: number;
  widthPx: number;
  image: string;
}

export default class Ruler50 extends Phaser.GameObjects.Image {

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(scene, x, y, '');

    this.setTexture(TextureKeys.Ruler50);
    this.setDisplaySize(width, height);
    this.setDepth(1000);
    this.setInteractive();

    scene.add.existing(this);
    scene.input.setDraggable(this);
    this.setVisible(false);
  }
}
