import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'

export default class LightMenu extends Phaser.GameObjects.Container {
  private lightButtons: { [key: string]: Phaser.GameObjects.Graphics } = {}
  private currentMode: string | undefined

  constructor(scene: Phaser.Scene, x: number, y: number, defaultMode: string | undefined = undefined) {
    super(scene, x, y)

    this.add(scene.add.text(0, 0, 'Ánh sáng', { fontSize: '16px', color: '#fff' }))

    this.createRadioButton(0, 25, 'sun')
    this.createRadioButton(0, 55, 'led')
    this.createRadioButton(0, 85, 'mixed')

    scene.add.existing(this)

    // chọn mặc định khi load
    this.selectLight(defaultMode)
  }

  private createRadioButton(x: number, y: number, label: string) {
    const g = this.scene.add.graphics()
    g.setInteractive(new Phaser.Geom.Rectangle(x, y, 20, 20), Phaser.Geom.Rectangle.Contains)

    // vẽ ban đầu
    g.fillStyle(0x0077cc, 1)
    g.fillRoundedRect(x, y, 20, 20, 5)

    const text = this.scene.add.text(x + 30, y + 10, label, {
      fontSize: '14px',
      color: '#fff'
    }).setOrigin(0, 0.5)

    this.add([g, text])
    this.lightButtons[label] = g

    g.on('pointerdown', () => {
      this.selectLight(label)
    })
  }

  private selectLight(mode: string | undefined) {
    this.currentMode = mode

    Object.keys(this.lightButtons).forEach((key) => {
      const g = this.lightButtons[key]
      g.clear()
      g.fillStyle(key === mode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(g.input?.hitArea.x ?? 0, g.input?.hitArea.y ?? 0, 20, 20, 5)
    })

    this.emit(EventKeys.LightChange, mode)
  }

  /** Cho phép đổi mode từ bên ngoài bằng code */
  public setLight(mode: string) {
    this.selectLight(mode)
  }

  /** Lấy mode hiện tại */
  public getLight(): string | undefined {
    return this.currentMode
  }

  public setEnabled(enabled: boolean) {
    Object.keys(this.lightButtons).forEach(key => {
      const btn = this.lightButtons[key]
      if (enabled) {
        btn.setInteractive()
        btn.setAlpha(1)
      } else {
        btn.disableInteractive()
        btn.setAlpha(0.5)
      }
    })
  }
}

