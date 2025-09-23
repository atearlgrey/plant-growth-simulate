import Phaser from 'phaser';
import SceneKeys from 'consts/SceneKeys';
import EventKeys from 'consts/EventKeys';
import TextureKeys from 'consts/TextureKeys';

import LightType from 'consts/LightType';

import Window from 'objects/Window';
import Lamp from 'objects/Lamp';

import LeftPanel from 'objects/MenuLeft';
import RightPanel from 'objects/MenuRight';
import TimelineSlider from 'objects/TimelineSlider';
import Table from 'objects/Table';
import Pot from 'objects/PlantPot';
import Plant from 'objects/Plant';
import StateKeys from 'consts/AppStates';

export default class PlantScene extends Phaser.Scene {
  private plant!: Plant;
  private slider!: TimelineSlider;
  private growthData: any;
  private currentWeek: number = 0;
  private maxWeek: number = 4;
  private plantType: string = 'lettuce';
  private lightMode: LightType = LightType.Sun;

  private background!: Phaser.GameObjects.Image;
  private window!: Window;
  private lamp!: Lamp;

  private sunLight?: Phaser.GameObjects.Graphics;
  private ledLight?: Phaser.GameObjects.Graphics;

  private timer!: Phaser.Time.TimerEvent;

  private leftMenu!: LeftPanel;
  private rightMenu!: RightPanel;
  private table!: Table;
  private pot!: Pot;

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
        .setDisplaySize(width, height);
    } else {
      this.background.setDisplaySize(width, height);
    }

    // Window
    const windowX = width / 5;
    const windowY = height / 4;
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
      this.table = new Table(this, width / 2, height / 2 + 200);
    } else {
      this.table.setPosition(width / 2, height / 2 + 200);
    }

    // Pot
    if (!this.pot) {
      this.pot = new Pot(this, width / 2, height / 2 ); // chỉnh offset hợp lý
    } else {
      this.pot.setPosition(width / 2, height / 2 );
    }

    // Left menu
    if (!this.leftMenu) {
      this.leftMenu = new LeftPanel(this, 100, 100);
    } else {
      this.leftMenu.setPosition(50, 100);
    }

    // Right menu
    if (!this.rightMenu) {
      this.rightMenu = new RightPanel(this, width - 305, 50, this.lightMode);
    } else {
      this.rightMenu.setPosition(width - 220, 50);
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
  }

  private resetPlant() {
    this.currentWeek = 0;
    this.events.emit(EventKeys.SetWeek, 0);
    this.plant?.destroy();
  }

  /** Vẽ lại ánh sáng dựa trên lightMode hiện tại */
  private updateLights() {
    this.sunLight?.destroy();
    this.ledLight?.destroy();

    if (!this.pot) return;

    if (this.lightMode === LightType.Sun || this.lightMode === LightType.Mixed) {
      this.sunLight = this.drawSunLightFromWindow(this.window, this.pot.x, this.pot.y - 35);
    }

    if (this.lightMode === LightType.Led || this.lightMode === LightType.Mixed) {
      const bulbPos = this.lamp.getBulbPosition();
      this.ledLight = this.drawLedLight(bulbPos.x, bulbPos.y + 10, this.pot.x, this.pot.y - 35);
      this.lamp.toggle(true);
    }
  }

  /** Ánh sáng mặt trời từ cửa sổ xuống chậu */
  private drawSunLightFromWindow(window: Window, potX: number, potY: number) {
    const { bottomLeft, bottomRight, topRight } = window.getCorners();
    const g = this.add.graphics();
    g.fillStyle(0xffff99, 0.25);

    // ánh sáng từ mép trái
    g.beginPath();
    g.moveTo(bottomLeft.x, bottomLeft.y);
    g.lineTo(bottomRight.x, bottomRight.y);
    g.lineTo(potX - 60, potY);
    g.closePath();
    g.fillPath();

    // ánh sáng từ mép phải
    g.beginPath();
    g.moveTo(topRight.x, topRight.y);
    g.lineTo(bottomRight.x, bottomRight.y);
    g.lineTo(potX + 60, potY);
    g.closePath();
    g.fillPath();

    // ánh sáng từ cạnh dưới
    g.beginPath();
    g.moveTo(bottomRight.x, bottomRight.y);
    g.lineTo(potX - 60, potY);
    g.lineTo(potX + 60, potY);
    g.closePath();
    g.fillPath();

    g.setDepth(1);
    return g;
  }

  /** Ánh sáng LED từ đèn trần xuống chậu */
  private drawLedLight(ceilingX: number, ceilingY: number, potX: number, potY: number) {
    const g = this.add.graphics();
    g.fillStyle(0x99ccff, 0.5);
    g.beginPath();
    g.moveTo(ceilingX - 40, ceilingY);
    g.lineTo(ceilingX + 40, ceilingY);
    g.lineTo(potX + 60, potY);
    g.lineTo(potX - 60, potY);
    g.closePath();
    g.fillPath();
    g.setDepth(1);
    return g;
  }

  /** Gom toàn bộ event binding vào 1 chỗ */
  private eventHandlers() {
    // 🎯 Left menu events
    this.leftMenu.on(EventKeys.Start, () => {
      console.log('▶ Start');
      this.events.emit(EventKeys.DisableItems);
      this.leftMenu.setCurrentState(StateKeys.Running);
      this.timer.paused = false;
    });

    this.leftMenu.on(EventKeys.Resume, () => {
      console.log('⏯ Resume');
      this.events.emit(EventKeys.DisableItems);
      this.leftMenu.setCurrentState(StateKeys.Running);
      this.timer.paused = false;
    });

    this.leftMenu.on(EventKeys.Stop, () => {
      console.log('⏸ Stop');
      this.events.emit(EventKeys.DisableItems);
      this.leftMenu.setCurrentState(StateKeys.Paused);
      this.timer.paused = true;
    });

    this.leftMenu.on(EventKeys.Reset, () => {
      console.log('🔄 Reset');
      this.resetPlant();
      this.events.emit(EventKeys.EnableItems);
      this.leftMenu.setCurrentState(StateKeys.Initial);
      this.timer.paused = true;
    });

    this.leftMenu.on(EventKeys.Complete, () => {
      console.log('✅ Compete');
      this.events.emit(EventKeys.EnableItems);
      this.leftMenu.setCurrentState(StateKeys.Complete);
    });

    this.leftMenu.on(EventKeys.Result, () => {
      console.log('📊 Show results');
    });

    this.leftMenu.on(EventKeys.Conclusion, () => {
      console.log('📘 Show conclusion');
    });

    // 🎯 Right menu events
    this.rightMenu.on(EventKeys.LeafDrag, ({ leaf, plantType }) => {
      this.pot.checkDrop(leaf, plantType);
    });

    this.pot.on(EventKeys.PlantDrop, (plantType: string) => {
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

    this.rightMenu.on(EventKeys.LightChange, (mode: LightType) => {
      console.log('💡 Light mode:', mode);
      this.lightMode = mode;
      this.updateLights();
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
    });
  }

  private settingTimer() {
    this.timer = this.time.addEvent({
      delay: 2000,
      loop: true,
      paused: true
    });

    this.timer.callback = () => {
      if (this.currentWeek < this.maxWeek - 1) {
        this.currentWeek ++;
        this.events.emit(EventKeys.SetWeek, this.currentWeek);
      } 
      else if (this.currentWeek = this.maxWeek - 1) {
        this.currentWeek ++;
        this.events.emit(EventKeys.SetWeek, this.currentWeek);
        this.leftMenu.emit(EventKeys.Complete);
        this.timer.paused = true;
      } else {
        this.leftMenu.emit(EventKeys.Complete);
        this.timer.paused = true;
      }
    };
  }
}
