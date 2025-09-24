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
};

export default class ResultScene extends Phaser.Scene {
    private returnTo?: string;
    private esc?: (e: KeyboardEvent) => void;

    constructor(){ super('ResultScene'); }

    preload() {
        if (!this.cache.json.exists('growthData')) {
            this.load.json('growthData', './data/growth.json'); // ✅ KHÔNG dùng ./data/... thô
        }
    }

    create(data: ResultData) {
        this.returnTo = data.returnTo;

        // Lấy data: ưu tiên param -> registry -> cache
        const gd = data.growthData
            ?? (this.registry.get('growthData') as GrowthData | undefined)
            ?? (this.cache.json.get('growthData') as GrowthData | undefined);

        if (!gd) {
            console.warn('[ResultScene] growthData NOT FOUND');
        } else {
            console.log('[ResultScene] growthData OK:', gd);
        }

        const { columns, rows } = pivotToTable(gd, {
            includeWeek0: false,
            filterPlant: data.plant,
            filterMode: data.lightMode
        });
        console.log('[ResultScene] filters=', data.plant, data.lightMode, 'rows=', rows.length);

        // ===== vẽ popup
        const { width, height } = this.scale;
        const panelW = Math.min(1100, width - 80);
        const panelH = Math.min(620,  height - 80);

        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.45)
            .setInteractive()
            .on('pointerdown', () => this.close());

        const container = this.add.container(width/2, height/2);
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1).fillRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 16);
        g.lineStyle(1, 0xe5e7eb, 1).strokeRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 16);
        container.add(g);

        const title = data.title ?? 'Bảng kết quả thí nghiệm';
        container.add(
            this.add.text(0, -panelH/2 + 18, title,
                { fontFamily:'Arial, Helvetica, sans-serif', fontSize:'20px', color:'#111', fontStyle:'bold' }
            ).setOrigin(0.5,0)
        );

        const close = this.add.text(panelW/2 - 24, -panelH/2 + 12, '✕',
            { fontFamily:'Arial, Helvetica, sans-serif', fontSize:'18px', color:'#666' }
        ).setOrigin(0.5,0).setInteractive({useHandCursor:true});
        close.on('pointerup', () => this.close());
        container.add(close);

        injectStylesOnce();
        const domTop = -panelH/2 + 52;
        const dom = this.add.dom(0, domTop).createFromHTML(
            buildTableHTML(panelW - 40, panelH - 100, columns, rows.length ? rows : [
                { group:'(không có dữ liệu)', lightMode:'', w1:'', w2:'', w3:'', w4:'' }
            ])
        );
        dom.setOrigin(0.5,0);
        container.add(dom);

        this.esc = (e: KeyboardEvent) => { if (e.key === 'Escape') this.close(); };
        window.addEventListener('keydown', this.esc);
    }

    private close() {
        if (this.esc) window.removeEventListener('keydown', this.esc);
        if (this.returnTo) this.scene.resume(this.returnTo);
        this.scene.stop();
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
            rowMap.set(k, { group: prettyPlant(plant), lightMode: prettyMode(mode), w1:'', w2:'', w3:'', w4:'' });
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

                const text = formatCell(cell.height, cell.leaves);
                if (wn === 1) row.w1 = text;
                if (wn === 2) row.w2 = text;
                if (wn === 3) row.w3 = text;
                if (wn === 4) row.w4 = text;
            }
        }
    }

    rowMap.forEach(v => rows.push(v));
    rows.sort((a,b) => (a.group+a.lightMode).localeCompare(b.group+b.lightMode));
    return { columns, rows };
}

function formatCell(height?: number, leaves?: number) {
    const h = (height ?? '') === '' ? '' : `${height} cm`;
    const l = (leaves ?? '') === '' ? '' : `${leaves} lá`;
    return h && l ? `${h} / ${l}` : (h || l || '');
}

function prettyPlant(p: string) {
    const map: Record<string,string> = { 'lettuce':'Rau riếp', 'morning-glory':'Rau muống' };
    return map[p] ?? p;
}
function prettyMode(m: string) {
    const map: Record<string,string> = { 'sun':'Tự nhiên', 'led':'LED', 'mixed':'Hỗn hợp' };
    return map[m] ?? m;
}

// ✅ chấp nhận alias như morningGlory, Natural...
function normalizePlantOrNull(plant?: string): string | null {
    if (!plant) return null;
    const p = plant.trim();
    const aliases: Record<string,string> = {
        'morningglory': 'morning-glory',
        'morning_glory': 'morning-glory',
        'rau muống': 'morning-glory',
        'rau muong': 'morning-glory',
        'raumuong': 'morning-glory',
        'rau riếp': 'lettuce',
        'rau riep': 'lettuce',
        'rauriep': 'lettuce'
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
      ${columns.map(c => `<td>${esc(r[c.key] ?? '')}</td>`).join('')}
    </tr>`).join('');
    return `
    <div class="rs-wrapper" style="width:${w}px;height:${h}px;">
      <div class="rs-scroll">
        <table class="rs-table">
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>
    <script>
      const btn = document.getElementById('rs-close');
      if (btn) btn.onclick = () => window.dispatchEvent(new CustomEvent('rs-close'));
    </script>
  `;
}
function esc(s:string){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

let _cssInjected = false;
function injectStylesOnce() {
    if (_cssInjected) return; _cssInjected = true;
    const css = `
    .rs-wrapper { display:flex; flex-direction:column; gap:12px; }
    .rs-scroll { overflow:auto; max-height:100%; border:1.5px solid #000; }
    .rs-table { border-collapse:collapse; width:100%; font-family:Arial,Helvetica,sans-serif; font-size:14px; }
    .rs-table thead th { position:sticky; top:0; background:#f8f9fb; text-align:center; padding:8px 10px; border:2px solid #000; }
    .rs-table tbody td { padding:8px 10px; border:2px solid #000; }
    .rs-table thead th:first-child, .rs-table tbody td:first-child { text-align:left; }
    .rs-table thead th:nth-child(2), .rs-table tbody td:nth-child(2) { text-align:left; }
    .rs-actions { display:flex; justify-content:flex-end; margin-top:8px; }
    .rs-btn { padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer; }
    .rs-btn:hover { background:#f8fafc; }
  `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    window.addEventListener('rs-close', () => {
        const game = (window as any).Phaser?.GAMES?.[0];
        const scene = game?.scene?.getScene?.('ResultScene');
        if (scene) (scene as ResultScene)['close']();
    });
}
