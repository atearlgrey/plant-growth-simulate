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
        // load background
        this.load.image(TextureKeys.BackgroundRoom, 'assets/background-room.png');

        // load button
        this.load.image(TextureKeys.ButtonStart, 'assets/btn-start.png');
        this.load.image(TextureKeys.ButtonStop, 'assets/btn-paused.png');
        this.load.image(TextureKeys.ButtonResume, 'assets/btn-resume.png');
        this.load.image(TextureKeys.ButtonReset, 'assets/btn-reset.png');
        this.load.image(TextureKeys.ButtonResult, 'assets/btn-result.png');
        this.load.image(TextureKeys.ButtonConclusion, 'assets/btn-conclusion.png');
        this.load.image(TextureKeys.ButtonComplete, 'assets/btn-complete.png');
        this.load.image(TextureKeys.ButtonZoom, 'assets/btn-unzoom.png');
        this.load.image(TextureKeys.ButtonUnZoom, 'assets/btn-zoom.png');
        this.load.image(TextureKeys.ButtonSound, 'assets/btn-sound.png');
        this.load.image(TextureKeys.ButtonMute, 'assets/btn-mute.png');
        this.load.image(TextureKeys.ButtonMeter, 'assets/btn-meter.png');
        this.load.image(TextureKeys.ButtonUnMeter, 'assets/btn-unmeter.png');

        this.load.image(TextureKeys.Window, 'assets/window.png');
        this.load.image(TextureKeys.WindowSun, 'assets/window-sun.png');

        this.load.image(TextureKeys.LightOn, 'assets/light-on.png');
        this.load.image(TextureKeys.LightOff, 'assets/light-off.png');

        this.load.image(TextureKeys.TimelineSlider, 'assets/timeline-slider.png');
        this.load.image(TextureKeys.TimelineCoin, 'assets/timeline-coin.png');
        this.load.image(TextureKeys.Table, 'assets/table.png');
        this.load.image(TextureKeys.PlantPot, 'assets/plant-pot.png');
        this.load.image(TextureKeys.ThermoHygrometer, 'assets/thermo-hygrometer.png');
        this.load.image(TextureKeys.Ruler50, 'assets/ruler-50cm.png');

        this.load.image(TextureKeys.PotEmpty, 'assets/pot-empty.png');
        this.load.image(TextureKeys.PotGardenSoil, 'assets/pot-garden-soil.png');
        this.load.image(TextureKeys.PotSandySoil, 'assets/pot-sandy-soil.png');
        this.load.image(TextureKeys.PotOrganicSoil, 'assets/pot-organic-soil.png');


        this.load.image(TextureKeys.MorningGloryLeaf, 'assets/morning-glory-leaf.png');
        this.load.image(TextureKeys.LettuceLeaf, 'assets/lettuce-leaf.png');
        this.load.image(TextureKeys.HandPointer, 'assets/hand-pointer.png');

        this.load.image(TextureKeys.DefaultMorningGloryLeaf, 'assets/morning-glory-leaf.png');
        this.load.image(TextureKeys.DefaultLettuceLeaf, 'assets/lettuce-leaf.png');

        this.load.image(TextureKeys.BucketNoWater, 'assets/watering_can_empty.png');
        this.load.image(TextureKeys.BucketWater, 'assets/watering_can_watering.png');
        
        // soil icons
        this.load.image(TextureKeys.GardenSoil, 'assets/right-menu/soil/garden-soil.png');
        this.load.image(TextureKeys.SandySoil, 'assets/right-menu/soil/sandy-soil.png');
        this.load.image(TextureKeys.OrganicSoil, 'assets/right-menu/soil/organic-soil.png');

        // pot icons
        this.load.image(TextureKeys.SmallPot, 'assets/right-menu/pot/small-pot.png');
        this.load.image(TextureKeys.MediumPot, 'assets/right-menu/pot/medium-pot.png');
        this.load.image(TextureKeys.LargePot, 'assets/right-menu/pot/large-pot.png');

        // voice
        this.load.audio(VoiceKeys.BGM, 'assets/voice/bgm/bgm.mp3');
        this.load.audio(VoiceKeys.ButtonSelect, 'assets/voice/se/select.mp3');
        this.load.audio(VoiceKeys.Start, 'assets/voice/se/start.mp3');
        this.load.audio(VoiceKeys.Complete, 'assets/voice/se/complete.mp3');
        this.load.audio(VoiceKeys.Plant, 'assets/voice/se/plant.mp3');
        this.load.audio(VoiceKeys.Grow, 'assets/voice/se/grow.mp3');

        // load image for plant
        this.load.image(TextureKeys.MorningGlorySunWeek0, 'assets/morning-glory/sun/week0.png');
        this.load.image(TextureKeys.MorningGlorySunWeek1, 'assets/morning-glory/sun/week1.png');
        this.load.image(TextureKeys.MorningGlorySunWeek2, 'assets/morning-glory/sun/week2.png');
        this.load.image(TextureKeys.MorningGlorySunWeek3, 'assets/morning-glory/sun/week3.png');
        this.load.image(TextureKeys.MorningGlorySunWeek4, 'assets/morning-glory/sun/week4.png');

        this.load.image(TextureKeys.MorningGloryLedWeek0, 'assets/morning-glory/led/week0.png');
        this.load.image(TextureKeys.MorningGloryLedWeek1, 'assets/morning-glory/led/week1.png');
        this.load.image(TextureKeys.MorningGloryLedWeek2, 'assets/morning-glory/led/week2.png');
        this.load.image(TextureKeys.MorningGloryLedWeek3, 'assets/morning-glory/led/week3.png');
        this.load.image(TextureKeys.MorningGloryLedWeek4, 'assets/morning-glory/led/week4.png');

        this.load.image(TextureKeys.MorningGloryMixedWeek0, 'assets/morning-glory/mixed/week0.png');
        this.load.image(TextureKeys.MorningGloryMixedWeek1, 'assets/morning-glory/mixed/week1.png');
        this.load.image(TextureKeys.MorningGloryMixedWeek2, 'assets/morning-glory/mixed/week2.png');
        this.load.image(TextureKeys.MorningGloryMixedWeek3, 'assets/morning-glory/mixed/week3.png');
        this.load.image(TextureKeys.MorningGloryMixedWeek4, 'assets/morning-glory/mixed/week4.png');

        this.load.image(TextureKeys.LettuceSunWeek0, 'assets/lettuce/sun/week0.png');
        this.load.image(TextureKeys.LettuceSunWeek1, 'assets/lettuce/sun/week1.png');
        this.load.image(TextureKeys.LettuceSunWeek2, 'assets/lettuce/sun/week2.png');
        this.load.image(TextureKeys.LettuceSunWeek3, 'assets/lettuce/sun/week3.png');
        this.load.image(TextureKeys.LettuceSunWeek4, 'assets/lettuce/sun/week4.png');

        this.load.image(TextureKeys.LettuceLedWeek0, 'assets/lettuce/led/week0.png');
        this.load.image(TextureKeys.LettuceLedWeek1, 'assets/lettuce/led/week1.png');
        this.load.image(TextureKeys.LettuceLedWeek2, 'assets/lettuce/led/week2.png');
        this.load.image(TextureKeys.LettuceLedWeek3, 'assets/lettuce/led/week3.png');
        this.load.image(TextureKeys.LettuceLedWeek4, 'assets/lettuce/led/week4.png');

        this.load.image(TextureKeys.LettuceMixedWeek0, 'assets/lettuce/mixed/week0.png');
        this.load.image(TextureKeys.LettuceMixedWeek1, 'assets/lettuce/mixed/week1.png');
        this.load.image(TextureKeys.LettuceMixedWeek2, 'assets/lettuce/mixed/week2.png');
        this.load.image(TextureKeys.LettuceMixedWeek3, 'assets/lettuce/mixed/week3.png');
        this.load.image(TextureKeys.LettuceMixedWeek4, 'assets/lettuce/mixed/week4.png');
    }

    create() {
        this.scene.start(SceneKeys.Plant)
    }
}
