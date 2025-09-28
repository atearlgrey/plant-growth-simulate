import Phaser from 'phaser';

type Modes = 'sun' | 'led' | 'mixed';
type Cell = { leaves:number; height:number; width:number; heightPx:number; widthPx:number; image:string; };
type WeekEntry = { week:number; [plant:string]: any };
type GrowthData = { plants:string[]; lightModes:Modes[]; weeks:WeekEntry[] };

type ResultData = {
    returnTo?: string;
    title?: string;
    plant?: string;          // optional filter
    lightMode?: string;      // optional filter
    growthData?: GrowthData; // optional - truyền trực tiếp
    size?: 'sm' | 'md' | 'lg'; // optional: khổ panel cố định (sẽ bị override bởi auto-height)
};

export default class ResultScene extends Phaser.Scene {
    private returnTo?: string;
    private esc?: (e: KeyboardEvent) => void;

    constructor(){ super('ResultScene'); }

    preload() {
        if (!this.cache.json.exists('growthData')) {
            // thêm cache-buster nhẹ cho dev
            this.load.json('growthData', `./data/growth.json?v=${Date.now()}`);
        }
    }

    create(data: ResultData) {
        this.returnTo = data.returnTo;

        // ===== lấy dữ liệu
        const gd = data.growthData
            ?? (this.registry.get('growthData') as GrowthData | undefined)
            ?? (this.cache.json.get('growthData') as GrowthData | undefined);

        if (!gd) {
            console.warn('[ResultScene] growthData NOT FOUND');
        }

        const { columns, rows } = pivotToTable(gd, {
            includeWeek0: false,
            filterPlant: data.plant,
            filterMode: data.lightMode
        });

        // ===== popup size — auto theo số dòng để tránh khoảng trống
        const { width, height } = this.scale;

        const panelW = Math.min(820, Math.floor(width * 0.64)); // gọn ngang
        const ROW_H = 44;        // cao 1 dòng
        const HEADER_H = 44;     // cao header
        const TITLE_H = 48;      // tiêu đề + top spacing
        const PAD_TOP = 46;      // top padding tới bảng
        const PAD_BOTTOM = 12;   // bottom padding

        const rowsCount = Math.max(1, rows.length);
        const desiredH = TITLE_H + PAD_TOP + HEADER_H + rowsCount * ROW_H + PAD_BOTTOM;
        const panelH = Math.min(Math.max(320, desiredH), height - 80);

        // ===== overlay
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

        const title = data.title ?? 'Bảng kết quả thí nghiệm';
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

        injectStylesOnce();

        // ===== DOM: đẩy bảng lên & chiếm trọn chiều cao hữu ích
        const DOM_PAD_TOP = PAD_TOP;
        const DOM_PAD_BOTTOM = PAD_BOTTOM;
        const domTop = -panelH/2 + DOM_PAD_TOP;
        const domHeight = panelH - (DOM_PAD_TOP + DOM_PAD_BOTTOM);

        const dom = this.add.dom(0, domTop).createFromHTML(
            buildTableHTML(panelW - 40, domHeight, columns, rows.length ? rows : [
                { group:'(không có dữ liệu)', lightMode:'', w1:'', w2:'', w3:'', w4:'' }
            ])
        );
        dom.setOrigin(0.5,0);
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

/* ================== Helpers ================== */

function pivotToTable(
    gd: GrowthData | undefined,
    opts: { includeWeek0?: boolean; filterPlant?: string; filterMode?: string }
) {
    const includeWeek0 = !!opts.includeWeek0;

    const columns = [
        { key:'group',     label:'Nhóm cây' },
        { key:'lightMode', label:'Chế độ ánh sáng' },
        { key:'w1', label:'Tuần 1' },
        { key:'w2', label:'Tuần 2' },
        { key:'w3', label:'Tuần 3' },
        { key:'w4', label:'Tuần 4' }
    ];
    const rows: Record<string,string>[] = [];
    if (!gd?.plants?.length || !gd?.lightModes?.length || !gd?.weeks?.length) {
        return { columns, rows };
    }

    const plantFilter = normalizePlantOrNull(opts.filterPlant);
    const modeFilter  = normalizeModeOrNull(opts.filterMode);

    const plants = plantFilter ? gd.plants.filter(p => p === plantFilter) : gd.plants;
    const modes  = modeFilter  ? gd.lightModes.filter(m => m === modeFilter) : gd.lightModes;

    const rowMap = new Map<string, Record<string,string>>();
    for (const plant of plants) {
        for (const mode of modes) {
            const k = `${plant}|${mode}`;
            rowMap.set(k, {
                group: prettyPlant(plant),
                groupKey: plant,
                lightMode: prettyMode(mode),
                modeKey: mode,
                w1:'', w2:'', w3:'', w4:''
            } as any);
        }
    }

    const weeksSorted = [...gd.weeks].sort((a,b) => a.week - b.week);
    for (const w of weeksSorted) {
        const wn = Number(w.week);
        if (!includeWeek0 && wn === 0) continue;
        if (wn < 1 || wn > 4) continue;

        for (const plant of plants) {
            const plantObj = (w as any)[plant];
            if (!plantObj) continue;

            for (const mode of modes) {
                const cell: Cell | undefined = plantObj[mode];
                if (!cell) continue;

                const k = `${plant}|${mode}`;
                const row = rowMap.get(k);
                if (!row) continue;

                const htmlText = formatCell(Number.parseInt((cell.heightPx / 6.5).toFixed(0)), cell.leaves); // có <br/>
                if (wn === 1) (row as any).w1 = htmlText;
                if (wn === 2) (row as any).w2 = htmlText;
                if (wn === 3) (row as any).w3 = htmlText;
                if (wn === 4) (row as any).w4 = htmlText;
            }
        }
    }

    rowMap.forEach(v => rows.push(v));
    rows.sort((a:any,b:any) => (a.group+a.lightMode).localeCompare(b.group+b.lightMode));
    return { columns, rows };
}

function formatCell(height?: number, leaves?: number) {
    const h = height == null ? '' : `${height} cm`;
    const l = leaves == null ? '' : `${leaves} lá`;
    if (!h && !l) return '';
    return `${h}${h && l ? '<br/>' : ''}${l}`;
}

function prettyPlant(p: string) {
    // bạn có thể đổi 'lettuce' -> 'Rau cải' nếu muốn
    const map: Record<string,string> = { 'lettuce':'Rau cải', 'morning-glory':'Rau muống' };
    return map[p] ?? p;
}
function prettyMode(m: string) {
    const map: Record<string,string> = { 'sun':'Tự nhiên', 'led':'LED', 'mixed':'Hỗn hợp' };
    return map[m] ?? m;
}

// alias
function normalizePlantOrNull(plant?: string): string | null {
    if (!plant) return null;
    const p = plant.trim();
    const aliases: Record<string,string> = {
        'morningglory': 'morning-glory',
        'morning_glory': 'morning-glory',
        'rau muống': 'morning-glory',
        'rau muong': 'morning-glory',
        'raumuong': 'morning-glory',
        'rau cải': 'lettuce',
        'rau cai': 'lettuce',
        'raucai': 'lettuce'
    };
    const key = p.toLowerCase().replace(/[\s_]/g,'');
    return aliases[key] ?? p;
}
function normalizeModeOrNull(mode?: string): Modes | null {
    if (!mode) return null;
    const m = mode.trim().toLowerCase();
    if (m === 'sun' || m === 'tự nhiên' || m === 'natural' || m === 'tu nhien') return 'sun';
    if (m === 'led') return 'led';
    if (m === 'mixed' || m === 'hỗn hợp' || m === 'hon hop') return 'mixed';
    return null;
}

function buildTableHTML(
    w:number, h:number,
    columns:{key:string;label:string}[],
    rows:Record<string,string>[]
) {
    const head = columns.map(c => `<th>${esc(c.label)}</th>`).join('');

    const body = rows.map((r,i) => `
    <tr class="${i%2?'odd':'even'}">
      ${columns.map(c => {
        if (c.key === 'lightMode') {
            const modeKey = (r as any).modeKey || '';
            return `<td><span class="rs-badge rs-${esc(modeKey)}">${esc(r[c.key] ?? '')}</span></td>`;
        }
        if (c.key === 'w1' || c.key === 'w2' || c.key === 'w3' || c.key === 'w4') {
            // dùng inner để khối giữa, text trái & cùng điểm bắt đầu
            return `<td class="rs-week"><span class="rs-week-inner">${(r as any)[c.key] ?? ''}</span></td>`;
        }
        return `<td>${esc(r[c.key] ?? '')}</td>`;
    }).join('')}
    </tr>`).join('');

    return `
    <div class="rs-wrapper" style="width:${w}px;height:${h}px;">
      <div class="rs-scroll">
        <table class="rs-table">
          <colgroup>
            <col style="width: 26%">
            <col style="width: 18%">
            <col style="width: 14%">
            <col style="width: 14%">
            <col style="width: 14%">
            <col style="width: 14%">
          </colgroup>
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>
  `;
}

function esc(s:string){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

let _cssInjected = false;
function injectStylesOnce() {
    if (_cssInjected) return; _cssInjected = true;
    const css = `
:root{
  --rs-bg:#ffffff;
  --rs-head:#0f172a;
  --rs-sub:#475569;
  --rs-border:#e5e7eb;
  --rs-row:#0b12201a;
  --rs-row-hover:#eef2ff;
  --rs-sticky:#f8fafc;
  --rs-shadow:0 20px 40px rgba(2,6,23,.18);
}

.rs-wrapper { display:flex; flex-direction:column; gap:12px; height:100%; }
.rs-scroll  { overflow:auto; max-height:100%; border:1px solid var(--rs-border); border-radius:12px; background:var(--rs-bg); box-shadow:var(--rs-shadow); }

/* Scrollbar (webkit) */
.rs-scroll::-webkit-scrollbar{ width:10px; height:10px; }
.rs-scroll::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:10px; }
.rs-scroll::-webkit-scrollbar-thumb:hover{ background:#94a3b8; }
.rs-scroll::-webkit-scrollbar-track{ background:transparent; }

.rs-table { border-collapse:separate; border-spacing:0; width:100%; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#111; }
.rs-table thead th {
  position: sticky; top: 0; z-index: 3;
  background: linear-gradient(180deg,#fff, #f8fafc);
  text-align:center; padding:10px 12px; border-bottom:1px solid var(--rs-border);
  font-weight:700; color: var(--rs-head);
}
.rs-table tbody td { padding:10px 12px; border-bottom:1px solid var(--rs-border); vertical-align:middle; }
.rs-table tbody tr.even { background: #fff; }
.rs-table tbody tr.odd  { background: #fafafa; }
.rs-table tbody tr:hover { background: var(--rs-row-hover); }

/* Sticky first column */
.rs-table thead th:first-child,
.rs-table tbody td:first-child {
  position: sticky; left: 0; z-index: 2;
  background: var(--rs-sticky);
  text-align:left;
  box-shadow: 1px 0 0 var(--rs-border);
}

/* Second column align left */
.rs-table thead th:nth-child(2), .rs-table tbody td:nth-child(2) { text-align:left; }

/* Week cell: khối giữa, nội dung trái, số thẳng cột */
.rs-table td.rs-week{ text-align:center; vertical-align:middle; padding:10px 12px; }
.rs-table td.rs-week .rs-week-inner{
  display:inline-block; text-align:left; line-height:1.25; color:#0f172a;
  font-variant-numeric: tabular-nums;
}

/* Badge chế độ ánh sáng */
.rs-badge{
  display:inline-block; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;
  border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a;
}
.rs-badge.rs-sun   { background:#fffbeb; border-color:#fde68a; color:#92400e; }
.rs-badge.rs-led   { background:#eff6ff; border-color:#bfdbfe; color:#1e40af; }
.rs-badge.rs-mixed { background:#f0fdf4; border-color:#bbf7d0; color:#166534; }
`;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Optional: close qua sự kiện DOM
    window.addEventListener('rs-close', () => {
        const game = (window as any).Phaser?.GAMES?.[0];
        const scene = game?.scene?.getScene?.('ResultScene');
        if (scene) (scene as ResultScene)['close']();
    });
}
