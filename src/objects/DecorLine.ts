import Phaser from 'phaser'

export default class DecorLine extends Phaser.GameObjects.Graphics {
  private lineWidth: number
  private thickness: number
  private color: number

  constructor(scene: Phaser.Scene, width: number = 250, thickness: number = 4, color: number = 0x0639c4ff) {
    super(scene)

    this.lineWidth = width
    this.thickness = thickness
    this.color = color

    this.redraw()
    scene.add.existing(this)
  }

  private redraw() {
    this.clear()
    this.lineStyle(this.thickness, this.color, 1)
    this.beginPath()
    this.moveTo(0, 0)              // local coords
    this.lineTo(this.lineWidth, 0) // vẽ ngang
    this.strokePath()
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(0, 0, this.lineWidth, this.thickness)
  }

  public resize(width: number) {
    this.lineWidth = width
    this.redraw()
  }
}
