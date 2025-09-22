import Phaser from 'phaser'

/**
 * Sắp xếp items theo dạng grid (giống bootstrap row/col).
 * @param items - Danh sách GameObjects
 * @param cols - Số cột
 * @param startX - Vị trí X bắt đầu (góc trái trên)
 * @param startY - Vị trí Y bắt đầu (góc trái trên)
 * @param cellWidth - Chiều rộng mỗi cell
 * @param cellHeight - Chiều cao mỗi cell
 * @param hGap - Khoảng cách ngang giữa các cell
 * @param vGap - Khoảng cách dọc giữa các cell
 */
export function arrangeGrid(
  items: Phaser.GameObjects.GameObject[],
  cols: number,
  startX: number,
  startY: number,
  cellWidth: number,
  cellHeight: number,
  hGap = 10,
  vGap = 10
) {
  items.forEach((item, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols

    const x = startX + col * (cellWidth + hGap) + cellWidth / 2
    const y = startY + row * (cellHeight + vGap) + cellHeight / 2

    if ('setPosition' in item) {
      (item as unknown as Phaser.GameObjects.Components.Transform).setPosition(x, y)
    }
  })
}
