import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import StateKeys from 'consts/AppStates'
import AppStates from 'consts/AppStates'

export default class LeftMenu extends Phaser.GameObjects.Container {
  private mainButtonText!: Phaser.GameObjects.Text
  private mainButtonCircle!: Phaser.GameObjects.Arc
  private currentState: StateKeys = StateKeys.Initial;

  private resetButton!: Phaser.GameObjects.Arc
  private resultButton!: Phaser.GameObjects.Arc
  private conclusionButton!: Phaser.GameObjects.Arc

  private resetText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private conclusionText!: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // === Main Button (Start/Stop/Resume) ===
    this.mainButtonCircle = this.scene.add.circle(0, 0, 25, 0x28a745).setInteractive()
    this.mainButtonText = this.scene.add.text(0, 0, 'Start', { fontSize: '12px', color: '#fff' }).setOrigin(0.5)
    this.add([this.mainButtonCircle, this.mainButtonText])
    this.mainButtonCircle.on('pointerdown', () => this.handleMainButton())

    // === Reset ===
    this.resetButton = this.scene.add.circle(0, 80, 25, 0x0077cc).setInteractive()
    this.resetText = this.scene.add.text(0, 80, 'Reset', { fontSize: '12px', color: '#fff' }).setOrigin(0.5)
    this.add([this.resetButton, this.resetText])
    this.resetButton.on('pointerdown', () => this.emit(EventKeys.Reset))

    // === Result ===
    this.resultButton = this.scene.add.circle(0, 160, 25, 0x0077cc).setInteractive()
    this.resultText = this.scene.add.text(0, 160, 'Kết quả', { fontSize: '12px', color: '#fff' }).setOrigin(0.5)
    this.add([this.resultButton, this.resultText])
    this.resultButton.on('pointerdown', () => this.emit(EventKeys.Result))

    // === Conclusion ===
    this.conclusionButton = this.scene.add.circle(0, 240, 25, 0x0077cc).setInteractive()
    this.conclusionText = this.scene.add.text(0, 240, 'Kết luận', { fontSize: '12px', color: '#fff' }).setOrigin(0.5)
    this.add([this.conclusionButton, this.conclusionText])
    this.conclusionButton.on('pointerdown', () => this.emit(EventKeys.Conclusion))

    // === Conclusion ===
    const completeButton = this.scene.add.circle(0, 320, 25, 0x28a745).setInteractive()
    const completeText = this.scene.add.text(0, 320, 'Complete', { fontSize: '12px', color: '#fff' }).setOrigin(0.5)
    this.add([completeButton, completeText])
    completeButton.on('pointerdown', () => this.emit(EventKeys.Complete))

    scene.add.existing(this)

    // init state
    this.updateUI()
  }

  /** Xử lý toggle nút chính */
  private handleMainButton() {
    if (this.currentState === AppStates.Initial) {
      this.setCurrentState(AppStates.Running)
      this.emit(EventKeys.Start)
    } else if (this.currentState === AppStates.Running) {
      this.setCurrentState(AppStates.Paused)
      this.emit(EventKeys.Stop)
    } else if (this.currentState === AppStates.Paused) {
      this.setCurrentState(AppStates.Running)
      this.emit(EventKeys.Resume)
    } else if (this.currentState === AppStates.Complete) {
      this.setCurrentState(AppStates.Running)
      this.emit(EventKeys.Start)
    }
  }

  /** Set state từ bên ngoài (ví dụ: hoàn thành thí nghiệm) */
  public setCurrentState(newState: StateKeys) {
    if (this.currentState === newState) return;
    if (newState === AppStates.Complete && this.currentState !== AppStates.Running) {
      console.warn('Chỉ có thể chuyển sang Complete từ trạng thái Running')
      return;
    }
    this.currentState = newState
    this.updateUI()
  }

  /** Cập nhật giao diện theo state */
  private updateUI() {
    switch (this.currentState) {
      case AppStates.Initial:
        this.mainButtonText.setText('Start')
        this.mainButtonCircle.setFillStyle(0x28a745) // xanh
        this.enableButton(this.resetButton, this.resetText, true)
        this.enableButton(this.resultButton, this.resultText, false)
        this.enableButton(this.conclusionButton, this.conclusionText, false)
        break

      case AppStates.Running:
        this.mainButtonText.setText('Stop')
        this.mainButtonCircle.setFillStyle(0xdc3545) // đỏ
        this.enableButton(this.resetButton, this.resetText, false)
        this.enableButton(this.resultButton, this.resultText, false)
        this.enableButton(this.conclusionButton, this.conclusionText, false)
        break

      case AppStates.Paused:
        this.mainButtonText.setText('Resume')
        this.mainButtonCircle.setFillStyle(0xffc107) // vàng
        this.enableButton(this.resetButton, this.resetText, true)
        this.enableButton(this.resultButton, this.resultText, false)
        this.enableButton(this.conclusionButton, this.conclusionText, false)
        break

      case AppStates.Complete:
        this.mainButtonText.setText('Start')
        this.mainButtonCircle.setFillStyle(0x28a745) // xanh
        this.enableButton(this.resetButton, this.resetText, true)
        this.enableButton(this.resultButton, this.resultText, true)
        this.enableButton(this.conclusionButton, this.conclusionText, true)
        break
    }
  }

  /** Enable/disable circle button */
  private enableButton(circle: Phaser.GameObjects.Arc, text: Phaser.GameObjects.Text, enabled: boolean) {
    if (enabled) {
      circle.setInteractive()
      circle.setAlpha(1)
      text.setAlpha(1)
    } else {
      circle.disableInteractive()
      circle.setAlpha(0.5)
      text.setAlpha(0.5)
    }
  }
}
