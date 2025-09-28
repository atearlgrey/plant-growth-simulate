import Phaser from 'phaser'
import { arrangeItemsCenter, arrangeItemsLeft } from 'helpers/GraphicItemArrange'

import EventKeys from 'consts/EventKeys'
import TextureKeys from 'consts/TextureKeys'
import PlantType from 'consts/PlantType'
import FontKeys from 'consts/FontKeys'

export default class PlantMenu extends Phaser.GameObjects.Container {
  private leafIcons: Phaser.GameObjects.Image[] = []
  private itemContainers: Phaser.GameObjects.Container[] = []
  private panelWidth: number

  constructor(scene: Phaser.Scene, x: number, y: number, panelWidth: number) {
    super(scene, x, y)
    this.panelWidth = panelWidth

    // Title
    const title = scene.add.text(0, 0, 'Chọn cây', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: FontKeys.BoldType,
      fontFamily: FontKeys.TahomaFamily
    })
    this.add(title)

    const plants = [
      { key: TextureKeys.MorningGloryLeaf, type: PlantType.MorningGlory, label: 'Rau muống', width: 50, height: 55 },
      { key: TextureKeys.LettuceLeaf, type: PlantType.Lettuce, label: 'Rau cải', width: 50, height: 55 },
    ]

    plants.forEach((plant) => {
      // icon
      const leaf = scene.add.image(0, 0, plant.key).setOrigin(0.5).setScale(1).setDisplaySize(plant.width, plant.height).setInteractive()
      leaf.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDragLeaf(plant.key, plant.type, pointer)
      })

      // text ngay dưới icon
      const label = scene.add
        .text(0, 45, plant.label, {
          fontSize: '14px',
          color: '#fff',
          fontFamily: FontKeys.TahomaFamily
        })
        .setOrigin(0.5, 0)

      // gộp vào container
      const item = scene.add.container(0, 60, [leaf, label])
      this.add(item)

      this.itemContainers.push(item)
      this.leafIcons.push(leaf)
    })

    this.layout()
    scene.add.existing(this)
  }

  /** Sắp xếp icon + text căn giữa panelWidth */
  private layout() {
    arrangeItemsLeft(this.itemContainers, this.panelWidth, 60, 30)
  }

  /** Resize khi panel thay đổi */
  public resize(panelWidth: number) {
    this.panelWidth = panelWidth
    this.layout()
  }

  private startDragLeaf(textureKey: string, plantType: string, pointer: Phaser.Input.Pointer) {
    const scene = this.scene
    const leaf = scene.add.image(pointer.x, pointer.y, textureKey).setOrigin(0.5).setScale(0.12).setDepth(1000)

    const moveHandler = (p: Phaser.Input.Pointer) => {
      leaf.setPosition(p.x, p.y)
    }
    scene.input.on('pointermove', moveHandler)

    const upHandler = () => {
      scene.input.off('pointermove', moveHandler)
      scene.input.off('pointerup', upHandler)
      this.emit(EventKeys.LeafDrag, { leaf, plantType })
    }
    scene.input.once('pointerup', upHandler)
  }

  /** Enable/disable toàn bộ leaf icons */
  public setEnabled(enabled: boolean) {
    this.leafIcons.forEach((icon) => {
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
