import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import FontKeys from 'consts/FontKeys'

interface RadioButton {
  g: Phaser.GameObjects.Graphics
  value: string
}

export default class WaterMenu extends Phaser.GameObjects.Container {
  private waterButtons: { [label: string]: RadioButton } = {}
  private currentMode: string | undefined

  constructor(scene: Phaser.Scene, x: number, y: number, defaultMode: string | undefined = undefined) {
    super(scene, x, y)

    this.add(
      scene.add.text(0, 0, 'Tần suất tới nước', {
        fontSize: '20px',
        color: '#fff',
        fontStyle: FontKeys.BoldType,
        fontFamily: FontKeys.TahomaFamily,
      })
    )

    // label (hiển thị), value (logic)
    this.createRadioButton(0, 35, 'Một tuần 1 lần', 'one')
    this.createRadioButton(0, 65, 'Một tuần 2 lần', 'two')
    this.createRadioButton(0, 95, 'Một tuần 3 lần', 'three')

    scene.add.existing(this)

    // chọn mặc định khi load
    this.selectWater(defaultMode)

    // đường kẻ trang trí
    const graphics2 = this.scene.add.graphics()
    graphics2.lineStyle(4, 0x0639c4ff, 1)
    graphics2.beginPath()
    graphics2.moveTo(1625, y + 180)
    graphics2.lineTo(1875, y + 180)
    graphics2.strokePath()
  }

  private createRadioButton(x: number, y: number, label: string, value: string) {
    const g = this.scene.add.graphics()
    g.setInteractive(new Phaser.Geom.Rectangle(x, y, 15, 15), Phaser.Geom.Rectangle.Contains)

    // vẽ ban đầu
    g.fillStyle(0x0077cc, 1)
    g.fillRoundedRect(x, y, 15, 15, 8)

    const text = this.scene.add.text(x + 30, y + 6, label, {
      fontSize: '14px',
      color: '#fff',
      fontFamily: FontKeys.TahomaFamily,
    }).setOrigin(0, 0.5)

    this.add([g, text])
    this.waterButtons[label] = { g, value }

    g.on('pointerdown', () => {
      this.selectWater(value)
    })
  }

  private selectWater(mode: string | undefined) {
    this.currentMode = mode

    Object.values(this.waterButtons).forEach(({ g, value }) => {
      g.clear()
      g.fillStyle(value === mode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(g.input?.hitArea.x ?? 0, g.input?.hitArea.y ?? 0, 15, 15, 8)
    })

    this.emit(EventKeys.WaterChange, mode)
  }

  /** Cho phép đổi mode từ bên ngoài bằng code */
  public setWater(mode: string) {
    this.selectWater(mode)
  }

  /** Lấy mode hiện tại */
  public getWater(): string | undefined {
    return this.currentMode
  }

  public setEnabled(enabled: boolean) {
    Object.values(this.waterButtons).forEach(({ g }) => {
      if (enabled) {
        g.setInteractive()
        g.setAlpha(1)
      } else {
        g.disableInteractive()
        g.setAlpha(0.5)
      }
    })
  }
}
