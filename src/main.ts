import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import PlantScene from './scenes/PlantScene'
import ResultScene from './scenes/ResultScene';
import ConclusionScene from "./scenes/ConclusionScene";

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
	parent: 'game',
	dom: { createContainer: true },
	scene:  [Preloader, PlantScene,ResultScene, ConclusionScene]
}

export default new Phaser.Game(config)
