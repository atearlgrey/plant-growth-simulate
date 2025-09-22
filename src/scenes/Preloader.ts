import Phaser from 'phaser'
import AnimationKeys from 'consts/AnimationKeys'
import SceneKeys from 'consts/SceneKeys'
import TextureKeys from 'consts/TextureKeys'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preloader)
    }

    preload() {
        this.load.image(TextureKeys.BackgroundRoom, 'assets/background-room.png');

        this.load.image(TextureKeys.Window, 'assets/window.png');
        this.load.image(TextureKeys.LampBulb, 'assets/lightled.png');

        this.load.image(TextureKeys.TimelineSlider, 'assets/timeline-slider.png');
        this.load.image(TextureKeys.TimelineCoin, 'assets/timeline-coin.png');
        this.load.image(TextureKeys.Table, 'assets/table.png');
        this.load.image(TextureKeys.PlantPot, 'assets/plant-pot.png');

        this.load.image(TextureKeys.MorningGloryLeaf, 'assets/morning-glory-leaf.png');
        this.load.image(TextureKeys.LettuceLeaf, 'assets/lettuce-leaf.png');

        this.load.image(TextureKeys.DefaultMorningGloryLeaf, 'assets/morning-glory-leaf.png');
        this.load.image(TextureKeys.DefaultLettuceLeaf, 'assets/lettuce-leaf.png');
    }

    create() {
        this.scene.start(SceneKeys.Plant)
    }
}
