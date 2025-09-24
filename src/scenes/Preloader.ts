import Phaser from 'phaser'
import AnimationKeys from 'consts/AnimationKeys'
import SceneKeys from 'consts/SceneKeys'
import TextureKeys from 'consts/TextureKeys'
import VoiceKeys from 'consts/VoiceKeys'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preloader)
    }

    preload() {
        this.load.image(TextureKeys.BackgroundRoom, 'assets/background-room.png');

        // load button
        this.load.image(TextureKeys.ButtonStart, 'assets/btn-start.png');
        this.load.image(TextureKeys.ButtonStop, 'assets/btn-paused.png');
        this.load.image(TextureKeys.ButtonResume, 'assets/btn-resume.png');
        this.load.image(TextureKeys.ButtonReset, 'assets/btn-reset.png');
        this.load.image(TextureKeys.ButtonResult, 'assets/btn-result.png');
        this.load.image(TextureKeys.ButtonConclusion, 'assets/btn-conclusion.png');
        this.load.image(TextureKeys.ButtonComplete, 'assets/btn-complete.png');
        this.load.image(TextureKeys.ButtonSound, 'assets/btn-sound.png');
        this.load.image(TextureKeys.ButtonMute, 'assets/btn-mute.png');

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

        // voice
        this.load.audio(VoiceKeys.BGM, 'assets/voice/bgm/bgm.mp3');
        this.load.audio(VoiceKeys.ButtonSelect, 'assets/voice/se/select.mp3');
        this.load.audio(VoiceKeys.Start, 'assets/voice/se/start.mp3');
        this.load.audio(VoiceKeys.Complete, 'assets/voice/se/complete.mp3');
        this.load.audio(VoiceKeys.Plant, 'assets/voice/se/plant.mp3');
        this.load.audio(VoiceKeys.Grow, 'assets/voice/se/grow.mp3');
    }

    create() {
        this.scene.start(SceneKeys.Plant)
    }
}
