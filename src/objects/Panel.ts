import Phaser from 'phaser'

export default class Panel extends Phaser.GameObjects.Container {
  private graphics!: Phaser.GameObjects.Graphics
  private panelWidth: number
  private panelHeight: number
  private radius: number

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, radius: number = 0) {
    super(scene, x, y)

    this.panelWidth = width
    this.panelHeight = height
    this.radius = radius

    this.graphics = scene.add.graphics()
    this.add(this.graphics)

    this.redraw()
    scene.add.existing(this)
  }

  /** Vẽ lại panel */
  private redraw() {
    this.graphics.clear()
    this.graphics.fillStyle(0x000000, 0.3) // ví dụ nền mờ
    this.graphics.fillRoundedRect(0, 0, this.panelWidth, this.panelHeight, this.radius)
  }

  /** Resize panel */
  public resize(width: number, height: number) {
    this.panelWidth = width
    this.panelHeight = height
    this.redraw()
  }

  /** Getter cho size panel */
  getPanelWidth() {
    return this.panelWidth
  }

  getPanelHeight() {
    return this.panelHeight
  }
}
