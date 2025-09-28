import Phaser from 'phaser';
import SceneKeys from 'consts/SceneKeys';
import EventKeys from 'consts/EventKeys';
import TextureKeys from 'consts/TextureKeys';

import LightType from 'consts/LightType';

import Window from 'objects/Window';
import Lamp from 'objects/Lamp';

import LeftPanel from 'objects/MenuLeft';
import RightPanel from 'objects/MenuRight/MenuRight';
import TimelineSlider from 'objects/TimelineSlider';
import Table from 'objects/Table';
import Pot from 'objects/PlantPot';
import Plant from 'objects/Plant';
import StateKeys from 'consts/AppStates';
import VoiceKeys from 'consts/VoiceKeys';
import WaterType from 'consts/WaterType';
import WaterBucket from 'objects/WaterBucket';
import PotType from '~/consts/PotType';
import SoilType from '~/consts/SoilType';
import Ruler50 from 'objects/Ruler50';
import ThermoHygrometer from 'objects/ThermoHygrometer';

export default class PlantScene extends Phaser.Scene {
  private plant!: Plant;
  private slider!: TimelineSlider;
  private growthData: any;
  private currentWeek: number = 0;
  private maxWeek: number = 4;
  private potType: string = 'small';
  private soilType: SoilType | undefined = undefined;
  private plantType: string = 'lettuce';
  private lightMode: LightType = LightType.Sun;
  private waterMode: WaterType = WaterType.One;
  private volume: number = 0.3;

  private background!: Phaser.GameObjects.Image;
  private window!: Window;
  private lamp!: Lamp;

  private sunLight?: Phaser.GameObjects.Graphics;
  private ledLight?: Phaser.GameObjects.Graphics;

  private timer!: Phaser.Time.TimerEvent;
  private timerCount = 0;
  private bgm!: Phaser.Sound.BaseSound;
  private buttonSelectVoice!: Phaser.Sound.BaseSound;
  private startVoice!: Phaser.Sound.BaseSound;
  private completeVoice!: Phaser.Sound.BaseSound;
  private plantVoice!: Phaser.Sound.BaseSound;
  private growVoice!: Phaser.Sound.BaseSound;

  private leftMenu!: LeftPanel;
  private rightMenu!: RightPanel;
  private table!: Table;
  private pot!: Pot;
  private waterBucket!: WaterBucket;
  private thermoHygrometer!: ThermoHygrometer;
  private ruler!: Ruler50;

  constructor() {
    super(SceneKeys.Plant);
  }

  preload() {
    this.load.json('growthData', './data/growth.json');
  }

