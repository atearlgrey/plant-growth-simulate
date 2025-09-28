import Phaser from 'phaser'

import EventKeys from 'consts/EventKeys'

import Panel from '../Panel'
import DecorLine from '../DecorLine'
import PotMenu from './MenuPot'
import SoilMenu from './MenuSoil'
import PlantMenu from './MenuPlant'
import LightMenu from './MenuLight'
import WaterMenu from './MenuWater'

export default class RightMenu extends Phaser.GameObjects.Container {
  private potMenu!: PotMenu
  private soilMenu!: SoilMenu
  private plantMenu!: PlantMenu
  private lightMenu!: LightMenu
  private waterMenu!: WaterMenu
  private bg!: Panel

  // offset menu con
  private defaultLightMode: string
  private defaultWaterMode: string
  private readonly contentPadding = 10

  constructor(
    scene: Phaser.Scene,
    screenWidth: number,
    screenHeight: number,
    defaultLightMode: string,
    defaultWaterMode: string,
  ) {
    const marginRight = 20
    const marginTop = 50
    const decorLineHeight = 4
    const decorLineColor = 0x0639c4ff

    super(scene, screenWidth - 300 - marginRight, marginTop)
    this.defaultLightMode = defaultLightMode;
    this.defaultWaterMode = defaultWaterMode;

    // Panel nền
    this.bg = new Panel(scene, 0, 0, 300, 100, 15)
    this.add(this.bg)

    const contentWidth = this.getContentWidth()

    // Tạo các menu + line xen kẽ
    this.potMenu = new PotMenu(scene, 0, 0, contentWidth)
    const line1 = new DecorLine(scene, contentWidth, decorLineHeight, decorLineColor)
    this.soilMenu = new SoilMenu(scene, 0, 0, contentWidth)
    const line2 = new DecorLine(scene, contentWidth, decorLineHeight, decorLineColor)
    this.plantMenu = new PlantMenu(scene, 0, 0, contentWidth)
    const line3 = new DecorLine(scene, contentWidth, decorLineHeight, decorLineColor)
    this.lightMenu = new LightMenu(scene, 0, 0, defaultLightMode, contentWidth, 20)
    const line4 = new DecorLine(scene, contentWidth, decorLineHeight, decorLineColor)
    this.waterMenu = new WaterMenu(scene, 0, 0, defaultWaterMode, contentWidth, 20)

    // Relay events
    this.potMenu.on(EventKeys.PotDrag, (data) => this.emit(EventKeys.PotDrag, data))
    this.soilMenu.on(EventKeys.SoilDrag, (data) => this.emit(EventKeys.SoilDrag, data))
    this.plantMenu.on(EventKeys.LeafDrag, (data) => this.emit(EventKeys.LeafDrag, data))
    this.lightMenu.on(EventKeys.LightChange, (mode) => this.emit(EventKeys.LightChange, mode))
    this.waterMenu.on(EventKeys.WaterChange, (mode) => this.emit(EventKeys.WaterChange, mode));
    this.waterMenu.on(EventKeys.Watering, (mode) => this.emit(EventKeys.Watering, mode));

    // Add tất cả vào container chính
    this.add([
      this.potMenu,
      line1,
      this.soilMenu,
      line2,
      this.plantMenu,
      line3,
      this.lightMenu,
      line4,
      this.waterMenu,
    ])

    scene.add.existing(this)

    this.layoutSections()
    this.updateHeight()

    // listen global enable/disable
    scene.events.on(EventKeys.DisableItems, () => this.setEnabled(false))
    scene.events.on(EventKeys.EnableItems, () => this.setEnabled(true))
    scene.events.on(EventKeys.Reset, () => {
      this.lightMenu.setLight(this.defaultLightMode);
      this.waterMenu.setWater(this.defaultWaterMode);
    })
  }

  /** Lấy contentWidth (panelWidth - padding*2) */
  private getContentWidth(): number {
    return this.bg.getPanelWidth() - this.contentPadding * 2
  }

  /** Auto-stack menu + line theo chiều dọc */
  private layoutSections() {
    const sections = this.list.filter((c) => c !== this.bg)

    let currentY = 20
    const offsetX = this.contentPadding
    const gap = 30

    sections.forEach((item: any) => {
      item.setPosition(offsetX, currentY)
      const bounds = item.getBounds()
      currentY += bounds.height + gap
    })
  }

  public setEnabled(enabled: boolean) {
    this.potMenu.setEnabled(enabled)
    this.soilMenu.setEnabled(enabled)
    this.plantMenu.setEnabled(enabled)
    this.lightMenu.setEnabled(enabled)
    this.waterMenu.setEnabled(enabled)
  }

  /** Resize khi màn hình thay đổi */
  public resize(screenWidth: number, screenHeight: number) {
    const marginRight = 20
    const marginTop = 50

    this.setPosition(screenWidth - this.bg.getPanelWidth() - marginRight, marginTop)

    const newContentWidth = this.getContentWidth()

    // resize menu con
    this.potMenu.resize?.(newContentWidth)
    this.soilMenu.resize?.(newContentWidth)
    this.plantMenu.resize?.(newContentWidth)
    this.lightMenu.resize?.(newContentWidth)
    this.waterMenu.resize?.(newContentWidth)

    // resize line
    this.list.forEach((c) => {
      if (c instanceof DecorLine) {
        c.resize(newContentWidth)
      }
    })

    this.layoutSections()
    this.updateHeight()
  }

  /** Tính lại height panel theo children */
  private updateHeight() {
    const childrenBounds = this.list
      .filter((c) => c !== this.bg)
      .map((c: any) => c.getBounds())

    if (childrenBounds.length === 0) return

    const maxY = Math.max(...childrenBounds.map((b) => b.bottom))
    const padding = 10
    const newHeight = maxY + padding

    this.bg.resize(this.bg.getPanelWidth(), newHeight)
  }

  public getMenuWaterPositionY(): number {
    return this.waterMenu.y;
  }
}
