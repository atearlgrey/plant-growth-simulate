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
