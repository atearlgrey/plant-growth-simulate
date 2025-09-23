import Phaser from 'phaser'

import EventKeys from 'consts/EventKeys'

import Panel from './Panel'
import PlantMenu from './MenuPlant'
import LightMenu from './MenuLight'

export default class RightMenu extends Phaser.GameObjects.Container {
  private plantMenu!: PlantMenu;
  private lightMenu!: LightMenu;

  constructor(scene: Phaser.Scene, x: number, y: number, defaultLightMode: string | undefined = undefined) {
    super(scene, x, y)

    // Panel nền
    const bg = new Panel(scene, 0, 0, 300, 500, 15);
    this.add(bg);

    // Menu plant
    this.plantMenu = new PlantMenu(scene, 10, 10);
    this.add(this.plantMenu);
    this.plantMenu.on(EventKeys.LeafDrag, (data) => this.emit(EventKeys.LeafDrag, data));

    // Menu light
    this.lightMenu = new LightMenu(scene, 10, 140, defaultLightMode);
    this.add(this.lightMenu);
    this.lightMenu.on(EventKeys.LightChange, (mode) => this.emit(EventKeys.LightChange, mode));

    scene.add.existing(this);

    // listen global enable/disable
    scene.events.on(EventKeys.DisableItems, () => this.setEnabled(false))
    scene.events.on(EventKeys.EnableItems, () => this.setEnabled(true))
  }

  /** Enable/disable cả PlantMenu và LightMenu */
  public setEnabled(enabled: boolean) {
    this.plantMenu.setEnabled(enabled);
    this.lightMenu.setEnabled(enabled);
  }
}
