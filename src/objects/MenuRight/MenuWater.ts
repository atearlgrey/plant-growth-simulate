import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import FontKeys from 'consts/FontKeys'
import TextureKeys from 'consts/TextureKeys'
import WaterType from 'consts/WaterType'

export default class WaterMenu extends Phaser.GameObjects.Container {
  private waterButtons: iRadioButton[] = []
  private currentMode: string | undefined
  private panelWidth: number
  private btnSize: number
  private gapY: number
  private wateringIcon: Phaser.GameObjects.Image | undefined

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

    const pointerIcon = this.scene.add.image(-25, 8, TextureKeys.HandPointer) // icon bạn preload sẵn
      .setOrigin(0.5)
      .setScale(0.1)
      .setDisplaySize(32, 25)
      .setVisible(false) // ẩn mặc định

    container.add(pointerIcon)

    // add icon manual watering
    if (iconWatering) {
      this.wateringIcon = this.scene.add.image(this.btnSize + text.displayWidth + 70, 0, TextureKeys.BucketNoWater);
      this.wateringIcon.setDisplaySize(this.btnSize * 5, this.btnSize * 5).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
      this.wateringIcon.disableInteractive().setAlpha(0.5);
      this.wateringIcon.on('pointerdown', () => {
        this.emit(EventKeys.Watering)
      })
      container.add(this.wateringIcon);
    }

    this.waterButtons.push({ container, g, text, value, pointerIcon })

    g.on('pointerdown', () => {
      this.selectWater(value)
    })
  }

  /** Sắp xếp radio button dọc */
  private layout() {
    let currentY = 40 // cách title
    const offsetX = 0 // căn trái, nếu muốn căn giữa thì chỉnh theo panelWidth

    this.waterButtons.forEach(({ container, g, value, pointerIcon }) => {
      container.setPosition(offsetX, currentY)

      g.clear()
      g.fillStyle(value === this.currentMode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(0, 0, this.btnSize, this.btnSize, this.btnSize / 4)

      // hiện/ẩn icon pointer
      if (pointerIcon) {
        pointerIcon.setVisible(value === this.currentMode)
      }

      currentY += this.gapY
    })
  }

  private selectWater(mode: string | undefined) {
    this.currentMode = mode

    if (this.currentMode === WaterType.Manual) {
      this.wateringIcon?.setInteractive()
      this.wateringIcon?.setAlpha(1)
    } else {
      this.wateringIcon?.disableInteractive()
      this.wateringIcon?.setAlpha(0.5)
    }

    this.waterButtons.forEach(({ g, value, pointerIcon }) => {
      g.clear()
      g.fillStyle(value === mode ? 0xffcc00 : 0x0077cc, 1)
      g.fillRoundedRect(0, 0, this.btnSize, this.btnSize, this.btnSize / 4)

      // hiện/ẩn icon pointer
      if (pointerIcon) {
        pointerIcon.setVisible(value === mode)
      }
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
    this.waterButtons.forEach(({ g }) => {
      if (enabled) {
        g.setInteractive()
        g.setAlpha(1)
      } else {
        g.disableInteractive()
        g.setAlpha(0.5)
      }
    })
  }

  /** Resize khi panelWidth thay đổi */
  public resize(panelWidth: number) {
    this.panelWidth = panelWidth
    this.layout()
  }
}
