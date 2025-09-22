// Copyright 2025 admin3s
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Phaser from 'phaser'

export default class Panel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, radius = 12) {
    super(scene, x, y)

    // Vẽ bo góc bằng Graphics
    const g = scene.add.graphics()
    g.lineStyle(2, 0x0077cc, 1) // màu viền xanh
    g.fillStyle(0x000000, 0.5)  // nền đen trong suốt

    g.fillRoundedRect(0, 0, width, height, radius)
    g.strokeRoundedRect(0, 0, width, height, radius)

    this.add(g)
    scene.add.existing(this)
  }
}
