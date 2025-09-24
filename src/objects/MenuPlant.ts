import Phaser from 'phaser'

import { arrangeItems } from 'helpers/GraphicItemArrange'

import EventKeys from 'consts/EventKeys'
import TextureKeys from 'consts/TextureKeys'
import PlantType from 'consts/PlantType'
import FontKeys from 'consts/FontKeys'

export default class PlantMenu extends Phaser.GameObjects.Container {
  private leafIcons: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.add(scene.add.text(0, 0, 'Chọn cây', { fontSize: '20px', color: '#fff', fontStyle: FontKeys.BoldType, fontFamily: FontKeys.TahomaFamily }));
    this.add(scene.add.text(0, 85, 'Rau muống', { fontSize: '14px', color: '#fff', fontFamily: FontKeys.TahomaFamily }));
    this.add(scene.add.text(90, 85, 'Rau cải', { fontSize: '14px', color: '#fff', fontFamily: FontKeys.TahomaFamily }));

    const plants = [
      { key: TextureKeys.MorningGloryLeaf, type: PlantType.MorningGlory },
      { key: TextureKeys.LettuceLeaf, type: PlantType.Lettuce }
    ];

    this.leafIcons = plants.map((plant) => {
      const leaf = scene.add.image(0, 0, plant.key).setOrigin(0.5).setScale(0.12).setInteractive();
      leaf.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDragLeaf(plant.key, plant.type, pointer);
      })
      this.add(leaf);
      return leaf;
    })

    // dùng helper để sắp xếp
    arrangeItems(this.leafIcons, 70, 60, 70);

    scene.add.existing(this);
  }

  private startDragLeaf(textureKey: string, plantType: string, pointer: Phaser.Input.Pointer) {
    const scene = this.scene
    const leaf = scene.add.image(pointer.x, pointer.y, textureKey).setOrigin(0.5).setScale(0.12).setDepth(1000);

    const moveHandler = (p: Phaser.Input.Pointer) => {
      leaf.setPosition(p.x, p.y)
    }
    scene.input.on('pointermove', moveHandler)

    // khi nhả chuột ra
    const upHandler = () => {
      scene.input.off('pointermove', moveHandler);
      scene.input.off('pointerup', upHandler);
      this.emit(EventKeys.LeafDrag, { leaf, plantType });
    };
    scene.input.once('pointerup', upHandler);
  }

  /** Enable/disable toàn bộ leaf icons */
  public setEnabled(enabled: boolean) {
    this.leafIcons.forEach(icon => {
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
