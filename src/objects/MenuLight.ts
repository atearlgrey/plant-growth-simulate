import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import FontKeys from 'consts/FontKeys'

export default class LightMenu extends Phaser.GameObjects.Container {
  private lightButtons: { [key: string]: Phaser.GameObjects.Graphics } = {}
  private currentMode: string | undefined

  constructor(scene: Phaser.Scene, x: number, y: number, defaultMode: string | undefined = undefined) {
    super(scene, x, y)

    this.add(scene.add.text(0, 0, 'Ánh sáng', { fontSize: '20px', color: '#fff', fontStyle: FontKeys.BoldType, fontFamily: FontKeys.TahomaFamily }))

    this.createRadioButton(0, 35, 'Tự nhiên')
    this.createRadioButton(0, 65, 'Đèn led')
    this.createRadioButton(0, 95, 'Hỗn hợp')

    scene.add.existing(this)

    // chọn mặc định khi load
    this.selectLight(defaultMode)

    // Chọn màu và độ dày của nét vẽ
    const graphics2 = this.scene.add.graphics();
    graphics2.lineStyle(4, 0x0639c4ff, 1); // (độ dày, màu, alpha)
    graphics2.beginPath();
    graphics2.moveTo(1625, y + 35);
    graphics2.lineTo(1905, y + 35);  // điểm kết thúc (x2, y2)
    graphics2.strokePath();      // vẽ đường

    graphics2.lineStyle(4, 0x0639c4ff, 1); // (độ dày, màu, alpha)
    graphics2.beginPath();
    graphics2.moveTo(1625, y + 180);
    graphics2.lineTo(1905, y + 180);  // điểm kết thúc (x2, y2)
    graphics2.strokePath();      // vẽ đường
  }

  private createRadioButton(x: number, y: number, label: string) {
    const g = this.scene.add.graphics()
    g.setInteractive(new Phaser.Geom.Rectangle(x, y, 15, 15), Phaser.Geom.Rectangle.Contains)

    // vẽ ban đầu
    g.fillStyle(0x0077cc, 1)
    g.fillRoundedRect(x, y, 15, 15, 8)

    const text = this.scene.add.text(x + 30, y + 6, label, {
      fontSize: '14px',
      color: '#fff', 
      fontFamily: FontKeys.TahomaFamily
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
      g.fillRoundedRect(g.input?.hitArea.x ?? 0, g.input?.hitArea.y ?? 0, 15, 15, 8)
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