  create() {
    const { width, height } = this.scale;
    this.input.dragDistanceThreshold = 0;
    this.input.dragTimeThreshold = 0;

    // init UI + layout
    this.layoutScene(width, height);

    // load data cây
    this.growthData = this.cache.json.get('growthData');

    // gắn toàn bộ event
    this.eventHandlers();

    // setting timer
    this.settingTimer();

    // === HANDLE RESIZE ===
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.layoutScene(gameSize.width, gameSize.height);
      this.updateLights();
    });
  }

  /** Hàm layout: setup hoặc update vị trí object khi resize */
  private layoutScene(width: number, height: number) {
    // Background
    if (!this.background) {
      this.background = this.add
        .image(0, 0, TextureKeys.BackgroundRoom)
        .setOrigin(0)
        .setScrollFactor(0, 0)
        .setName(TextureKeys.BackgroundRoom)
        .setDisplaySize(width, height).setDepth(-10);
    } else {
      this.background.setDisplaySize(width, height);
    }

    // Window
    const windowX = width / 3.5 + 70;
    const windowY = height / 7 - 35;
    if (!this.window) {
      this.window = new Window(this, windowX, windowY);
    } else {
      this.window.setPosition(windowX, windowY);
    }

    // Lamp
    if (!this.lamp) {
      this.lamp = new Lamp(this, width / 2, 20);
    } else {
      this.lamp.setPosition(width / 2, 20);
    }

    // Table
    if (!this.table) {
      this.table = new Table(this, width / 2, height / 2 + 200).setDepth(5);
    } else {
      this.table.setPosition(width / 2, height / 2 + 200);
    }

    // thermoHygrometer
    if (!this.thermoHygrometer) {
      this.thermoHygrometer = new ThermoHygrometer(this, this.table.x - this.table.displayWidth / 2 - 150, this.table.y + 40, 250, 250);
    } else {
      this.thermoHygrometer.setPosition(this.table.x - this.table.displayWidth / 2 - 150, this.table.y + 40);
    }

    // ruler
    if (!this.ruler) {
      this.ruler = new Ruler50(this, this.table.x - this.table.displayWidth / 2 - 360, this.table.y, 70, 325);
    } else {
      this.ruler.setPosition(this.table.x - this.table.displayWidth / 2 + 100, this.table.y - this.table.displayHeight / 2);
    }

    // WaterBucket
    if (!this.waterBucket) {
      this.waterBucket = new WaterBucket(this, 0, 0, 300, 300);
    } else {
      this.waterBucket.setPosition(0, 0);
    }

    // Left menu
    if (!this.leftMenu) {
      this.leftMenu = new LeftPanel(this, 100, 100);
    } else {
      this.leftMenu.setPosition(50, 100);
    }

    // Right menu
    if (!this.rightMenu) {
      this.rightMenu = new RightPanel(this, width, height, this.lightMode, this.waterMode);
    } else {
      this.rightMenu.resize(width, height);
    }

    // Slider
    if (this.slider) {
      this.slider.resize(width, height)
    } else {
      this.slider = new TimelineSlider(this, width, height, 4)
      this.add.existing(this.slider)
      this.slider.setWeek(this.currentWeek)
    }

    // update lights sau khi layout
    this.updateLights();

    // voice
    this.setupVoice();
  }

  private resetPlant(destroyOld: boolean = true) {
    this.currentWeek = 0;
    this.events.emit(EventKeys.SetWeek, 0);
    if (destroyOld) {
      this.plant?.destroyDialog();
      this.plant?.destroy();
    }
  }

  /** Vẽ lại ánh sáng dựa trên lightMode hiện tại */
  private updateLights() {
    this.sunLight?.destroy();
    this.ledLight?.destroy();

    if (!this.table) return;

    // Lấy mép trái/phải của mặt bàn
    const { left, right } = this.table.getSurfacePoints();
    const midX = (left.x + right.x) / 2;
    const topY = left.y + 90; // cùng y cho cả trái/phải

    if (this.lightMode === LightType.Sun || this.lightMode === LightType.Mixed) {
      this.sunLight = this.window.drawSunLightFromWindow(this, this.window, left, right, topY);
    }

    if (this.lightMode === LightType.Led || this.lightMode === LightType.Mixed) {
      const bulbPos = this.lamp.getBulbPosition();
      this.ledLight = this.lamp.drawLedLight(this, bulbPos.x, bulbPos.y + 10, left, right, topY);
      this.lamp.toggle(true);
    }

    this.window.setLightMode(this.lightMode);
    this.lamp.setLightMode(this.lightMode);
  }

  /** Gom toàn bộ event binding vào 1 chỗ */
  private eventHandlers() {
    // 🎯 Left menu events
    this.leftMenu.on(EventKeys.Start, () => {
      console.log('▶ Start');
      this.resetPlant(false);
      this.events.emit(EventKeys.DisableItems);
      this.leftMenu.setCurrentState(StateKeys.Running);
      this.startTimer();
      this.playSelectVoice();
      this.playStartVoice();
    });

    this.leftMenu.on(EventKeys.Resume, () => {
      console.log('⏯ Resume');
      this.events.emit(EventKeys.DisableItems);
      this.leftMenu.setCurrentState(StateKeys.Running);
      this.startTimer();
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.Stop, () => {
      console.log('⏸ Stop');
      this.events.emit(EventKeys.DisableItems);
      this.leftMenu.setCurrentState(StateKeys.Paused);
      this.stopTimer();
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.Reset, () => {
      console.log('🔄 Reset');
      this.resetExperiment()
      this.playSelectVoice()
    });

    this.leftMenu.on(EventKeys.Complete, () => {
      console.log('✅ Compete');
      this.events.emit(EventKeys.EnableItems);
      this.leftMenu.setCurrentState(StateKeys.Complete);
      this.playCompleteVoice();
    });

    this.leftMenu.on(EventKeys.Result, () => {
      console.log('📊 Show results');
      this.scene.launch('ResultScene', {
        returnTo: this.sys.settings.key,
        title: 'Bảng kết quả thí nghiệm',
        plant: this.plantType,
        lightMode: this.lightMode,
        growthData: this.growthData
      });
      this.scene.pause();
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.Conclusion, () => {
      console.log('📘 Show conclusion');
      this.scene.launch('ConclusionScene', {
        returnTo: this.scene.key,
        size: 'sm',
        bullets: [
          'Ánh sáng tự nhiên phù hợp với rau muống; ánh sáng mạnh & ổn định thì ra nhiều lá, tán dày.',
          'Ánh sáng tự nhiên với rau cải (lettuce) cho nhiều lá nếu nhiệt độ mát; nắng gắt + nóng dễ làm lá kém chất lượng.',
          'LED phù hợp cả hai loài khi cần ổn định, dễ kiểm soát.',
          'Ánh sáng hỗn hợp (natural + LED) thường cho cây cao/vươn hơn nhưng ít lá hơn hai chế độ trên.',
          'Rau muống phản ứng mạnh với ánh sáng dồi dào → muốn nhiều lá thì ưu tiên tự nhiên/LED đủ mạnh',
          'Rau cải cần ánh sáng vừa phải + nhiệt mát để lá đều, dày; nếu nóng quá dù sáng đủ vẫn giảm chất lượng lá.'
        ],
        modes: [
          { key: 'sun', label: 'Tự nhiên', leavesW4: '20 lá', heightW4: '20 cm', note: 'Nhiều lá nhất' },
          { key: 'led', label: 'LED', leavesW4: '16 lá', heightW4: '24 cm', note: 'Trung gian' },
          { key: 'mixed', label: 'Hỗn hợp', leavesW4: '12 lá', heightW4: '28 cm', note: 'Chiều cao lớn nhất' },
        ]
      } as import('./ConclusionScene').ConclusionData);
      this.scene.pause();
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.Zoom, () => {
      console.log('📘 Zoom');
      this.plant?.showDialog();
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.UnZoom, () => {
      console.log('📘 UnZoom');
      this.plant?.hideDialog();
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.MeterOn, () => {
      console.log('📘 MeterOn');
      this.ruler.setVisible(true);
      this.thermoHygrometer.setVisible(true);
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.UnMeterOn, () => {
      console.log('📘 UnMeterOn');
      this.ruler.setVisible(false);
      this.thermoHygrometer.setVisible(false);
      this.playSelectVoice();
    });

    this.leftMenu.on(EventKeys.Mute, () => {
      console.log('📘 Mute');
      this.stopBgmVoice();
    });

    this.leftMenu.on(EventKeys.UnMute, () => {
      console.log('📘 UnMute');
      this.startBgmVoice();
    });

    // 🎯 Right menu events
    this.rightMenu.on(EventKeys.PotDrag, ({ pot: pot, plantType: potType }) => {
      if (this.table) {
        this.table.checkDrop(pot, potType, 0.8, false);
        this.potType = potType;
      } else {
        pot.destroy();
      }
    })

    this.rightMenu.on(EventKeys.SoilDrag, ({ soil: soil, soilType: soilType }) => {
      if (this.pot) {
        this.pot.checkDrop(soil, 'soil', soilType, undefined, 2, false);
        this.soilType = soilType;
      } else {
        soil.destroy();
      }
    });

    // khi table xác nhận có pot rơi vào
    this.table.on(EventKeys.PotDrop, ({ x, y, potType }) => {
      console.log('🪴 Pot dropped:', potType)
      // Đặt pot ngay trên mặt bàn (chỉnh offset tuỳ loại pot)
      const surFace = this.table.getSurfacePosition()
      this.spawnPot(x, surFace.y + 50, potType)   // -10 để chậu "ăn" nhẹ xuống bàn
    })

    this.rightMenu.on(EventKeys.LeafDrag, ({ leaf, plantType }) => {
      console.log('🍃 Leaf dragged:', plantType);
      if (this.pot) {
        this.pot.checkDrop(leaf, 'plant', plantType, false);
      } else {
        leaf.destroy();
      }
    });

    this.rightMenu.on(EventKeys.LightChange, (mode: LightType) => {
      console.log('💡 Light mode:', mode);
      this.lightMode = mode;
      this.updateLights();
      if (this.plant) { this.plant.setLightMode(mode); }
    });

    this.rightMenu.on(EventKeys.WaterChange, (mode: WaterType) => {
      console.log('💡 Water mode:', mode);
      this.waterMode = mode;
      this.resetTimer();
    });

    this.rightMenu.on(EventKeys.Watering, (mode: WaterType) => {
      console.log('💡 Manual Watering:', mode);
      this.waterBucket.wateringPlants(this.plant?.x + 500, this.rightMenu.getMenuWaterPositionY(), this.plant?.x + 100, this.plant?.y - 150);
    });

    // 🎯 Slider events
    this.slider.onWeekChanged((week) => {
      this.currentWeek = week;
      this.events.emit(EventKeys.SetWeek, week);
    });

    this.events.on(EventKeys.SetWeek, (week: number) => {
      this.slider.setWeek(week);
      if (this.plant) {
        this.plant.setWeek(week);
      }
      this.playGrowVoice();
    });

    this.input.on(
        "drag",
        (_pointer: Phaser.Input.Pointer, _obj: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
            if (_obj == this.ruler) {
              this.ruler.setPosition(dragX, dragY);
            } else if (_obj == this.thermoHygrometer) {
              this.thermoHygrometer.setPosition(dragX, dragY);
            }
        }
    );
    this.input.on("dragend",
        (_pointer: Phaser.Input.Pointer, _obj: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
        if (_obj == this.ruler) {
        }
    });
  }

  private spawnPot(x: number, y: number, potType: PotType) {
    // Xoá pot cũ nếu có
    this.pot?.destroy();
    this.plant?.destroyDialog();
    this.plant?.destroy();

    // Tạo pot mới
    this.pot = new Pot(this, x, y, potType).setDepth(10);
    this.potType = potType;

    // Dọn listener cũ rồi gắn lại
    this.pot.removeAllListeners(EventKeys.PlantDrop)
    this.pot.on(EventKeys.PlantDrop, (plantType: string) => {
      console.log('🌱 Plant dropped:', plantType)
      this.spawnPlant(plantType)
    })

    this.pot.on(EventKeys.SoilDrop, (soilType: SoilType) => {
      console.log('🌱 Soil dropped:', soilType)
      this.soilType = soilType;
      this.pot.setSoil(soilType);
    })

    // Cập nhật ánh sáng
    this.updateLights()
  }

  private spawnPlant(plantType: string) {
    // Dọn cây cũ
    this.plant?.destroyDialog()
    this.plant?.destroy()

    this.plantType = plantType

    // Lấy vị trí đất trong pot
    const soilPos = this.pot!.getSoilPosition()

    // Tạo cây mới
    this.plant = new Plant(
      this,
      soilPos.x,
      soilPos.y,
      this.potType,
      this.soilType,
      this.plantType,
      this.lightMode,
      this.waterMode,
      this.growthData
    ).setDepth(11);
    this.plant.setWeek(this.currentWeek)

    // Cho phép nút Start
    this.leftMenu.enableStartButton()

    // Âm thanh
    this.playYeahVoice()
  }

  private settingTimer() {
    // 10s là 1 tuần
    const weekTime = 10000;
    const order: WaterType[] = [WaterType.Manual, WaterType.One, WaterType.Two, WaterType.Three];

    // tần suất tưới nước
    const frequency = order.indexOf(this.waterMode);

    // Số giây để timer nhảy 1 lần
    const delay = weekTime / (frequency + 1);

    // tạo timer
    this.timer = this.time.addEvent({
      delay: delay,
      loop: true,
      paused: true
    });

    this.timer.callback = () => {
      this.timerCount++;

      // Đến điểm cây lớn
      if (((this.timerCount * delay) % weekTime) === 0) {
        if (this.currentWeek < this.maxWeek - 1) {
          this.currentWeek++;
          this.events.emit(EventKeys.SetWeek, this.currentWeek);
        }
        else if (this.currentWeek = this.maxWeek - 1) {
          this.currentWeek++;
          this.events.emit(EventKeys.SetWeek, this.currentWeek);
          this.leftMenu.emit(EventKeys.Complete);
          this.stopTimer();
        } else {
          this.leftMenu.emit(EventKeys.Complete);
          this.stopTimer();
        }
      }
      // Đến điểm tưới nước
      else {
        console.log("Tưới nước lần" + this.timerCount);
        this.waterBucket.wateringPlants(this.plant?.x + 500, this.rightMenu.getMenuWaterPositionY(), this.plant?.x + 100, this.plant?.y - 150);
      }
    };
  }

  private stopTimer() {
    this.timer.paused = true;
    this.timerCount = 0;
  }

  private startTimer() {
    this.timer.paused = false;
  }

  private resetTimer() {
    if (this.timer) this.timer.destroy();
    this.settingTimer();
  }

  private setupVoice() {
    const cfgBGMAudio = {
      key: VoiceKeys.BGM,
      mute: false,
      volume: this.volume,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    };

    if (!this.bgm) {
      this.bgm = this.sound.add(VoiceKeys.BGM, cfgBGMAudio);
      if (!this.bgm.isPlaying) {
        this.bgm.play();
      }
    }

    this.buttonSelectVoice = this.sound.add(VoiceKeys.ButtonSelect, { mute: false, volume: 0.5 });
    this.startVoice = this.sound.add(VoiceKeys.Start, { mute: false, volume: 0.5 });
    this.completeVoice = this.sound.add(VoiceKeys.Complete, { mute: false, volume: 0.5 });
    this.plantVoice = this.sound.add(VoiceKeys.Plant, { mute: false, volume: 0.5 });
    this.growVoice = this.sound.add(VoiceKeys.Grow, { mute: false, volume: 0.5 });
  }

  private playSelectVoice() {
    if (!this.buttonSelectVoice) {
      this.buttonSelectVoice = this.sound.add(VoiceKeys.ButtonSelect, { mute: false, volume: 0.5 });
    }
    this.buttonSelectVoice.play()
  }

  private playStartVoice() {
    if (!this.startVoice) {
      this.startVoice = this.sound.add(VoiceKeys.Start, { mute: false, volume: 0.5 });
    }
    this.startVoice.play()
  }

  private playCompleteVoice() {
    if (!this.completeVoice) {
      this.completeVoice = this.sound.add(VoiceKeys.Complete, { mute: false, volume: 0.5 });
    }
    this.completeVoice.play()
  }

  private playYeahVoice() {
    if (!this.plantVoice) {
      this.plantVoice = this.sound.add(VoiceKeys.Plant, { mute: false, volume: 0.5 });
    }
    this.plantVoice.play()
  }

  private playGrowVoice() {
    if (!this.growVoice) {
      this.growVoice = this.sound.add(VoiceKeys.Plant, { mute: false, volume: 0.5 });
    }
    this.growVoice.play()
  }

  private stopBgmVoice() {
    this.volume = 0;

    if (this.bgm.isPlaying) {
      this.bgm.stop();
    }
  }

  private startBgmVoice() {
    this.volume = 0.3;

    if (!this.bgm.isPlaying) {
      this.bgm.play();
    }
  }

  private resetExperiment() {
    console.log('🔄 Reset experiment')

    // Xoá cây
    this.plant?.destroyDialog()
    this.plant?.destroy()
    this.plant = undefined!

    // Xoá pot
    this.pot?.destroy()
    this.pot = undefined!

    // Reset state
    this.currentWeek = 0
    this.potType = ''
    this.soilType = undefined
    this.plantType = ''
    this.lightMode = LightType.Sun
    this.waterMode = WaterType.One

    // Reset slider
    this.slider.setWeek(0)

    // Enable lại menus
    this.events.emit(EventKeys.EnableItems)
    this.events.emit(EventKeys.Reset);
    this.leftMenu.setCurrentState(StateKeys.Initial)
    this.rightMenu.setEnabled(true)

    // Reset timer
    this.stopTimer()
    this.resetTimer()

    // Reset light
    this.updateLights()
  }
}
