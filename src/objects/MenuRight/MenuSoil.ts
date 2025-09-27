import Phaser from 'phaser'
import { arrangeItemsCenter } from 'helpers/GraphicItemArrange'

import EventKeys from 'consts/EventKeys'
import TextureKeys from 'consts/TextureKeys'
import SoilType from 'consts/SoilType'
import FontKeys from 'consts/FontKeys'

export default class SoilMenu extends Phaser.GameObjects.Container {
  private soilIcons: Phaser.GameObjects.Image[] = []
  private itemContainers: Phaser.GameObjects.Container[] = []
  private panelWidth: number

  constructor(scene: Phaser.Scene, x: number, y: number, panelWidth: number) {
    super(scene, x, y)
    this.panelWidth = panelWidth

    const title = scene.add.text(0, 0, 'Chọn loại đất', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: FontKeys.BoldType,
      fontFamily: FontKeys.TahomaFamily
    })
    this.add(title)

    const soils = [
      { key: TextureKeys.GardenSoil, type: SoilType.GardenSoil, label: 'Đất vườn' },
      { key: TextureKeys.SandySoil, type: SoilType.SandySoil, label: 'Đất cát' },
      { key: TextureKeys.OrganicSoil, type: SoilType.OrganicSoil, label: 'Đất hữu cơ' }
    ]

    soils.forEach((soil) => {
      const soilObj = scene.add.image(0, 0, soil.key).setOrigin(0.5).setScale(0.17).setInteractive()
      soilObj.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDragSoil(soil.key, soil.type, pointer)
      })

      const label = scene.add
        .text(0, 45, soil.label, {
          fontSize: '14px',
          color: '#fff',
          fontFamily: FontKeys.TahomaFamily
        })
        .setOrigin(0.5, 0)

      const item = scene.add.container(0, 60, [soilObj, label])
      this.add(item)

      this.itemContainers.push(item)
      this.soilIcons.push(soilObj)
    })

    this.layout()
    scene.add.existing(this)
  }

  private layout() {
    arrangeItemsCenter(this.itemContainers, this.panelWidth, 60, 20)
  }

  public resize(panelWidth: number) {
    this.panelWidth = panelWidth
    this.layout()
  }

  private startDragSoil(textureKey: string, soilType: string, pointer: Phaser.Input.Pointer) {
    const scene = this.scene
    const soil = scene.add.image(pointer.x, pointer.y, textureKey).setOrigin(0.5).setScale(0.12).setDepth(1000)

    const moveHandler = (p: Phaser.Input.Pointer) => {
      soil.setPosition(p.x, p.y)
    }
    scene.input.on('pointermove', moveHandler)

    const upHandler = () => {
      scene.input.off('pointermove', moveHandler)
      scene.input.off('pointerup', upHandler)
      this.emit(EventKeys.SoilDrag, { soil, soilType })
    }
    scene.input.once('pointerup', upHandler)
  }

  public setEnabled(enabled: boolean) {
    this.soilIcons.forEach((icon) => {
      if (enabled) {
        icon.setInteractive()
        icon.setAlpha(1)
      } else {
        icon.disableInteractive()
        icon.setAlpha(0.5)
      }
    })
  }
}
