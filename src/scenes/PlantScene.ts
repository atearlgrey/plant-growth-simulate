import Phaser from 'phaser';
import SceneKeys from 'consts/SceneKeys';
import TextureKeys from 'consts/TextureKeys';
import LeftPanel from 'objects/MenuLeft';
import RightPanel from 'objects/MenuRight';
import TimelineSlider from 'objects/TimelineSlider';
import Table from 'objects/Table';
import Pot from 'objects/PlantPot';
import Plant from 'objects/Plant';

export default class PlantScene extends Phaser.Scene {
  private plant!: Plant;
  private slider!: TimelineSlider;
  private growthData: any;
  private currentWeek: number = 0;
  private plantType: string = 'lettuce';
  private lightMode: string = 'sun';

  private table!: Table;
  private pot!: Pot;
  private background!: Phaser.GameObjects.TileSprite;
  private leftMenu!: LeftPanel;
  private rightMenu!: RightPanel;

  constructor() {
    super(SceneKeys.Plant);
  }

  preload() {
    this.load.json('growthData', '/data/growth.json');
  }

  create() {
    const { width, height } = this.scale;

    // init UI + layout
    this.layoutScene(width, height);

    // load data cây
    this.growthData = this.cache.json.get('growthData');

    // === HANDLE RESIZE ===
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.layoutScene(gameSize.width, gameSize.height);
    });
  }

  /** Hàm layout: setup hoặc update vị trí object khi resize */
  private layoutScene(width: number, height: number) {
    // Background
    if (!this.background) {
      this.background = this.add
        .tileSprite(0, 0, width, height, 'background')
        .setOrigin(0)
        .setScrollFactor(0, 0)
        .setName('background');
    } else {
      this.background.setSize(width, height);
    }

    // Table
    if (!this.table) {
      this.table = new Table(this, width / 2, height / 2 + 80);
    } else {
      this.table.setPosition(width / 2, height / 2 + 80);
    }

    // Pot
    if (!this.pot) {
      this.pot = new Pot(this, width / 2, height / 2 - 35);

      // Khi lá thả vào chậu thành công → tạo Plant
      this.pot.on('plant-drop', (plantType: string) => {
        console.log('Đã thả cây vào chậu:', plantType);

        this.plant?.destroy(); // replace cây cũ

        this.plant = new Plant(
          this,
          this.pot.x,
          this.pot.y - this.pot.displayHeight / 4,
          plantType,
          this.lightMode,
          this.growthData
        );
        this.plant.setWeek(this.currentWeek);
      });
    } else {
      this.pot.setPosition(width / 2, height / 2 - 35);
    }

    // Left menu
    if (!this.leftMenu) {
      this.leftMenu = new LeftPanel(this, 50, 100);
      this.leftMenu.on('pause', () => this.scene.pause());
      this.leftMenu.on('reset', () => this.resetPlant());
      this.leftMenu.on('result', () => console.log('Hiện kết quả'));
      this.leftMenu.on('conclusion', () => console.log('Hiện kết luận'));
    } else {
      this.leftMenu.setPosition(50, 100);
    }

    // Right menu
    if (!this.rightMenu) {
      this.rightMenu = new RightPanel(this, width - 220, 50);

      // Khi leaf được tạo từ RightMenu → chuyển cho Pot check
      this.rightMenu.on('leaf-drag', ({ leaf, plantType }) => {
        this.pot.checkDrop(leaf, plantType);
      });

      this.rightMenu.on('light', (mode: string) => {
        console.log('Light mode:', mode);
        this.lightMode = mode;
      });
    } else {
      this.rightMenu.setPosition(width - 220, 50);
    }

    // Slider
    if (this.slider) {
      const lastWeek = this.slider.getWeek();
      this.slider.destroy();

      this.slider = new TimelineSlider(this, width, height, this.slider['totalWeeks']);
      this.add.existing(this.slider);

      this.slider.onWeekChanged((week) => {
        this.currentWeek = week;
        this.events.emit('set-week', week);
      });

      this.events.on('set-week', (week: number) => {
        this.slider.setWeek(week);
      });

      this.slider.setWeek(lastWeek);
    } else {
      this.slider = new TimelineSlider(this, width, height, 4);
      this.add.existing(this.slider);

      this.slider.onWeekChanged((week) => {
        this.currentWeek = week;
        this.events.emit('set-week', week);
      });

      this.events.on('set-week', (week: number) => {
        this.slider.setWeek(week);
      });

      this.slider.setWeek(this.currentWeek);
    }
  }

  private resetPlant() {
    this.plant?.destroy();
    this.currentWeek = 0;
    this.events.emit('set-week', 0);
  }
}
