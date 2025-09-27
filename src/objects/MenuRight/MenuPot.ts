import Phaser from 'phaser'
import { arrangeItemsCenter } from 'helpers/GraphicItemArrange'

import EventKeys from 'consts/EventKeys'
import TextureKeys from 'consts/TextureKeys'
import FontKeys from 'consts/FontKeys'

import PlantType from 'consts/PlantType'
import PotType from 'consts/PotType'

export default class PotMenu extends Phaser.GameObjects.Container {
  private potIcons: Phaser.GameObjects.Image[] = []
  private itemContainers: Phaser.GameObjects.Container[] = []
  private panelWidth: number

  constructor(scene: Phaser.Scene, x: number, y: number, panelWidth: number) {
    super(scene, x, y)
    this.panelWidth = panelWidth

    // Title
    const title = scene.add.text(0, 0, 'Chọn loại chậu', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: FontKeys.BoldType,
      fontFamily: FontKeys.TahomaFamily,
    })
    this.add(title)

    const pots = [
      { key: TextureKeys.SmallPot, type: PotType.SmallPot, label: 'Chậu nhỏ' },
      { key: TextureKeys.MediumPot, type: PotType.MediumPot, label: 'Chậu vừa' },
      { key: TextureKeys.LargePot, type: PotType.LargePot, label: 'Chậu to' },
    ]

    pots.forEach((pot, index) => {
      const scale = 0.1 + index * 0.03
      const icon = scene.add.image(0, 0, pot.key)
                            .setOrigin(0.5)
                            .setScale(scale)
                            .setInteractive({ draggable: true })
                            .setName(pot.type);

      icon.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDragIcon(pot.key, pot.type, pointer)
      })

      const label = scene.add
        .text(0, 45, pot.label, {
          fontSize: '14px',
          color: '#fff',
          fontFamily: FontKeys.TahomaFamily,
        })
        .setOrigin(0.5, 0)

      const item = scene.add.container(0, 60, [icon, label])
      this.add(item)

      this.itemContainers.push(item)
      this.potIcons.push(icon)
    })

    this.layout()
    scene.add.existing(this)
  }

  /** Sắp xếp các item trong menu */
  private layout() {
    arrangeItemsCenter(this.itemContainers, this.panelWidth, 60, 10)
  }

  /** Resize khi panel thay đổi */
  public resize(panelWidth: number) {
    this.panelWidth = panelWidth
    this.layout()
  }

  private startDragIcon(textureKey: string, potType: string, pointer: Phaser.Input.Pointer) {
    const scene = this.scene
    const icon = scene.add.image(pointer.x, pointer.y, textureKey).setOrigin(0.5).setScale(0.12).setDepth(1000)

    const moveHandler = (p: Phaser.Input.Pointer) => {
      icon.setPosition(p.x, p.y)
    }
    scene.input.on('pointermove', moveHandler)

    const upHandler = () => {
      scene.input.off('pointermove', moveHandler)
      scene.input.off('pointerup', upHandler)
      this.emit(EventKeys.PotDrag, { pot: icon, plantType: potType })
    }
    scene.input.once('pointerup', upHandler)
  }

  /** Enable/disable toàn bộ icon */
  public setEnabled(enabled: boolean) {
    this.potIcons.forEach((icon) => {
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
