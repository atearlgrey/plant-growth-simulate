import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import PlantScene from './scenes/PlantScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920,
	height: 1080,
	scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene:  [Preloader, PlantScene]
}

export default new Phaser.Game(config)
