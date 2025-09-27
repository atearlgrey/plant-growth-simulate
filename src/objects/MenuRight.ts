import Phaser from 'phaser'

import EventKeys from 'consts/EventKeys'

import Panel from './Panel'
import PlantMenu from './MenuPlant'
import LightMenu from './MenuLight'
import WaterMenu from './MenuWater'

export default class RightMenu extends Phaser.GameObjects.Container {
  private plantMenu!: PlantMenu
  private lightMenu!: LightMenu
  private waterMenu!: WaterMenu
  private bg!: Panel

  // offset menu con
  private readonly plantMenuOffset = { x: 10, y: 10 }
  private readonly lightMenuOffset = { x: 10, y: 140 }
  private readonly waterMenuOffset = { x: 10, y: 280 }

  constructor(
    scene: Phaser.Scene,
    screenWidth: number,
    screenHeight: number,
    defaultLightMode: string | undefined = undefined,
    defaultWaterMode: string | undefined = undefined,
  ) {
    const marginRight = 20
    const marginTop = 50
    super(scene, screenWidth - 300 - marginRight, marginTop)

    // Panel nền (chiều cao sẽ tính sau bằng updateHeight)
    this.bg = new Panel(scene, 0, 0, 300, 500, 15)
    this.add(this.bg)

    // Menu plant
    this.plantMenu = new PlantMenu(scene, this.plantMenuOffset.x, this.plantMenuOffset.y)
    this.add(this.plantMenu)
    this.plantMenu.on(EventKeys.LeafDrag, (data) => this.emit(EventKeys.LeafDrag, data));

    // Menu light
    this.lightMenu = new LightMenu(scene, this.lightMenuOffset.x, this.lightMenuOffset.y, defaultLightMode)
    this.add(this.lightMenu)
    this.lightMenu.on(EventKeys.LightChange, (mode) => this.emit(EventKeys.LightChange, mode));

    // Menu water
    this.waterMenu = new WaterMenu(scene, this.waterMenuOffset.x, this.waterMenuOffset.y, defaultWaterMode)
    this.add(this.waterMenu)
    this.waterMenu.on(EventKeys.WaterChange, (mode) => this.emit(EventKeys.WaterChange, mode));

    scene.add.existing(this)

    // Tính lại chiều cao panel theo menu con
    this.updateHeight()

    // listen global enable/disable
    scene.events.on(EventKeys.DisableItems, () => this.setEnabled(false))
    scene.events.on(EventKeys.EnableItems, () => this.setEnabled(true))
  }

  /** Enable/disable cả PlantMenu và LightMenu */
  public setEnabled(enabled: boolean) {
    this.plantMenu.setEnabled(enabled)
    this.lightMenu.setEnabled(enabled)
  }

  /** Resize menu khi màn hình thay đổi */
  public resize(screenWidth: number, screenHeight: number) {
    const marginRight = 20
    const marginTop = 50
    this.setPosition(screenWidth - this.bg.getPanelWidth() - marginRight, marginTop)

    // cập nhật lại chiều cao panel dựa vào menu con
    this.updateHeight()
  }

  /** Tính lại height của panel dựa trên tất cả children */
  private updateHeight() {
    const bounds = this.getBounds() // bao quanh tất cả children
    const padding = 10

    const newHeight = bounds.height + padding
    this.bg.resize(this.bg.getPanelWidth(), newHeight)
  }
}
