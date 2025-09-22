import Phaser from 'phaser'

export default class LeftMenu extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.createCircleButton(0, 0, 'Pause', () => this.emit('pause'))
    this.createCircleButton(0, 80, 'Reset', () => this.emit('reset'))
    this.createCircleButton(0, 160, 'Kết quả', () => this.emit('result'))
    this.createCircleButton(0, 240, 'Kết luận', () => this.emit('conclusion'))

    scene.add.existing(this)
  }

  private createCircleButton(
    x: number,
    y: number,
    label: string,
    callback: () => void
  ) {
    const circle = this.scene.add.circle(x, y, 25, 0x0077cc).setInteractive()
    const text = this.scene.add
      .text(x, y, label, { fontSize: '12px', color: '#fff' })
      .setOrigin(0.5)

    this.add([circle, text])

    circle.on('pointerdown', callback)
  }
}
