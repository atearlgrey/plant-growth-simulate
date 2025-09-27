import Phaser from 'phaser'

/**
 * Sắp xếp các GameObjects theo hàng ngang, cân giữa theo centerX.
 * @param items - Danh sách item (Image/Text/Container đều được)
 * @param centerX - Tọa độ X làm tâm
 * @param y - Tọa độ Y của hàng
 * @param spacing - Khoảng cách giữa các item
 */
export function arrangeItems(
  items: Phaser.GameObjects.GameObject[],
  centerX: number,
  y: number,
  spacing: number
) {
  const totalWidth = (items.length - 1) * spacing
  const startX = centerX - totalWidth / 2

  items.forEach((item, i) => {
    if ('setPosition' in item) {
      (item as unknown as Phaser.GameObjects.Components.Transform).setPosition(startX + i * spacing, y)
    }
  })
}

/**
 * Sắp xếp items ngang, căn giữa trong panel.
 */
export function arrangeItemsCenter(
  items: Phaser.GameObjects.Container[],
  panelWidth: number,
  startY: number,
  gap: number = 20
) {
  const widths = items.map((i) => i.getBounds().width)
  const totalWidth = widths.reduce((a, b) => a + b, 0)
  const totalGap = gap * (items.length - 1)
  const total = totalWidth + totalGap

  let currentX = (panelWidth - total) / 2

  items.forEach((item, idx) => {
    const w = widths[idx]
    item.setPosition(currentX + w / 2, startY)
    currentX += w + gap
  })
}

/**
 * Sắp xếp items ngang, căn trái trong panel.
 */
export function arrangeItemsLeft(
  items: Phaser.GameObjects.Container[],
  panelWidth: number,
  startY: number,
  gap: number = 20,
  paddingLeft: number = 0
) {
  let currentX = paddingLeft

  items.forEach((item, idx) => {
    const bounds = item.getBounds()
    const w = bounds.width
    item.setPosition(currentX + w / 2, startY)
    currentX += w + gap
  })
}

/**
 * Sắp xếp items ngang, căn phải trong panel.
 */
export function arrangeItemsRight(
  items: Phaser.GameObjects.Container[],
  panelWidth: number,
  startY: number,
  gap: number = 20,
  paddingRight: number = 0
) {
  const widths = items.map((i) => i.getBounds().width)
  const totalWidth = widths.reduce((a, b) => a + b, 0)
  const totalGap = gap * (items.length - 1)
  const total = totalWidth + totalGap

  let currentX = panelWidth - total - paddingRight

  items.forEach((item, idx) => {
    const w = widths[idx]
    item.setPosition(currentX + w / 2, startY)
    currentX += w + gap
  })
}
