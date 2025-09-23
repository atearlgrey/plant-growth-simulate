import Phaser from 'phaser';

interface PlantConfig {
  leaves: number;
  height: number;
  width: number;
  heightPx: number;
  widthPx: number;
  image: string;
}

export default class Plant extends Phaser.GameObjects.Image {
  private plantType: string;
  private lightMode: string;
  private growthData: any;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    plantType: string,
    lightMode: string,
    growthData: any
  ) {
    super(scene, x, y, '');
    this.plantType = plantType;
    this.lightMode = lightMode;
    this.growthData = growthData;

    scene.add.existing(this);
    this.setOrigin(0.5);
    this.setInteractive({ draggable: true });
  }

  /** Cập nhật cây theo tuần */
  setWeek(week: number) {
    const weekData = this.growthData.weeks.find((w: any) => w.week === week);
    if (!weekData) {
      console.warn(`No data for week ${week}`);
      return;
    }

    const config: PlantConfig =
      weekData[this.plantType][this.lightMode] as PlantConfig;

    // Dynamic load ảnh từ public/
    const key = `${this.plantType}-${this.lightMode}-week${week}`;
    console.log('Loading texture key:', key, 'from', config.image);

    const applyTexture = () => {
      this.setTexture(key);

      // ⚡ Set đúng width / height theo px từ JSON
      if (config.widthPx && config.heightPx) {
        this.setDisplaySize(config.widthPx, config.heightPx);
      }
    };

    if (!this.scene.textures.exists(key)) {
      this.scene.load.image(key, config.image);
      this.scene.load.once('complete', () => {
        applyTexture();
      });
      this.scene.load.start();
    } else {
      applyTexture();
    }

    // Lưu thông tin lá và chiều cao
    console.log(
      `${this.plantType} (${this.lightMode}) - Week ${week}: ${config.leaves} leaves, ${config.height}cm (${config.heightPx}px)`
    );
  }
}
