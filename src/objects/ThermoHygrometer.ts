import Phaser from 'phaser';
import TextureKeys from 'consts/TextureKeys';

export default class ThermoHygrometer extends Phaser.GameObjects.Image {

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
  }
}
