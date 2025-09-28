import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import FontKeys from 'consts/FontKeys'
import TextureKeys from 'consts/TextureKeys'

interface RadioButton {
  container: Phaser.GameObjects.Container
  g: Phaser.GameObjects.Graphics
  text: Phaser.GameObjects.Text
  value: string,
  icon: Phaser.GameObjects.Image | null
}

export default class WaterMenu extends Phaser.GameObjects.Container {
  private waterButtons: RadioButton[] = []
  private currentMode: string | undefined
  private panelWidth: number
  private btnSize: number
  private gapY: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    defaultMode: string | undefined = undefined,
    panelWidth: number = 250,
    btnSize: number = 20,
    gapY: number = 30
  ) {
    super(scene, x, y)
    this.panelWidth = panelWidth
    this.btnSize = btnSize
    this.gapY = gapY

    // Title
    const title = scene.add.text(0, 0, 'Tần suất tưới nước', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: FontKeys.BoldType,
      fontFamily: FontKeys.TahomaFamily,
    })
    this.add(title)

    // Options
    this.createRadioButton('Tự động một tuần 1 lần', 'one')
    this.createRadioButton('Tự động một tuần 2 lần', 'two')
    this.createRadioButton('Tự động một tuần 3 lần', 'three')
    this.createRadioButton('Tưới nước thủ công', 'manual', true)

    this.layout()
    scene.add.existing(this)

    // Chọn mặc định khi load
    this.selectWater(defaultMode)
  }

  private createRadioButton(label: string, value: string, iconWatering: boolean = false) {
    const g = this.scene.add.graphics()
    g.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.btnSize, this.btnSize), Phaser.Geom.Rectangle.Contains)

    const text = this.scene.add
      .text(this.btnSize + 10, this.btnSize / 2, label, {
        fontSize: '14px',
        color: '#fff',
        fontFamily: FontKeys.TahomaFamily,
      })
      .setOrigin(0, 0.5)

    const container = this.scene.add.container(0, 0, [g, text])
    this.add(container)

    // add icon manual watering
    const icon = iconWatering ? this.scene.add.image(this.btnSize + text.displayWidth + 90, this.btnSize, TextureKeys.BucketNoWater) : null;
    icon?.setDisplaySize(this.btnSize * 5, this.btnSize * 5).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    icon?.on('pointerdown', () => this.emit(EventKeys.Watering))
    if (icon) container.add(icon);

    this.waterButtons.push({ container, g, text, value, icon })

    g.on('pointerdown', () => {
      this.selectWater(value)
    })
  }

  /** Sắp xếp radio button dọc */
  private layout() {
    let currentY = 40 // cách title
    const offsetX = 0 // căn trái, nếu muốn căn giữa thì chỉnh theo panelWidth

    this.waterButtons.forEach(({ container, g }) => {
      container.setPosition(offsetX, currentY)

      g.clear()
      g.fillStyle(0x0077cc, 1)
      g.fillRoundedRect(0, 0, this.btnSize, this.btnSize, this.btnSize / 4)

      currentY += this.gapY
    })
  }

  private selectWater(mode: string | undefined) {
    this.currentMode = mode

    this.waterButtons.forEach(({ g, value }) => {
      g.clear()
      g.fillStyle(value === mode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(0, 0, this.btnSize, this.btnSize, this.btnSize / 4)
    })

    this.emit(EventKeys.WaterChange, mode)
  }

  /** Đổi mode từ bên ngoài */
  public setWater(mode: string) {
    this.selectWater(mode)
  }

  /** Lấy mode hiện tại */
  public getWater(): string | undefined {
    return this.currentMode
  }

  public setEnabled(enabled: boolean) {
    this.waterButtons.forEach(({ g, icon }) => {
      if (enabled) {
        g.setInteractive()
        g.setAlpha(1)
        icon?.setInteractive()
        icon?.setAlpha(1)
      } else {
        g.disableInteractive()
        g.setAlpha(0.5)
        icon?.disableInteractive()
        icon?.setAlpha(0.5)
      }
    })
  }

  /** Resize khi panelWidth thay đổi */
  public resize(panelWidth: number) {
    this.panelWidth = panelWidth
    this.layout()
  }
}
