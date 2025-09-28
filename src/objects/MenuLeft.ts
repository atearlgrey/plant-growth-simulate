import Phaser from 'phaser'
import EventKeys from 'consts/EventKeys'
import StateKeys from 'consts/AppStates'
import AppStates from 'consts/AppStates'
import TextureKeys from 'consts/TextureKeys'

export default class LeftMenu extends Phaser.GameObjects.Container {
  private mainButton!: Phaser.GameObjects.Image
  private resetButton!: Phaser.GameObjects.Image
  private resultButton!: Phaser.GameObjects.Image
  private conclusionButton!: Phaser.GameObjects.Image
  private zoomButton!: Phaser.GameObjects.Image
  private soundButton!: Phaser.GameObjects.Image
  private meterButton!: Phaser.GameObjects.Image

  private currentState: StateKeys = StateKeys.Initial
  private currentSoundOn: boolean = true
  private currentMeterOn: boolean = false
  private currentZoomOn: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    const btnSize = Math.min(this.scene.scale.width, this.scene.scale.height) * 0.1

    console.log('LeftMenu init at', x, y, ' with button size:', btnSize, btnSize)

    // === Main Button (Start/Stop/Resume) ===
    this.mainButton = this.scene.add.image(0, 0, TextureKeys.ButtonStart).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.mainButton])
    this.mainButton.on('pointerdown', () => this.handleMainButton())
    this.enableButton(this.mainButton, false);

    // === Reset ===
    this.resetButton = this.scene.add.image(0, 100, TextureKeys.ButtonReset).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.resetButton])
    this.resetButton.on('pointerdown', () => this.emit(EventKeys.Reset))

    // === Result ===
    this.resultButton = this.scene.add.image(0, 200, TextureKeys.ButtonResult).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.resultButton])
    this.resultButton.on('pointerdown', () => this.emit(EventKeys.Result))

    // === Conclusion ===
    this.conclusionButton = this.scene.add.image(0, 300, TextureKeys.ButtonConclusion).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.conclusionButton])
    this.conclusionButton.on('pointerdown', () => this.emit(EventKeys.Conclusion))

    // === zoom ===
    this.zoomButton = this.scene.add.image(0, 400, TextureKeys.ButtonUnZoom).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.zoomButton])
    this.zoomButton.on('pointerdown', () => this.handleZoomButton())

    // === Sound ===
    this.soundButton = this.scene.add.image(0, 500, TextureKeys.ButtonSound).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.soundButton])
    this.soundButton.on('pointerdown', () => this.handleSoundButton())

    // === Meter ===
    this.meterButton = this.scene.add.image(0, 600, TextureKeys.ButtonUnMeter).setDisplaySize(btnSize, btnSize).setInteractive({ useHandCursor: true });
    this.add([this.meterButton])
    this.meterButton.on('pointerdown', () => this.handleMeterButton())

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

  /** Xử lý toggle nút zoom */
  private handleZoomButton() {
    if (this.currentZoomOn === true) {
      this.currentZoomOn = false;
      this.zoomButton.setTexture(TextureKeys.ButtonUnZoom)
      this.emit(EventKeys.UnZoom)
    } else {
      this.currentZoomOn = true;
      this.zoomButton.setTexture(TextureKeys.ButtonZoom)
      this.emit(EventKeys.Zoom)
    }
  }

  /** Xử lý toggle nút sound */
  private handleSoundButton() {
    if (this.currentSoundOn === true) {
      this.currentSoundOn = false;
      this.soundButton.setTexture(TextureKeys.ButtonMute)
      this.emit(EventKeys.Mute)
    } else {
      this.currentSoundOn = true;
      this.soundButton.setTexture(TextureKeys.ButtonSound)
      this.emit(EventKeys.UnMute)
    }
  }

  /** Xử lý toggle nút meter */
  private handleMeterButton() {
    if (this.currentMeterOn === true) {
      this.currentMeterOn = false;
      this.meterButton.setTexture(TextureKeys.ButtonUnMeter)
      this.emit(EventKeys.UnMeterOn)
    } else {
      this.currentMeterOn = true;
      this.meterButton.setTexture(TextureKeys.ButtonMeter)
      this.emit(EventKeys.MeterOn)
    }
  }

  /** Cập nhật giao diện theo state */
  private updateUI() {
    switch (this.currentState) {
      case AppStates.Initial:
        this.mainButton.setTexture(TextureKeys.ButtonStart)
        this.enableButton(this.mainButton, false)
        this.enableButton(this.resetButton, true)
        this.enableButton(this.resultButton, false)
        this.enableButton(this.conclusionButton, false)
        break

      case AppStates.Running:
        this.mainButton.setTexture(TextureKeys.ButtonStop)
        this.enableButton(this.mainButton, true)
        this.enableButton(this.resetButton, false)
        this.enableButton(this.resultButton, false)
        this.enableButton(this.conclusionButton, false)
        break

      case AppStates.Paused:
        this.mainButton.setTexture(TextureKeys.ButtonResume)
        this.enableButton(this.mainButton, true)
        this.enableButton(this.resetButton, true)
        this.enableButton(this.resultButton, false)
        this.enableButton(this.conclusionButton, false)
        break

      case AppStates.Complete:
        this.mainButton.setTexture(TextureKeys.ButtonStart)
        this.enableButton(this.mainButton, true)
        this.enableButton(this.resetButton, true)
        this.enableButton(this.resultButton, true)
        this.enableButton(this.conclusionButton, true)
        break
    }
  }

  /** Enable/disable circle button */
  private enableButton(circle: Phaser.GameObjects.Image, enabled: boolean) {
    if (enabled) {
      circle.setInteractive()
      circle.setAlpha(1)
    } else {
      circle.disableInteractive()
      circle.setAlpha(0.5)
    }
  }

  /** Set state từ bên ngoài */
  public setCurrentState(newState: StateKeys) {
    if (this.currentState === newState) return
    if (newState === AppStates.Complete && this.currentState !== AppStates.Running) {
      console.warn('Chỉ có thể chuyển sang Complete từ trạng thái Running')
      return
    }
    this.currentState = newState
    this.updateUI()
  }

  public enableStartButton() {
    this.enableButton(this.mainButton, true);
  }
}
