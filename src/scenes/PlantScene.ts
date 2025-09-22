import Phaser from 'phaser';
import SceneKeys from 'consts/SceneKeys';
import Plant from '../objects/Plant';
import MenuScene from './MenuScene';

export default class PlantScene extends Phaser.Scene {
  private plant!: Plant;
  private growthData: any;
  private currentWeek: number = 0;
  private plantType: string = 'lettuce';
  private lightMode: string = 'sun';

  constructor() {
    super(SceneKeys.Plant);
  }

  preload() {
    // load data và asset cơ bản
    this.load.json('growthData', '/data/growth.json');
    this.load.image('background', '/assets/bg.png');
    this.load.image('table', '/assets/table.png');
  }

  create() {
    const { width, height } = this.scale;

    // background
    this.add
      .tileSprite(0, 0, width, height, 'background')
      .setOrigin(0)
      .setScrollFactor(0, 0)
      .setName('background');

    // ===== BÀN + KHUNG KÍNH =====
    this.add
      .image(width / 2, height / 2 + 80, 'table')
      .setOrigin(0.5)
      .setScale(0.4)
      .setName('table');

    // this.add
    //   .rectangle(width / 2, height / 2 - 20, 300, 200, 0x000000)
    //   .setStrokeStyle(3, 0xffffff)
    //   .setOrigin(0.5)
    //   .setName('cabinet');

    // this.add
    //   .text(width / 2, height / 2 - 140, 'Cái tủ kính', {
    //     fontSize: '16px',
    //     color: '#fff',
    //   })
    //   .setOrigin(0.5);

    // data cây
    this.growthData = this.cache.json.get('growthData');

    // tạo cây mặc định
    this.spawnPlant();

    // bật menu
    this.scene.launch('MenuScene');
    const menu = this.scene.get('MenuScene') as MenuScene;

    // gắn sự kiện menu
    menu.events.on('pause-toggle', () => {
      if (this.scene.isPaused()) {
        this.scene.resume();
      } else {
        this.scene.pause();
      }
    });

    menu.events.on('reset', () => {
      this.currentWeek = 0;
      this.plant.setWeek(0);
      menu.events.emit('set-week', 0);
    });

    menu.events.on('show-result', () => {
      console.log('Hiện kết quả theo tuần');
    });

    menu.events.on('show-conclusion', () => {
      console.log('Hiện kết luận');
    });

    menu.events.on('select-plant', (plant: string) => {
      this.plantType = plant;
      this.resetPlant();
    });

    menu.events.on('select-light', (mode: string) => {
      this.lightMode = mode;
      this.resetPlant();
    });

    // thử bấm phím N để qua tuần
    this.input.keyboard.on('keydown-N', () => {
      this.currentWeek = Math.min(this.currentWeek + 1, 4);
      this.plant.setWeek(this.currentWeek);
      menu.events.emit('set-week', this.currentWeek);
    });

    // === HANDLE RESIZE ===
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;

      // background
      const background = this.children.getByName(
        'background'
      ) as Phaser.GameObjects.TileSprite;
      if (background) {
        background.setSize(width, height);
      }

      // bàn
      const table = this.children.getByName('table') as Phaser.GameObjects.Image;
      if (table) {
        table.setPosition(width / 2, height / 2 + 80);
      }
    });
  }

  private spawnPlant() {
    const { width, height } = this.scale;
    this.plant = new Plant(
      this,
      width / 2,
      height / 2,
      this.plantType,
      this.lightMode,
      this.growthData
    );
    this.input.setDraggable(this.plant);

    // khởi tạo ở tuần 0
    this.plant.setWeek(this.currentWeek);

    // drag logic
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.plant) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    });
  }

  private resetPlant() {
    this.plant.destroy();
    this.currentWeek = 0;
    this.spawnPlant();
    this.scene.get('MenuScene').events.emit('set-week', 0);
  }
}
