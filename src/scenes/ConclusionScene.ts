import Phaser from 'phaser';

/** ===== Types ===== */
export type ConclusionData = {
    returnTo?: string;
    title?: string; // mặc định: "Kết luận thí nghiệm"
    bullets?: string[]; // các ý chính hiển thị trên đầu
    modes?: ModeRow[];  // dữ liệu bảng theo chế độ
    size?: 'sm' | 'md' | 'lg';
};

type ModeKey = 'sun' | 'led' | 'mixed';
type ModeRow = { key: ModeKey; label: string; leavesW4: string; heightW4: string; note?: string };

/** ===== Scene ===== */
export default class ConclusionScene extends Phaser.Scene {
    private returnTo?: string;
    private esc?: (e: KeyboardEvent) => void;

    constructor() { super('ConclusionScene'); }

    create(data: ConclusionData) {
        this.returnTo = data.returnTo;

        // ==== kích thước panel
        const { w: panelW, h: panelH } = getPanelSize(this.scale, data.size ?? 'sm');
        const { width, height } = this.scale;

        // overlay
        this.add.rectangle(width/2, height/2, width, height, 0x0b1220, 0.40)
            .setInteractive()
            .on('pointerdown', () => this.close());

        const container = this.add.container(width/2, height/2);

        // shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.20).fillRoundedRect(-panelW/2+6, -panelH/2+10, panelW, panelH, 18);
        container.add(shadow);

        // panel
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1).fillRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 18);
        g.lineStyle(1, 0xe5e7eb, 1).strokeRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 18);
        container.add(g);

        const title = data.title ?? 'Kết luận thí nghiệm';
        container.add(
            this.add.text(0, -panelH/2 + 18, title,
                { fontFamily:'Arial, Helvetica, sans-serif', fontSize:'20px', color:'#0f172a', fontStyle:'bold' }
            ).setOrigin(0.5,0)
        );

        // close
        const closeArea = this.add.rectangle(panelW/2 - 24, -panelH/2 + 24, 32, 32, 0x000000, 0);
        const closeText = this.add.text(panelW/2 - 24, -panelH/2 + 12, '✕',
            { fontFamily:'Arial, Helvetica, sans-serif', fontSize:'18px', color:'#666' }
        ).setOrigin(0.5,0);
        closeArea.setInteractive({ useHandCursor: true })
            .on('pointerover', () => closeText.setColor('#111'))
            .on('pointerout',  () => closeText.setColor('#666'))
            .on('pointerup',   () => this.close());
        container.add(closeArea);
        container.add(closeText);

        // nội dung DOM
        injectStylesOnceConclusion();

        const domTop = -panelH/2 + 56;
        const html = buildConclusionHTML(
            panelW - 40,
            panelH - 100,
            data.bullets ?? [],
            data.modes ?? defaultModesRows()
        );
        const dom = this.add.dom(0, domTop).createFromHTML(html).setOrigin(0.5,0);
        container.add(dom);

        // animation
        container.setAlpha(0).setScale(0.96);
        this.tweens.add({ targets: container, alpha: 1, scale: 1, duration: 220, ease: 'Cubic.easeOut' });
        (container as any).__animated = true;
        (this as any).__container = container;

        // ESC
        this.esc = (e: KeyboardEvent) => { if (e.key === 'Escape') this.close(); };
        window.addEventListener('keydown', this.esc);
    }

    /** Helper: build data từ 1 summary text object (nếu muốn) */
    public static buildDataFromSummary(summary: {
        trend: string;
        sun:   { leaves: string; height: string; note?: string };
        led:   { leaves: string; height: string; note?: string };
        mixed: { leaves: string; height: string; note?: string };
    }): ConclusionData {
        return {
            bullets: [summary.trend],
            modes: [
                { key:'sun',   label:'Tự nhiên', leavesW4: summary.sun.leaves,   heightW4: summary.sun.height,   note: summary.sun.note   },
                { key:'led',   label:'LED',      leavesW4: summary.led.leaves,   heightW4: summary.led.height,   note: summary.led.note   },
                { key:'mixed', label:'Hỗn hợp',  leavesW4: summary.mixed.leaves, heightW4: summary.mixed.height, note: summary.mixed.note },
            ],
            size: 'sm'
        };
    }

    private close() {
        if (this.esc) window.removeEventListener('keydown', this.esc);
        const container = (this as any).__container as Phaser.GameObjects.Container | undefined;
        if (container && (container as any).__animated) {
            this.tweens.add({
                targets: container, alpha: 0, scale: 0.96, duration: 160, ease: 'Cubic.easeIn',
                onComplete: () => { if (this.returnTo) this.scene.resume(this.returnTo); this.scene.stop(); }
            });
        } else {
            if (this.returnTo) this.scene.resume(this.returnTo);
            this.scene.stop();
        }
    }
}

/* =============== Helpers =============== */

