import Phaser from 'phaser';

interface PlantConfig {
  leaves: number;
  height: number;
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
    if (!this.scene.textures.exists(key)) {
      this.scene.load.image(key, config.image);
      this.scene.load.once('complete', () => {
        this.setTexture(key);
      });
      this.scene.load.start();
    } else {
      this.setTexture(key);
    }

    // (Optional) scale theo height
    this.setScale(0.05);

    // Bạn cũng có thể lưu leaves/height nếu cần
    console.log(
      `${this.plantType} (${this.lightMode}) - Week ${week}: ${config.leaves} leaves, ${config.height}cm`
    );
  }
}
