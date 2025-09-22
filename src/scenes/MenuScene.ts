import Phaser from 'phaser'
import TimelineSlider from '../objects/TimelineSlider'

export default class MenuScene extends Phaser.Scene {
  private slider!: TimelineSlider

  constructor() {
    super('MenuScene')
  }

  create() {
    const { width, height } = this.scale

    // ===== PANEL TRÁI =====
    const leftX = 50
    let leftY = 100

    this.createCircleButton(leftX, leftY, 'Pause', () => this.events.emit('pause-toggle'))
    leftY += 80
    this.createCircleButton(leftX, leftY, 'Reset', () => this.events.emit('reset'))
    leftY += 80
    this.createCircleButton(leftX, leftY, 'Kết quả', () => this.events.emit('show-result'))
    leftY += 80
    this.createCircleButton(leftX, leftY, 'Kết luận', () => this.events.emit('show-conclusion'))

    // ===== PANEL PHẢI =====
    const rightX = width - 220
    let rightY = 50

    // Chọn cây
    this.add.text(rightX, rightY, 'Chọn cây', { fontSize: '16px', color: '#fff' })
    rightY += 25
    ;['morning_glory', 'lettuce'].forEach((p, i) => {
      this.createButton(rightX, rightY + i * 30, p, () => this.events.emit('select-plant', p))
    })

    rightY += 80
    // Chọn ánh sáng
    this.add.text(rightX, rightY, 'Ánh sáng', { fontSize: '16px', color: '#fff' })
    rightY += 25
    ;['sun', 'led', 'mixed'].forEach((mode, i) => {
      this.createButton(rightX, rightY + i * 30, mode, () => this.events.emit('select-light', mode))
    })

    // Placeholder cho các config khác
    rightY += 120
    this.add.text(rightX, rightY, 'Nhiệt độ, độ ẩm\n(Tùy chỉnh sau)', { fontSize: '12px', color: '#aaa' })

    // ===== TIMELINE SLIDER =====
    this.slider = new TimelineSlider(this, width / 2 - 200, height - 60, 450, 4)
    this.add.existing(this.slider)

    // Khi kéo slider → set-week
    this.slider.onWeekChanged((week) => {
      this.events.emit('set-week', week)
    })

    // Khi PlantScene đổi tuần → sync slider
    this.events.on('set-week', (week: number) => {
      this.slider.setWeek(week)
    })
  }

  private createButton(x: number, y: number, label: string, callback: () => void) {
    const rect = this.add.rectangle(x, y, 180, 25, 0x0077cc).setOrigin(0, 0).setInteractive()
    this.add.text(x + 90, y + 12, label, { fontSize: '14px', color: '#fff' }).setOrigin(0.5)
    rect.on('pointerdown', callback)
  }

  private createCircleButton(x: number, y: number, label: string, callback: () => void) {
    const circle = this.add.circle(x, y, 25, 0x0077cc).setInteractive()
    this.add.text(x, y, label, { fontSize: '12px', color: '#fff', align: 'center' }).setOrigin(0.5)
    circle.on('pointerdown', callback)
  }
}
