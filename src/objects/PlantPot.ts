import Phaser from 'phaser'
import TextureKeys from 'consts/TextureKeys'
import EventKeys from 'consts/EventKeys'
import PotType from 'consts/PotType'
import PlantType from 'consts/PlantType'
import SoilType from 'consts/SoilType'

/** Config kích thước và origin theo loại pot */
const PotConfig: Record<PotType, { width: number; height: number; origin: number }> = {
  [PotType.SmallPot]: { width: 80, height: 100, origin: 0.2 },
  [PotType.MediumPot]: { width: 100, height: 120, origin: 0.3 },
  [PotType.LargePot]: { width: 120, height: 140, origin: 0.5 },
}

export default class Pot extends Phaser.GameObjects.Image {
  private potType: PotType
  private currentPlantType: PlantType | null = null
  private soilType: SoilType | null = null

  constructor(scene: Phaser.Scene, x: number, y: number, potType: PotType) {
    super(scene, x, y, TextureKeys.PotEmpty)
    this.potType = potType

    const cfg = PotConfig[potType]

    this.setOrigin(0.5, 1) // gốc ở đáy, chỉnh y theo origin
    this.setDisplaySize(cfg.width, cfg.height)
    this.setName(potType)

    scene.add.existing(this)
  }

  /** Set soil cho pot + đổi texture */
  public setSoil(soilType: SoilType) {
    this.soilType = soilType

    // đổi texture theo soilType
    switch (soilType) {
      case SoilType.GardenSoil:
        this.setTexture(TextureKeys.PotGardenSoil)
        break
      case SoilType.SandySoil:
        this.setTexture(TextureKeys.PotSandySoil)
        break
      case SoilType.OrganicSoil:
        this.setTexture(TextureKeys.PotOrganicSoil)
        break
      default:
        this.setTexture(TextureKeys.PotEmpty)
        break
    }
  }

  /** Kiểm tra drop object vào pot */
  public checkDrop(
    obj: Phaser.GameObjects.Image,
    kind: 'plant' | 'soil' | 'water',
    type: PlantType | SoilType,
    data?: any,
    factor: number = 3,
    debug: boolean = false
  ) {
    const cx = this.x
    const cy = this.y
    const rx = (this.displayWidth / 2) * factor
    const ry = (this.displayHeight / 2) * factor

    if (debug) {
      const g = this.scene.add.graphics()
      g.lineStyle(2, 0x00ff00, 0.5)
      g.strokeEllipse(cx, cy, rx * 2, ry * 2)
      g.setDepth(1000)
      this.scene.time.delayedCall(500, () => g.destroy())
    }

    const dx = (obj.x - cx) / rx
    const dy = (obj.y - cy) / ry
    const inside = dx * dx + dy * dy <= 1

    if (inside) {
      if (kind === 'soil') {
        this.setSoil(type as SoilType)
        this.emit(EventKeys.SoilDrop, this.soilType)
        obj.destroy()
      } else if (kind === 'plant' && this.soilType) {
        this.currentPlantType = type as PlantType
        const soilPos = this.getSoilPosition()
        this.scene.tweens.add({
          targets: obj,
          x: soilPos.x,
          y: soilPos.y,
          duration: 300,
          onComplete: () => {
            obj.destroy()
            this.emit(EventKeys.PlantDrop, this.currentPlantType)
          }
        })
      } else {
        obj.destroy()
      }
    } else {
      this.scene.tweens.add({
        targets: obj,
        alpha: 0,
        duration: 200,
        onComplete: () => obj.destroy()
      })
    }
  }

  public getPotType(): PotType {
    return this.potType
  }

  public getSoilType(): SoilType | null {
    return this.soilType
  }

  public getCurrentPlant(): PlantType | null {
    return this.currentPlantType
  }

  public clear() {
    this.currentPlantType = null
    this.soilType = null
    this.setTexture(TextureKeys.PotEmpty) // về lại chậu rỗng
  }

  public getSoilPosition(fraction: number = 0.55): { x: number; y: number } {
    const soilHeight = this.displayHeight * fraction
    const topSoilY = this.y - this.displayHeight
    return {
      x: this.x,
      y: topSoilY + soilHeight / 2
    }
  }
}
