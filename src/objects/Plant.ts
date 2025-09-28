import Phaser from 'phaser';
import FontKeys from 'consts/FontKeys';
import SoilType from 'consts/SoilType';

interface PlantConfig {
  leaves: number;
  height: number;
  width: number;
  heightPx: number;
  widthPx: number;
  image: string;
}

export default class Plant extends Phaser.GameObjects.Image {
  private potType: string;
  private soilType: SoilType | undefined;
  private plantType: string;
  private lightMode: string;
  private waterMode: string;
  private growthData: any;

  private detailDialog: Phaser.GameObjects.Container;
  private heightText!: Phaser.GameObjects.Text;
  private leavesText!: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    potType: string,
    soilType: SoilType | undefined,
    plantType: string,
    lightMode: string,
    waterMode: string,
    growthData: any
  ) {
    super(scene, x, y, '');
    this.potType = potType;
    this.soilType = soilType;
    this.plantType = plantType;
    this.lightMode = lightMode;
    this.waterMode = waterMode;
    this.growthData = growthData;

    scene.add.existing(this);
    this.setOrigin(0.5, 1);              // gốc cây ở đáy
    this.setInteractive({ draggable: true });

    this.detailDialog = new Phaser.GameObjects.Container(scene, x + 50, y + 50);
    scene.add.existing(this.detailDialog);
    this.setDialog();
  }

  setLightMode(mode: string) {
    this.lightMode = mode;
  }

  /** Cập nhật cây theo tuần */
  setWeek(week: number) {
    const weekData = this.growthData.weeks.find((w: any) => w.week === week);
    if (!weekData) {
      console.warn(`No data for week ${week}`);
      return;
    }

    const config: PlantConfig = weekData[this.plantType][this.lightMode] as PlantConfig;

    // Dynamic load ảnh từ public/
    console.log('Plant growth with Pot:', this.potType);
    console.log('with Soil:', this.soilType);
    console.log('with Plant:', this.plantType);
    console.log('with light mode:', this.lightMode);
    console.log('with water mode:', this.waterMode);
    console.log('at week:', week);

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
      console.log('Texture already loaded:', key);
      applyTexture();
    }

    // Lưu thông tin lá và chiều cao
    this.leavesText.setText('Số lá: ' + config.leaves);
    this.heightText.setText('Chiều cao: ' + (config.heightPx / 6.5).toFixed(0) + ' cm');
    console.log(
      `${this.plantType} (${this.lightMode}) - Week ${week}: ${config.leaves} leaves, ${config.height}cm (${config.heightPx}px), ${config.width}cm (${config.widthPx}px)`
    );
  }

  setDialog() {
    this.heightText = this.scene.add.text(60, -110, 'Số lá: 2', { fontSize: '26px', color: '#fff', fontStyle: FontKeys.BoldType, fontFamily: FontKeys.TahomaFamily });
    this.leavesText = this.scene.add.text(60, -150, 'Chiều Cao: 2 cm', { fontSize: '26px', color: '#fff', fontStyle: FontKeys.BoldType, fontFamily: FontKeys.TahomaFamily });
    this.detailDialog.add(this.heightText);
    this.detailDialog.add(this.leavesText);
    this.detailDialog.setVisible(false);
  }

  public showDialog() {
    this.detailDialog?.setVisible(true);
  }

  public hideDialog() {
    this.detailDialog?.setVisible(false);
  }

  public destroyDialog() {
    this.detailDialog?.destroy();
  }
}
