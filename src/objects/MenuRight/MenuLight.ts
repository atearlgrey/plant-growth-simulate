import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import FontKeys from 'consts/FontKeys'
import TextureKeys from 'consts/TextureKeys'
import LightType from 'consts/LightType'

export default class LightMenu extends Phaser.GameObjects.Container {
  private lightButtons: iRadioButton[] = []
  private currentMode: string | undefined
  private panelWidth: number
  private btnSize: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    defaultMode: string | undefined = undefined,
    panelWidth: number = 250,
    btnSize: number = 20
  ) {
    super(scene, x, y)
    this.panelWidth = panelWidth
    this.btnSize = btnSize

    // Title
    const title = scene.add.text(0, 0, 'Thiết lập ánh sáng', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: FontKeys.BoldType,
      fontFamily: FontKeys.TahomaFamily,
    })
    this.add(title)

    // tạo các options
    this.createRadioButton('Tự nhiên', LightType.Sun)
    this.createRadioButton('Đèn LED', LightType.Led)
    this.createRadioButton('Hỗn hợp', LightType.Mixed)

    this.layout()
    scene.add.existing(this)

    // chọn mặc định khi load
    this.selectLight(defaultMode)
  }

  private createRadioButton(label: string, value: string) {
    const g = this.scene.add.graphics()
    g.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.btnSize, this.btnSize), Phaser.Geom.Rectangle.Contains)

    const text = this.scene.add
      .text(this.btnSize + 10, this.btnSize / 2, label, {
        fontSize: '14px',
        color: '#fff',
        fontFamily: FontKeys.TahomaFamily,
      })
      .setOrigin(0, 0.5) // luôn căn giữa theo Y

    const container = this.scene.add.container(0, 0, [g, text])
    this.add(container)

    const pointerIcon = this.scene.add.image(-25, 8, TextureKeys.HandPointer) // icon bạn preload sẵn
      .setOrigin(0.5)
      .setScale(0.1)
      .setDisplaySize(32, 25)
      .setVisible(false) // ẩn mặc định

    container.add(pointerIcon)

    this.lightButtons.push({ container, g, text, value, pointerIcon })

    g.on('pointerdown', () => {
      this.selectLight(value)
    })
  }

  /** Sắp xếp radio button dọc, tự động */
  private layout() {
    let currentY = 40 // cách title
    const gap = 30
    const offsetX = 0

    this.lightButtons.forEach(({ container, g, value, pointerIcon }) => {
      container.setPosition(offsetX, currentY)

      // reset hình radio
      g.clear()
      g.fillStyle(value === this.currentMode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(0, 0, this.btnSize, this.btnSize, this.btnSize / 4)

      // hiện/ẩn icon pointer
      if (pointerIcon) {
        pointerIcon.setVisible(value === this.currentMode)
      }

      currentY += gap
    })
  }

  private selectLight(mode: string | undefined) {
    this.currentMode = mode

    this.lightButtons.forEach(({ g, value, pointerIcon }) => {
      g.clear()
      g.fillStyle(value === mode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(0, 0, this.btnSize, this.btnSize, this.btnSize / 4)

      // hiện/ẩn icon pointer
      if (pointerIcon) {
        pointerIcon.setVisible(value === mode)
      }
    })

    this.emit(EventKeys.LightChange, mode)
  }

  /** Đổi mode từ bên ngoài */
  public setLight(mode: string) {
    this.selectLight(mode)
  }

  public getLight(): string | undefined {
    return this.currentMode
  }

  public setEnabled(enabled: boolean) {
    this.lightButtons.forEach(({ g }) => {
      if (enabled) {
        g.setInteractive()
        g.setAlpha(1)
      } else {
        g.disableInteractive()
        g.setAlpha(0.5)
      }
    })
  }

  public resize(panelWidth: number) {
    this.panelWidth = panelWidth
    this.layout()
  }
}
