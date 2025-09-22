import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import PlantType from 'consts/PlantType'
import { arrangeItems } from 'helpers/GraphicItemArrange'

export default class PlantMenu extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.add(scene.add.text(0, 0, 'Chọn cây', { fontSize: '16px', color: '#fff' }))

    const plants = [
      { key: TextureKeys.MorningGloryLeaf, type: PlantType.MorningGlory },
      { key: TextureKeys.LettuceLeaf, type: PlantType.Lettuce }
    ]

    const leafIcons = plants.map((plant) => {
      const leaf = scene.add.image(0, 0, plant.key).setOrigin(0.5).setScale(0.05).setInteractive()
      leaf.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDragLeaf(plant.key, plant.type, pointer)
      })
      this.add(leaf)
      return leaf
    })

    // dùng helper để sắp xếp
    arrangeItems(leafIcons, 100, 60, 70)

    scene.add.existing(this)
  }

  private startDragLeaf(textureKey: string, plantType: string, pointer: Phaser.Input.Pointer) {
    const scene = this.scene
    const leaf = scene.add.image(pointer.x, pointer.y, textureKey).setOrigin(0.5).setScale(0.05)
    leaf.setDepth(1000)

    const moveHandler = (p: Phaser.Input.Pointer) => {
      leaf.setPosition(p.x, p.y)
    }
    scene.input.on('pointermove', moveHandler)

    scene.input.once('pointerup', () => {
      scene.input.off('pointermove', moveHandler)
      this.emit('leaf-drag', { leaf, plantType })
    })
  }
}
