import Phaser from 'phaser'
import Panel from './Panel'
import PlantMenu from './MenuPlant'
import LightMenu from './MenuLight'

export default class RightMenu extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // Panel nền
    const bg = new Panel(scene, 0, 0, 200, 250, 15)
    this.add(bg)

    // Menu plant
    const plantMenu = new PlantMenu(scene, 10, 10)
    this.add(plantMenu)
    plantMenu.on('leaf-drag', (data) => this.emit('leaf-drag', data))

    // Menu light
    const lightMenu = new LightMenu(scene, 10, 120)
    this.add(lightMenu)
    lightMenu.on('light', (mode) => this.emit('light', mode))

    scene.add.existing(this)
  }
}
