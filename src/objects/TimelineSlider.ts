import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import EventKeys from 'consts/EventKeys'

export default class TimelineSlider extends Phaser.GameObjects.Container {
  private track: Phaser.GameObjects.Image
  private handle: Phaser.GameObjects.Image
  private ticks: Phaser.GameObjects.Text[] = []
  private minX: number = 0
  private maxX: number = 0
  private barWidth: number
  private totalWeeks: number
  private currentWeek: number = 0
  private changeCallback?: (week: number) => void

  constructor(scene: Phaser.Scene, screenWidth: number, screenHeight: number, totalWeeks = 4) {
    const barWidth = screenWidth / 4
    const x = (screenWidth - barWidth) / 2
    const y = screenHeight - 60

    super(scene, x, y)

    this.barWidth = barWidth
    this.totalWeeks = totalWeeks

    // Track
    this.track = scene.add.image(0, 0, TextureKeys.TimelineSlider).setOrigin(0, 0.5)
    this.track.setDisplaySize(this.barWidth, 40)
    this.add(this.track)

    this.minX = 0
    this.maxX = this.barWidth

    // Handle
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

    // === Tick labels (tạo 1 lần duy nhất) ===
    for (let i = 0; i <= totalWeeks; i++) {
      const tickX = (i / totalWeeks) * this.barWidth
      const tick = scene.add.text(tickX, 30, `${i} week`, {
        fontSize: '14px',
        color: '#000',
      }).setOrigin(0.5)
      this.add(tick)
      this.ticks.push(tick)
    }

    scene.add.existing(this)

    // listen global enable/disable
    scene.events.on(EventKeys.DisableItems, () => this.setEnabled(false))
    scene.events.on(EventKeys.EnableItems, () => this.setEnabled(true))
  }

  /** Enable/disable toàn bộ slider */
  public setEnabled(enabled: boolean) {
    if (enabled) {
      this.track.setAlpha(1)
      this.handle.setInteractive()
      this.handle.setAlpha(1)
    } else {
      this.track.setAlpha(0.5)
      this.handle.disableInteractive()
      this.handle.setAlpha(0.8)
    }
  }

  /** Set tuần từ bên ngoài */
  public setWeek(week: number) {
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
  public onWeekChanged(callback: (week: number) => void) {
    this.changeCallback = callback
  }

  /** Lấy tuần hiện tại */
  public getWeek(): number {
    return this.currentWeek
  }

  /** Resize khi màn hình thay đổi */
  public resize(screenWidth: number, screenHeight: number) {
    this.barWidth = screenWidth / 4
    this.x = (screenWidth - this.barWidth) / 2
    this.y = screenHeight - 60

    // resize track
    this.track.setDisplaySize(this.barWidth, 40)
    this.maxX = this.barWidth

    // reposition ticks
    this.ticks.forEach((tick, i) => {
      const tickX = (i / this.totalWeeks) * this.barWidth
      tick.setX(tickX)
    })

    // giữ handle ở đúng tuần
    this.setWeek(this.currentWeek)
  }
}
