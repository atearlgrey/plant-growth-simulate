enum EventKeys {

  // Process control
  Start = 'process-start',
  Stop = 'process-stop',
  Resume = 'process-resume',
  Reset = 'process-reset',
  Result = 'process-result',
  Conclusion = 'process-conclusion',
  Complete = 'process-complete',
  Zoom = 'process-zoom',
  UnZoom = 'process-unzoom',
  Mute = 'process-mute',
  UnMute = 'process-unmute',
  MeterOn = 'process-meterOn',
  UnMeterOn = 'process-unMeterOn',
  Watering = 'process-watering',

  // UI control
  PotDrag = 'pot-drag',
  SoilDrag = 'soil-drag',
  LeafDrag = 'leaf-drag',

  PotDrop = 'pot-drop',
  SoilDrop = 'soil-drop',
  PlantDrop = 'plant-drop',
  WaterDrop = 'water-drop',

  // State change
  LightChange = 'light-change',
  WaterChange = 'water-change',

  // Item control
  EnableItems = 'enable-items',
  DisableItems = 'disable-items',

  // Data control
  SetWeek = 'set-week',
}

export default EventKeys