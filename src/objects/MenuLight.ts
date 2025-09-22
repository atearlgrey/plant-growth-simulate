import Phaser from 'phaser'

export default class LightMenu extends Phaser.GameObjects.Container {
  private lightButtons: { [key: string]: Phaser.GameObjects.Rectangle } = {}

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.add(scene.add.text(0, 0, 'Ánh sáng', { fontSize: '16px', color: '#fff' }))

    this.createRadioButton(0, 25, 'sun')
    this.createRadioButton(0, 55, 'led')
    this.createRadioButton(0, 85, 'mixed')

    scene.add.existing(this)
  }

  private createRadioButton(x: number, y: number, label: string) {
    const rect = this.scene.add.rectangle(x, y, 20, 20, 0x0077cc).setOrigin(0, 0).setInteractive()
    const text = this.scene.add.text(x + 30, y + 10, label, { fontSize: '14px', color: '#fff' }).setOrigin(0, 0.5)

    this.add([rect, text])
    this.lightButtons[label] = rect

    rect.on('pointerdown', () => {
      this.selectLight(label)
    })
  }

  private selectLight(mode: string) {
    Object.keys(this.lightButtons).forEach((key) => {
      const rect = this.lightButtons[key]
      rect.setFillStyle(key === mode ? 0xffcc00 : 0x0077cc)
    })

    this.emit('light', mode)
  }
}