function getPanelSize(scale: Phaser.Scale.ScaleManager, size:'sm'|'md'|'lg') {
    const { width, height } = scale;
    const presets = {
        sm: { w: Math.min(820,  Math.floor(width*0.64)), h: Math.min(460, Math.floor(height*0.56)) },
        md: { w: Math.min(980,  Math.floor(width*0.76)), h: Math.min(560, Math.floor(height*0.66)) },
        lg: { w: Math.min(1100, Math.floor(width*0.86)), h: Math.min(620, Math.floor(height*0.76)) },
    };
    return presets[size];
}

function defaultModesRows(): ModeRow[] {
    // theo kết luận bạn cung cấp
    return [
        { key:'sun',   label:'Tự nhiên', leavesW4:'20 lá', heightW4:'20 cm', note:'Nhiều lá nhất' },
        { key:'led',   label:'LED',      leavesW4:'16 lá', heightW4:'24 cm', note:'Trung gian' },
        { key:'mixed', label:'Hỗn hợp',  leavesW4:'12 lá', heightW4:'28 cm', note:'Chiều cao lớn nhất' },
    ];
}

function buildConclusionHTML(
    w:number, h:number,
    bullets: string[],
    modes: ModeRow[]
) {
    const bulletHTML = bullets.length
        ? `<ul class="cs-bullets">${bullets.map(li => `<li>${esc(li)}</li>`).join('')}</ul>`
        : '';

    const head = `
    <tr>
      <th>Chế độ ánh sáng</th>
      <th>Tuần 4 – Số lá</th>
      <th>Tuần 4 – Chiều cao</th>
      <th>Nhận xét</th>
    </tr>`;

    const body = modes.map((m,i) => `
    <tr class="${i%2?'odd':'even'}">
      <td><span class="cs-badge cs-${esc(m.key)}">${esc(m.label)}</span></td>
      <td class="cs-week"><span class="cs-week-inner">${esc(m.leavesW4)}</span></td>
      <td class="cs-week"><span class="cs-week-inner">${esc(m.heightW4)}</span></td>
      <td>${esc(m.note ?? '')}</td>
    </tr>
  `).join('');

    return `
  <div class="cs-wrapper" style="width:${w}px;height:${h}px;">
    ${bulletHTML}
    <div class="cs-scroll">
      <table class="cs-table">
        <colgroup>
          <col style="width: 28%">
          <col style="width: 20%">
          <col style="width: 20%">
          <col style="width: 32%">
        </colgroup>
        <thead>${head}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  </div>`;
}

function esc(s: string){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/** inject CSS riêng cho Conclusion (prefix cs-) */
let _cssInjected = false;
function injectStylesOnceConclusion(){
    if (_cssInjected) return; _cssInjected = true;
    const css = `
:root{
  --cs-border:#e5e7eb;
  --cs-head:#0f172a;
  --cs-sticky:#f8fafc;
  --cs-shadow:0 20px 40px rgba(2,6,23,.18);
}
.cs-wrapper { display:flex; flex-direction:column; gap:12px; }
.cs-bullets { margin:0 2px 8px 2px; padding-left:18px; color:#0f172a; }
.cs-bullets li { margin:4px 0; }

.cs-scroll { overflow:auto; max-height:100%; border:1px solid var(--cs-border); border-radius:12px; background:#fff; box-shadow:var(--cs-shadow); }
.cs-scroll::-webkit-scrollbar{ width:10px; height:10px; }
.cs-scroll::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:10px; }
.cs-scroll::-webkit-scrollbar-thumb:hover{ background:#94a3b8; }

.cs-table { border-collapse:separate; border-spacing:0; width:100%; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#111; }
.cs-table thead th {
  position: sticky; top: 0; z-index: 3;
  background: linear-gradient(180deg,#fff, #f8fafc);
  text-align:center; padding:10px 12px; border-bottom:1px solid var(--cs-border);
  font-weight:700; color: var(--cs-head);
}
.cs-table tbody td { padding:10px 12px; border-bottom:1px solid var(--cs-border); vertical-align:middle; }
.cs-table tbody tr.even { background: #fff; }
.cs-table tbody tr.odd  { background: #fafafa; }
.cs-table tbody tr:hover { background: #eef2ff; }

/* cells tuần: "khối giữa, 2 dòng bắt đầu thẳng nhau" */
.cs-table td.cs-week{ text-align:center; vertical-align:middle; }
.cs-table td.cs-week .cs-week-inner{
  display:inline-block; text-align:left; line-height:1.25; color:#0f172a;
  font-variant-numeric: tabular-nums;
}

/* badge chế độ */
.cs-badge{
  display:inline-block; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;
  border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a;
}
.cs-badge.cs-sun   { background:#fffbeb; border-color:#fde68a; color:#92400e; }
.cs-badge.cs-led   { background:#eff6ff; border-color:#bfdbfe; color:#1e40af; }
.cs-badge.cs-mixed { background:#f0fdf4; border-color:#bbf7d0; color:#166534; }
`;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}
