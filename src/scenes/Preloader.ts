import Phaser from 'phaser'
import AnimationKeys from 'consts/AnimationKeys'
import SceneKeys from 'consts/SceneKeys'
import TextureKeys from 'consts/TextureKeys'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preloader)
    }

    preload() {
        this.load.image(TextureKeys.Background, 'house/background.png');
        this.load.image(TextureKeys.Table, 'assets/table.png');
        this.load.image(TextureKeys.TimelineSlider, 'assets/timeline-slider1.png');
        this.load.image(TextureKeys.TimelineCoin, 'assets/timeline-coin.png');
        this.load.image(TextureKeys.TimelineStrawberry, 'assets/strawberry.png');
    }

    create() {
        this.scene.start(SceneKeys.Plant)
    }
}
