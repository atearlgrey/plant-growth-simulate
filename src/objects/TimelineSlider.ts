import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'

export default class TimelineSlider extends Phaser.GameObjects.Container {
  private track: Phaser.GameObjects.Image
  private handle: Phaser.GameObjects.Image
  private minX: number
  private maxX: number
  private barWidth: number
  private totalWeeks: number
  private currentWeek: number = 0
  private changeCallback?: (week: number) => void

  constructor(scene: Phaser.Scene, screenWidth: number, screenHeight: number, totalWeeks = 4) {
    // Tính toán vị trí và kích thước
    const barWidth = screenWidth / 4
    const x = (screenWidth - barWidth) / 2
    const y = screenHeight - 60

    super(scene, x, y)

    this.barWidth = barWidth
    this.totalWeeks = totalWeeks

    // Track (thanh nền)
    this.track = scene.add.image(0, 0, TextureKeys.TimelineSlider).setOrigin(0, 0.5)
    this.track.setDisplaySize(barWidth, 40) // ép thanh đúng 1/4 màn hình
    this.add(this.track)

    this.minX = 0
    this.maxX = this.barWidth

    // Handle (coin/dâu tây)
    this.handle = scene.add.image(0, 0, TextureKeys.TimelineCoin).setOrigin(0.5).setScale(0.6)
    this.handle.setInteractive({ draggable: true })
    scene.input.setDraggable(this.handle)
    this.add(this.handle)

    // === Drag logic ===
    scene.input.on('drag', (pointer, gameObject) => {
      if (gameObject === this.handle) {
        const localX = pointer.worldX - this.x
        this.handle.x = Phaser.Math.Clamp(localX, this.minX, this.maxX)
      }
    })

    scene.input.on('dragend', (pointer, gameObject) => {
      if (gameObject === this.handle) {
        const percent = (this.handle.x - this.minX) / this.barWidth
        const week = Math.round(percent * this.totalWeeks)

        this.setWeek(week)

        if (this.changeCallback) {
          this.changeCallback(week)
        }
      }
    })

    // Tick label
    for (let i = 0; i <= totalWeeks; i++) {
      const tickX = (i / totalWeeks) * barWidth
      const tick = scene.add.text(tickX, 30, `${i} week`, {
        fontSize: '14px',
        color: '#000',
      }).setOrigin(0.5)
      this.add(tick)
    }

    scene.add.existing(this)
  }

  /** Set tuần từ bên ngoài (sync với PlantScene) */
  setWeek(week: number) {
    const targetX = (week / this.totalWeeks) * this.barWidth
    this.scene.tweens.add({
      targets: this.handle,
      x: targetX,
      duration: 200,
      ease: 'Sine.easeOut',
    })
    this.currentWeek = week
  }

  /** Đăng ký callback khi tuần thay đổi */
  onWeekChanged(callback: (week: number) => void) {
    this.changeCallback = callback
  }

  getWeek(): number {
    return this.currentWeek
  }
}
