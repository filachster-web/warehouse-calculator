import { useState, useMemo } from "react";

// ─── UI primitives ────────────────────────────────────────────────────────────
const Section = ({ title, children, accent = "blue" }: any) => {
  const colors: Record<string, string> = {
    blue: "border-blue-400", green: "border-green-500",
    amber: "border-amber-500", red: "border-red-400",
    purple: "border-purple-400", teal: "border-teal-400",
    orange: "border-orange-400",
  };
  return (
    <div className={`border-l-4 ${colors[accent] ?? colors.blue} pl-4 mb-6`}>
      <div className="font-medium text-base mb-3">{title}</div>
      {children}
    </div>
  );
};

const Row = ({ label, value, unit = "", highlight = false, sub = false }: any) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-gray-100 text-sm ${highlight ? "font-medium" : ""}`}>
    <span className={sub ? "text-gray-400 pl-3" : "text-gray-600"}>{label}</span>
    <span className={`${highlight ? "text-blue-700" : ""} tabular-nums`}>
      {value} <span className="text-gray-400 text-xs">{unit}</span>
    </span>
  </div>
);

const Formula = ({ children }: any) => (
  <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 my-3 leading-relaxed border border-gray-200 whitespace-pre">
    {children}
  </div>
);

const Note = ({ children, type = "info" }: any) => {
  const styles: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-xs my-3 leading-relaxed ${styles[type] ?? styles.info}`}>
      {children}
    </div>
  );
};

const Slider = ({ label, min, max, step, value, onChange, unit = "", hint = "" }: any) => (
  <div className="mb-4">
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value} <span className="text-gray-400 text-xs">{unit}</span></span>
    </div>
    {hint && <div className="text-xs text-gray-400 mb-1">{hint}</div>}
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e: any) => onChange(Number(e.target.value))}
      className="w-full accent-blue-500" />
    <div className="flex justify-between text-xs text-gray-300 mt-0.5">
      <span>{min}</span><span>{max}</span>
    </div>
  </div>
);

const ProgressBar = ({ value, max, color = "bg-blue-500", label = "" }: any) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct > 90 ? "bg-red-500" : pct > 85 ? "bg-amber-500" : color;
  return (
    <div className="my-2">
      {label && <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span>{pct}%</span></div>}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function WarehouseCalculator() {
  const [tab, setTab] = useState(0);
  const tabs = ["Ёмкость", "Паллето-места", "Доки", "Зонирование", "Пикинг", "Упаковка", "KPI"];

  // ── Здание ──
  const [bldgL, setBldgL] = useState(150);
  const [bldgW, setBldgW] = useState(90);
  const [aOffice, setAOffice] = useState(400);
  const [aDocks, setADocks] = useState(800);
  const [aStaging, setAStaging] = useState(600);
  const [aSanitary, setASanitary] = useState(150);
  const [aTech, setATech] = useState(350);
  const [hObstacle, setHObstacle] = useState(10.0);
  const [hGap, setHGap] = useState(500);
  const [hRackMax, setHRackMax] = useState(9.5);
  const [kFill, setKFill] = useState(85);

  // ── Паллето-места ──
  const [rackType, setRackType] = useState<"wide" | "reach" | "vna">("reach");
  const [palletH, setPalletH] = useState(1.6);
  const [avgInventoryUnits, setAvgInventoryUnits] = useState(50000);
  const [unitsPerPallet, setUnitsPerPallet] = useState(100);
  const [kSafetyStock, setKSafetyStock] = useState(120);

  // ── Доки ──
  const [trucksPerDay, setTrucksPerDay] = useState(30);
  const [tService, setTService] = useState(1.5);
  const [hShift, setHShift] = useState(8);
  const [uDock, setUDock] = useState(75);
  const [avgPalletsPerTruck, setAvgPalletsPerTruck] = useState(25);

  // ── Пикинг ──
  const [ordersPerDay, setOrdersPerDay] = useState(5000);
  const [linesPerOrder, setLinesPerOrder] = useState(3);
  const [pickTech, setPickTech] = useState<"paper" | "rf" | "voice" | "ptl">("rf");
  const [pickShift, setPickShift] = useState(8);
  const [uLabor, setULabor] = useState(85);

  // ── Упаковка ──
  const [ctPack, setCtPack] = useState(60);
  const [packShift, setPackShift] = useState(8);
  const [uPackLabor, setUPackLabor] = useState(85);

  // ── Тип склада ──
  const [warehouseType, setWarehouseType] = useState<"classic" | "ecomm">("ecomm");

  const pickingRates = { paper: 70, rf: 100, voice: 120, ptl: 275 };
  const pickRate = pickingRates[pickTech];

  const sqmPerPallet = { wide: 2.75, reach: 2.0, vna: 1.4 };
  const sqmPP = sqmPerPallet[rackType];

  // ── Все расчёты ──
  const calc = useMemo(() => {
    // Ёмкость
    const sGross = bldgL * bldgW;
    const sNonStorage = aOffice + aDocks + aStaging + aSanitary + aTech;
    const sUsable = Math.max(0, sGross - sNonStorage);
    const usablePct = sGross > 0 ? (sUsable / sGross) * 100 : 0;
    const hStackFromObst = hObstacle - hGap / 1000;
    const hStack = Math.min(hStackFromObst, hRackMax);
    const limitedBy = hStackFromObst <= hRackMax ? "спринклер/балка" : "стеллаж";
    const vTheoretical = sUsable * hStack;
    const vWorking = vTheoretical * (kFill / 100);

    // Паллето-места
    const vPalletPos = 0.8 * 1.2 * palletH;
    const nPalletFromVolume = Math.floor(vWorking / vPalletPos);
    const nPalletFromArea = Math.floor(sUsable / sqmPP);
    const nPalletRequired = Math.ceil(
      (avgInventoryUnits * kSafetyStock / 100) / (unitsPerPallet * 0.85)
    );

    // Доки
    const nDocksRaw = (trucksPerDay * tService) / (hShift * (uDock / 100));
    const nDocks = Math.ceil(nDocksRaw);
    const simultTrucks = Math.ceil(trucksPerDay / hShift * tService);
    const stagingArea = simultTrucks * avgPalletsPerTruck * 0.8 * 1.2 * 2.0;

    // Зонирование
    const zonesClassic = [
      { name: "Резервное хранение", pct: 52, color: "bg-blue-400" },
      { name: "Комплектация и упаковка", pct: 17, color: "bg-green-400" },
      { name: "Приёмка и экспедиция", pct: 16, color: "bg-amber-400" },
      { name: "VAS услуги", pct: 7, color: "bg-purple-400" },
      { name: "Прочие зоны", pct: 8, color: "bg-gray-400" },
    ];
    const zonesEcomm = [
      { name: "Резервное хранение", pct: 40, color: "bg-blue-400" },
      { name: "Комплектация и упаковка", pct: 25, color: "bg-green-400" },
      { name: "Приёмка и экспедиция", pct: 12, color: "bg-amber-400" },
      { name: "VAS услуги", pct: 8, color: "bg-purple-400" },
      { name: "Реверсивная логистика", pct: 8, color: "bg-red-300" },
      { name: "Прочие зоны", pct: 7, color: "bg-gray-400" },
    ];
    const zones = (warehouseType === "classic" ? zonesClassic : zonesEcomm).map(z => ({
      ...z, area: Math.round(sGross * z.pct / 100),
    }));

    // Пикинг
    const linesPerDay = ordersPerDay * linesPerOrder;
    const linesPerPickerShift = pickRate * pickShift * (uLabor / 100);
    const nPickers = Math.ceil(linesPerDay / linesPerPickerShift);

    // Упаковка
    const nStationsRaw = (ordersPerDay * ctPack / 60) / (packShift * 60 * (uPackLabor / 100));
    const nStations = Math.ceil(nStationsRaw);

    return {
      sGross, sNonStorage, sUsable, usablePct,
      hStack, hStackFromObst, limitedBy,
      vTheoretical, vWorking,
      nPalletFromVolume, nPalletFromArea, nPalletRequired, vPalletPos,
      nDocksRaw, nDocks, stagingArea,
      zones,
      linesPerDay, linesPerPickerShift, nPickers,
      nStationsRaw, nStations,
    };
  }, [
    bldgL, bldgW, aOffice, aDocks, aStaging, aSanitary, aTech,
    hObstacle, hGap, hRackMax, kFill, palletH, sqmPP,
    avgInventoryUnits, unitsPerPallet, kSafetyStock,
    trucksPerDay, tService, hShift, uDock, avgPalletsPerTruck,
    ordersPerDay, linesPerOrder, pickRate, pickShift, uLabor,
    ctPack, packShift, uPackLabor, warehouseType,
  ]);

  const kpiGroups = [
    {
      title: "Качество и точность учёта", accent: "blue",
      items: [
        { name: "IRA (точность запасов)", bench: "≥ 99,9%", crit: "< 98% = кризис" },
        { name: "Pick Accuracy", bench: "≥ 99,9%", crit: "< 99,5% = критично" },
        { name: "Damage Rate", bench: "≤ 0,1%", crit: "> 0,5% = критично" },
        { name: "Точность приёмки", bench: "≥ 99,5%", crit: "< 98% = критично" },
      ],
    },
    {
      title: "Уровень сервиса и скорость", accent: "green",
      items: [
        { name: "OTIF (вовремя и полностью)", bench: "≥ 98%", crit: "< 95%" },
        { name: "Order Cycle Time", bench: "≤ 2–4 ч (same-day)", crit: "> 24 ч" },
        { name: "Dock-to-Stock Time", bench: "≤ 4–24 ч", crit: "> 48 ч" },
        { name: "Returns Processing Time", bench: "≤ 24–48 ч", crit: "> 72 ч" },
        { name: "Fill Rate", bench: "≥ 98%", crit: "< 95%" },
      ],
    },
    {
      title: "Производительность труда", accent: "amber",
      items: [
        { name: "Пикинг (ручной, RF)", bench: "80–150 строк/ч", crit: "< 60" },
        { name: "Пикинг (Goods-to-Person)", bench: "400–800 строк/ч", crit: "" },
        { name: "Упаковка", bench: "20–40 заказов/ч", crit: "< 15" },
        { name: "Приёмка", bench: "15–25 паллет/ч", crit: "< 10" },
        { name: "Удельная выработка (ручная)", bench: "0,5–2,0 зак/м²/день", crit: "" },
        { name: "Удельная выработка (AS/RS)", bench: "2,0–8,0 зак/м²/день", crit: "" },
      ],
    },
    {
      title: "Использование пространства", accent: "teal",
      items: [
        { name: "Warehouse Utilization Rate", bench: "75–85%", crit: "> 90% = кризис" },
        { name: "Space Utilization (куб.)", bench: "≤ 85%", crit: "> 90%" },
        { name: "Cube Utilization per Pallet", bench: "65–80%", crit: "" },
        { name: "Inventory Turnover (FMCG)", bench: "20–50×/год", crit: "" },
        { name: "Inventory Turnover (Fashion)", bench: "4–8×/год", crit: "" },
      ],
    },
    {
      title: "Экономические показатели", accent: "purple",
      items: [
        { name: "CPO — стоимость заказа (ручной)", bench: "$3–8 / заказ", crit: "> $12" },
        { name: "CPO — стоимость заказа (автоматиз.)", bench: "$1,5–4 / заказ", crit: "" },
        { name: "Хранение паллеты / мес.", bench: "$15–35 / паллета", crit: "" },
        { name: "Стоимость строки (пикинг)", bench: "$0,30–1,20 / строка", crit: "" },
        { name: "EBITDA margin 3PL", bench: "8–15%", crit: "< 5%" },
        { name: "Labor Cost % Revenue", bench: "45–60%", crit: "> 70%" },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 text-sm">

      {/* Header */}
      <div className="mb-5">
        <div className="text-xl font-semibold mb-1">Калькулятор 3PL / Фулфилмент-центра</div>
        <div className="text-xs text-gray-400">Комплексный расчёт по методологии SLP (Systematic Layout Planning, Мьюзер)</div>
      </div>

      {/* Тип склада */}
      <div className="flex gap-2 mb-5">
        {([["classic", "Классический РЦ"], ["ecomm", "E-commerce фулфилмент"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setWarehouseType(k)}
            className={`px-4 py-2 rounded-lg text-xs border transition-colors ${warehouseType === k ? "bg-blue-600 text-white border-blue-600 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Сводные карточки */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { l: "S полезная", v: Math.round(calc.sUsable).toLocaleString(), u: "м²", c: "bg-blue-50" },
          { l: "Паллето-мест", v: calc.nPalletFromArea.toLocaleString(), u: "шт", c: "bg-green-50" },
          { l: "Доков", v: calc.nDocks, u: "шт", c: "bg-amber-50" },
          { l: "V рабочий", v: Math.round(calc.vWorking).toLocaleString(), u: "м³", c: "bg-purple-50" },
          { l: "Строк/день", v: calc.linesPerDay.toLocaleString(), u: "стр", c: "bg-red-50" },
          { l: "Пикеров/смену", v: calc.nPickers, u: "чел", c: "bg-teal-50" },
          { l: "Станций упак.", v: calc.nStations, u: "шт", c: "bg-orange-50" },
          { l: "Утилизация", v: `${Math.round(calc.usablePct)}%`, u: "", c: calc.usablePct >= 75 ? "bg-green-50" : "bg-amber-50" },
        ].map(({ l, v, u, c }) => (
          <div key={l} className={`rounded-lg p-3 ${c} border border-gray-100`}>
            <div className="text-xs text-gray-500 mb-1">{l}</div>
            <div className="text-base font-medium tabular-nums">{v} <span className="text-xs font-normal text-gray-400">{u}</span></div>
          </div>
        ))}
      </div>

      {/* Табы */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${tab === i ? "bg-blue-50 border-blue-300 text-blue-700 font-medium" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 0 — ЁМКОСТЬ
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 0 && (
        <div>
          <Section title="Ф1 — Площадь брутто" accent="blue">
            <Formula>{"S_gross = L × W"}</Formula>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Slider label="Длина здания (L)" min={50} max={500} step={5} value={bldgL} onChange={setBldgL} unit="м" hint="Типовые склады: 60–300 м" />
              <Slider label="Ширина здания (W)" min={30} max={200} step={5} value={bldgW} onChange={setBldgW} unit="м" hint="Типовые склады: 48–120 м" />
            </div>
            <Row label="S_gross = L × W" value={calc.sGross.toLocaleString()} unit="м²" highlight />
            <Note type="info">
              <strong>Типовые соотношения сторон:</strong><br />
              • Универсальный склад: L/W = 1,5–2,5<br />
              • Кросс-докинг: L/W ≥ 3,0 (максимальный доковый фронт)<br />
              • E-commerce фулфилмент: L/W ≈ 1,2–1,8 (компактность, близость зон)<br />
              <strong>Текущее соотношение: {(bldgL / bldgW).toFixed(2)}</strong>
            </Note>
          </Section>

          <Section title="Ф2 — Полезная площадь хранения" accent="green">
            <Formula>{"S_usable = S_gross − S_non_storage"}</Formula>
            <Slider label="Административные офисы" min={0} max={2000} step={50} value={aOffice} onChange={setAOffice} unit="м²" hint="0,5–2,0 м² на сотрудника управления" />
            <Slider label="Доковая зона (доки + пандусы)" min={200} max={3000} step={50} value={aDocks} onChange={setADocks} unit="м²" hint="≈ 50–80 м² на 1 доковое место" />
            <Slider label="Буферные зоны (staging areas)" min={100} max={3000} step={50} value={aStaging} onChange={setAStaging} unit="м²" hint="Глубина буфера: 9–12 м × ширина доков" />
            <Slider label="Санузлы, комнаты отдыха" min={50} max={500} step={25} value={aSanitary} onChange={setASanitary} unit="м²" hint="≥ 1 кабинка + 1 умывальник на 20–30 чел." />
            <Slider label="Техпомещения (зарядная, серверная)" min={50} max={1000} step={25} value={aTech} onChange={setATech} unit="м²" hint="Зарядная АКБ: 0,5–1,0 м² на 1 единицу ПТО" />

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Row label="S_gross" value={calc.sGross.toLocaleString()} unit="м²" />
              <Row label="− Офисы" value={aOffice} unit="м²" sub />
              <Row label="− Доковая зона" value={aDocks} unit="м²" sub />
              <Row label="− Буферные зоны" value={aStaging} unit="м²" sub />
              <Row label="− Санузлы / отдых" value={aSanitary} unit="м²" sub />
              <Row label="− Техпомещения" value={aTech} unit="м²" sub />
              <Row label="= S_non_storage (итого)" value={calc.sNonStorage.toLocaleString()} unit="м²" />
              <Row label="= S_usable (полезная площадь)" value={Math.round(calc.sUsable).toLocaleString()} unit="м²" highlight />
            </div>
            <ProgressBar value={calc.sUsable} max={calc.sGross} label={`Доля полезной площади: ${Math.round(calc.usablePct)}% от брутто`} color="bg-green-500" />
            <Note type={calc.usablePct >= 75 ? "success" : calc.usablePct >= 65 ? "warning" : "danger"}>
              {calc.usablePct >= 75
                ? "✅ Хорошо спроектированный склад — минимум «мёртвых» зон (>75%)"
                : calc.usablePct >= 65
                ? "⚠️ Норма для складов с большим доковым фронтом и мезонинами (65–75%)"
                : "🔴 Избыток нескладских помещений — потенциал оптимизации (<65%)"}
            </Note>
          </Section>

          <Section title="Ф3 — Высота штабелирования" accent="amber">
            <Formula>{"H_stack = H_clearance − H_safety_gap\nH_stack_eff = min(H_stack, H_rack_max)"}</Formula>
            <Slider label="Высота до нижнего препятствия H_clearance" min={4} max={20} step={0.1} value={hObstacle} onChange={setHObstacle} unit="м" hint="Спринклер, балка, HVAC — берётся минимальная из всех" />
            <Slider label="Зазор безопасности H_safety_gap" min={300} max={900} step={25} value={hGap} onChange={setHGap} unit="мм" hint="ANSI/NFPA 13: 457 мм · VDI 3564-1: 600 мм" />
            <Slider label="Макс. высота стеллажа H_rack_max" min={3} max={40} step={0.5} value={hRackMax} onChange={setHRackMax} unit="м" hint="Ричтрак: 8–12 м · AS/RS: до 40 м" />

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Row label="H_clearance" value={hObstacle.toFixed(1)} unit="м" />
              <Row label="− H_safety_gap" value={hGap} unit="мм" sub />
              <Row label="H_stack (до препятствия − зазор)" value={calc.hStackFromObst.toFixed(2)} unit="м" />
              <Row label="H_rack_max (ограничение стеллажа)" value={hRackMax.toFixed(1)} unit="м" />
              <Row label={`H_stack_eff (лимитирует: ${calc.limitedBy})`} value={calc.hStack.toFixed(2)} unit="м" highlight />
            </div>
          </Section>

          <Section title="Ф4–5 — Теоретический и рабочий объём" accent="purple">
            <Formula>{"V_theoretical = S_usable × H_stack_eff\nV_working    = V_theoretical × K_fill  (K_fill ≤ 0,85)"}</Formula>
            <Slider label="Коэффициент заполнения K_fill" min={60} max={100} step={1} value={kFill} onChange={setKFill} unit="%"
              hint="Отраслевой норматив: не выше 85%. Выше 90% — операционный кризис." />
            <ProgressBar value={kFill} max={100}
              label={`K_fill = ${kFill}% ${kFill > 90 ? "⚠ КРИТИЧНО" : kFill > 85 ? "⚠ Превышение нормы" : "✓ В норме"}`}
              color="bg-purple-500" />

            <Row label="S_usable" value={Math.round(calc.sUsable).toLocaleString()} unit="м²" />
            <Row label="× H_stack_eff" value={calc.hStack.toFixed(2)} unit="м" sub />
            <Row label="= V_theoretical" value={Math.round(calc.vTheoretical).toLocaleString()} unit="м³" />
            <Row label={`× K_fill (${kFill}%)`} value={`${kFill / 100}`} sub />
            <Row label="= V_working (рабочая ёмкость)" value={Math.round(calc.vWorking).toLocaleString()} unit="м³" highlight />

            {kFill > 90 && (
              <Note type="danger">
                <strong>⚠ Критическое заполнение ({kFill}%)!</strong> Проходы блокируются, техника теряет
                манёвренность, трудозатраты растут экспоненциально (эффект «пятнашек»).
              </Note>
            )}
            {kFill > 85 && kFill <= 90 && (
              <Note type="warning">
                Превышение рекомендуемого порога. Допустимо кратковременно (пиковая сезонность),
                но не как постоянное состояние.
              </Note>
            )}
            {kFill <= 85 && (
              <Note type="info">
                Норма. Оставшиеся {100 - kFill}% — операционный буфер для сортировки, манёврирования
                и сезонных всплесков.
              </Note>
            )}
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1 — ПАЛЛЕТО-МЕСТА
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 1 && (
        <div>
          <Section title="Расчёт из площади (нормативный метод)" accent="blue">
            <Formula>{"N_pallet = S_usable / S_per_pallet_position\n\nОтраслевые нормативы:\n  Вилочный погрузчик (3,5–4,0 м проход):  2,5–3,0 м²/пп\n  Ричтрак (2,7–3,0 м проход):             1,8–2,2 м²/пп\n  VNA-штабелер (1,7–1,9 м проход):        1,3–1,5 м²/пп"}</Formula>

            <div className="flex gap-2 mb-4 flex-wrap">
              {([
                ["wide", "Вилочный погрузчик", "2,75 м²/пп"],
                ["reach", "Ричтрак", "2,0 м²/пп"],
                ["vna", "VNA-штабелер", "1,4 м²/пп"],
              ] as const).map(([k, lbl, sub]) => (
                <button key={k} onClick={() => setRackType(k)}
                  className={`px-3 py-2 rounded-lg text-xs border text-left ${rackType === k ? "bg-blue-50 border-blue-300 text-blue-800 font-medium" : "border-gray-200 text-gray-500"}`}>
                  {lbl}<br /><span className="text-gray-400">{sub}</span>
                </button>
              ))}
            </div>

            <Row label="S_usable" value={Math.round(calc.sUsable).toLocaleString()} unit="м²" />
            <Row label={`Норматив (${sqmPP} м²/пп)`} value={sqmPP} unit="м²/пп" sub />
            <Row label="N_pallet (из площади)" value={calc.nPalletFromArea.toLocaleString()} unit="пп" highlight />

            <Note type="info">
              <strong>Выгода VNA:</strong> переход с ричтрака на VNA-штабелер даёт +25–50% паллето-мест
              без расширения здания при CAPEX на узкопроходную технику и направляющие.
            </Note>
          </Section>

          <Section title="Расчёт по запасам (потребностный метод)" accent="green">
            <Formula>{"N_required = (Avg_inventory × K_safety) /\n              (Units_per_pallet × K_fill_rack)\n\nгде K_fill_rack = 0,85"}</Formula>

            <Slider label="Средний запас (единиц)" min={1000} max={15000000} step={10000} value={avgInventoryUnits} onChange={setAvgInventoryUnits} unit="ед" />
            <Slider label="Единиц на паллету" min={10} max={500} step={5} value={unitsPerPallet} onChange={setUnitsPerPallet} unit="ед/пп" hint="Зависит от габаритов и веса товара" />
            <Slider label="Страховой запас K_safety" min={100} max={200} step={5} value={kSafetyStock} onChange={setKSafetyStock} unit="%" hint="Норма: 115–125% (×1,15–1,25 к среднему запасу)" />
            <Slider label="Высота паллеты с товаром" min={0.8} max={2.5} step={0.05} value={palletH} onChange={setPalletH} unit="м" hint="Стандарт: 1,4–1,8 м (поддон 144 мм + товар)" />

            <Row label="Требуемых паллето-мест" value={calc.nPalletRequired.toLocaleString()} unit="пп" highlight />
            <Row label="Доступных паллето-мест" value={calc.nPalletFromArea.toLocaleString()} unit="пп" />
            <Row label="Из рабочего объёма V_working" value={calc.nPalletFromVolume.toLocaleString()} unit="пп" sub />

            <Note type={calc.nPalletFromArea >= calc.nPalletRequired ? "success" : "danger"}>
              {calc.nPalletFromArea >= calc.nPalletRequired
                ? `✅ Ёмкость достаточна: свободный буфер ${(calc.nPalletFromArea - calc.nPalletRequired).toLocaleString()} пп (+${Math.round((calc.nPalletFromArea / calc.nPalletRequired - 1) * 100)}%)`
                : `⚠️ Дефицит ёмкости: не хватает ${(calc.nPalletRequired - calc.nPalletFromArea).toLocaleString()} пп. Рассмотрите VNA, мезонин или AS/RS.`}
            </Note>
          </Section>

          <Section title="Стратегии максимизации ёмкости" accent="amber">
            <div className="space-y-2 mt-2">
              {[
                { method: "Переход с широких проходов на VNA", gain: "+25–50% пп", invest: "Высокие" },
                { method: "Многоярусные мезонины в зоне пикинга", gain: "×2–3 площади", invest: "Средние" },
                { method: "AS/RS (AutoStore, Shuttle)", gain: "×4 плотности", invest: "Очень высокие" },
                { method: "SKU-рационализация (чистка dead stock)", gain: "10–20% высвобождения", invest: "Нулевые" },
                { method: "Динамическое слотирование (WMS)", gain: "+5–15% производительности", invest: "Низкие" },
              ].map(({ method, gain, invest }) => (
                <div key={method} className="flex items-start justify-between border-b border-gray-50 py-1.5 gap-2">
                  <span className="text-xs text-gray-600 flex-1">{method}</span>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-green-700">{gain}</div>
                    <div className="text-xs text-gray-400">{invest}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2 — ДОКИ
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 2 && (
        <div>
          <Section title="Расчёт количества доковых ворот" accent="amber">
            <Formula>{"N_docks = (N_trucks/day × T_service) /\n           (H_shift × U_dock)\n\nU_dock — целевая утилизация дока (0,70–0,80)"}</Formula>

            <Slider label="Грузовиков в день (приёмка + отгрузка)" min={5} max={200} step={1} value={trucksPerDay} onChange={setTrucksPerDay} unit="авт/день" hint="Для раздельного управления считайте приёмку и отгрузку отдельно" />
            <Slider label="Время обслуживания T_service" min={0.5} max={5} step={0.25} value={tService} onChange={setTService} unit="ч" hint="Фулфилмент: 1–2 ч · Контейнеры: 3–4 ч" />
            <Slider label="Длина рабочей смены H_shift" min={6} max={24} step={1} value={hShift} onChange={setHShift} unit="ч" />
            <Slider label="Утилизация дока U_dock" min={50} max={95} step={5} value={uDock} onChange={setUDock} unit="%" hint="Отраслевой оптимум: 70–80%. Выше — очереди." />

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Row label="N_trucks/day × T_service" value={`${trucksPerDay} × ${tService} = ${(trucksPerDay * tService).toFixed(1)}`} unit="авт·ч" />
              <Row label="H_shift × U_dock" value={`${hShift} × ${uDock / 100} = ${(hShift * uDock / 100).toFixed(2)}`} unit="ч/dok" sub />
              <Row label="N_docks (расчёт)" value={calc.nDocksRaw.toFixed(2)} unit="доков" />
              <Row label="N_docks (округление вверх)" value={calc.nDocks} unit="доков" highlight />
            </div>

            <Note type="info">
              <strong>Пример:</strong> {trucksPerDay} авт/день × {tService} ч / ({hShift} ч × {uDock / 100}) = {calc.nDocksRaw.toFixed(1)} → <strong>{calc.nDocks} доков</strong>
            </Note>
          </Section>

          <Section title="Буферная зона у доков (Staging Area)" accent="green">
            <Formula>{"S_staging = ceil(λ × T / H) × P × 0,8 × 1,2 × K_space\n\nгде:\n  λ = грузовиков/день · T = время разгрузки (ч)\n  P = паллет в грузовике · K_space = 2,0"}</Formula>

            <Slider label="Паллет в среднем грузовике" min={10} max={33} step={1} value={avgPalletsPerTruck} onChange={setAvgPalletsPerTruck} unit="пп" hint="Стандартный европрицеп: 22–33 европаллеты" />

            <Row label="Одновременно под погрузкой/разгрузкой" value={`ceil(${trucksPerDay} × ${tService} / ${hShift}) = ${Math.ceil(trucksPerDay * tService / hShift)}`} unit="авт" sub />
            <Row label="Расчётная площадь буфера" value={Math.round(calc.stagingArea).toLocaleString()} unit="м²" highlight />

            <Note type="warning">
              <strong>Нормативы глубины буферной зоны от линии доков:</strong><br />
              • Минимум: 6 м<br />
              • Рекомендуемый: 9–12 м<br />
              • Кросс-докинг: 15–18 м
            </Note>
            <Note type="info">
              <strong>Конструктивные требования к доку:</strong><br />
              • Ширина проёма: 3,0–3,6 м (европрицеп 2,5 м + зазоры)<br />
              • Высота проёма: 4,5–5,0 м (под ричтрак)<br />
              • Докшелтеры (уплотнители): обязательны<br />
              • Нивелирующие платформы: диапазон ±300–400 мм<br />
              • Освещённость: ≥ 300 лк (EN 12464-1)
            </Note>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 3 — ЗОНИРОВАНИЕ
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 3 && (
        <div>
          <Section title="Нормативное распределение площадей" accent="teal">
            <Note type="info">
              Источник: Cranfield University Logistics Research Centre.
              Режим: <strong>{warehouseType === "classic" ? "Классический РЦ" : "E-commerce фулфилмент"}</strong>.
              Переключите тип склада в верхней части страницы.
            </Note>

            <div className="space-y-3 mt-4">
              {calc.zones.map(z => (
                <div key={z.name}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{z.name}</span>
                    <span className="font-medium tabular-nums">{z.pct}% · {z.area.toLocaleString()} м²</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${z.color}`} style={{ width: `${z.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Row label="S_gross здания (база расчёта)" value={calc.sGross.toLocaleString()} unit="м²" highlight />
            </div>

            <Note type={warehouseType === "ecomm" ? "warning" : "info"}>
              {warehouseType === "ecomm"
                ? "⚡ E-commerce требует в 3× больше полезной площади при сопоставимом объёме запасов — за счёт зон each-picking, упаковки 1–2 ед./заказ и активной реверсивной логистики."
                : "📦 Классический РЦ: доминирует хранение. Паллетный / коробочный пикинг, зона возвратов минимальна."}
            </Note>
          </Section>

          <Section title="Матрица взаимосвязей зон (Activity Relationship Chart, SLP)" accent="blue">
            <div className="text-xs text-gray-500 mb-3">
              Рейтинги близости: <strong>A</strong> = абсолютно необходимо рядом · <strong>E</strong> = очень важно · <strong>I</strong> = важно · <strong>X</strong> = нежелательно рядом
            </div>
            <div className="space-y-2">
              {[
                { pair: "Пикинг ↔ Упаковка", rating: "A", desc: "Минимизация транзитного расстояния", c: "bg-red-50 border-red-200 text-red-700" },
                { pair: "Упаковка ↔ Отгрузка", rating: "A", desc: "Прямой поток готовых заказов", c: "bg-red-50 border-red-200 text-red-700" },
                { pair: "Приёмка ↔ Резервное хранение", rating: "E", desc: "Быстрое размещение товара в сток", c: "bg-orange-50 border-orange-200 text-orange-700" },
                { pair: "Возвраты ↔ Хранение", rating: "I", desc: "Возврат годного товара в активный сток", c: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                { pair: "Зарядная техники ↔ Хранение", rating: "O", desc: "Доступность, но не критично", c: "bg-gray-50 border-gray-200 text-gray-600" },
                { pair: "Приёмка ↔ Отгрузка", rating: "X", desc: "Разделить входящий / исходящий потоки", c: "bg-purple-50 border-purple-200 text-purple-700" },
              ].map(({ pair, rating, desc, c }) => (
                <div key={pair} className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs ${c}`}>
                  <span className="font-bold text-sm w-5 text-center flex-shrink-0">{rating}</span>
                  <div>
                    <div className="font-medium">{pair}</div>
                    <div className="opacity-70 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Выбор макро-планировки (конфигурация грузопотока)" accent="amber">
            <div className="space-y-3">
              {[
                {
                  type: "U-образная (U-Flow)",
                  rec: true,
                  pros: ["Приёмка и отгрузка на одной стороне", "Совместное использование доков и персонала", "Идеальна для кросс-докинга", "Единый периметр безопасности"],
                  cons: [],
                },
                {
                  type: "I-образная (Сквозная / I-Flow)",
                  rec: false,
                  pros: ["Прямолинейный поток без разворотов", "Полное разделение входящих/исходящих потоков"],
                  cons: ["Невозможно совмещать доки"],
                },
                {
                  type: "L-образная",
                  rec: false,
                  pros: ["Адаптация к нестандартной геометрии участка"],
                  cons: ["Сложнее управление потоками"],
                },
              ].map(({ type, rec, pros, cons }) => (
                <div key={type} className={`border rounded-lg p-3 ${rec ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-xs">{type}</span>
                    {rec && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Рекомендуется</span>}
                  </div>
                  <div className="space-y-0.5">
                    {pros.map(p => <div key={p} className="text-xs text-gray-600">✅ {p}</div>)}
                    {cons.map(c => <div key={c} className="text-xs text-gray-500">❌ {c}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 4 — ПИКИНГ
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 4 && (
        <div>
          <Section title="Расчёт числа пикеров в смену" accent="teal">
            <Formula>{"N_pickers = (Orders/day × Lines/order) /\n             (Lines/picker/h × H_shift × U_labor)\n\nгде U_labor = 0,85 (полезное время без перерывов)"}</Formula>

            <Slider label="Заказов в день (пиковый день)" min={100} max={50000} step={100} value={ordersPerDay} onChange={setOrdersPerDay} unit="зак/день" hint="Используйте пиковый день, а не средний" />
            <Slider label="Строк на заказ (среднее)" min={1} max={20} step={0.5} value={linesPerOrder} onChange={setLinesPerOrder} unit="стр/зак" hint="E-commerce: 1,5–3,0 · B2B оптовый: 5–15" />
            <Slider label="Длина смены" min={6} max={12} step={1} value={pickShift} onChange={setPickShift} unit="ч" />
            <Slider label="Коэффициент полезного времени U_labor" min={70} max={95} step={5} value={uLabor} onChange={setULabor} unit="%" hint="Норматив: 85% (перерывы, переходы, переключения)" />

            <div className="text-xs font-medium text-gray-500 mt-4 mb-2">Технология направления пикинга:</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {([
                ["paper", "Бумажный лист", "60–80 стр/ч", "98–99%", "Нулевой"],
                ["rf", "RF-терминал (ТСД)", "80–120 стр/ч", "99–99,5%", "Низкий"],
                ["voice", "Voice Picking", "100–140 стр/ч", "99,5–99,9%", "Средний"],
                ["ptl", "Pick-to-Light", "200–350 стр/ч", "99,9%+", "Средний"],
              ] as const).map(([k, lbl, rate, acc, capex]) => (
                <button key={k} onClick={() => setPickTech(k)}
                  className={`px-3 py-2 rounded-lg text-xs border text-left transition-colors ${pickTech === k ? "bg-teal-50 border-teal-300 text-teal-800 font-medium" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <div>{lbl}</div>
                  <div className="text-gray-400 mt-0.5">{rate}</div>
                  <div className="text-gray-300">{acc} · CAPEX: {capex}</div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Row label="Строк в день (Lines/day)" value={calc.linesPerDay.toLocaleString()} unit="стр" />
              <Row label={`Производительность: ${pickRate} × ${pickShift}ч × ${uLabor}%`} value={Math.round(calc.linesPerPickerShift).toLocaleString()} unit="стр/смену" sub />
              <Row label="N_pickers (в смену)" value={calc.nPickers} unit="чел" highlight />
            </div>

            <Note type="info">
              <strong>Пример:</strong> {ordersPerDay.toLocaleString()} зак × {linesPerOrder} стр = {calc.linesPerDay.toLocaleString()} стр/день ÷ {Math.round(calc.linesPerPickerShift)} стр/пикер = <strong>{calc.nPickers} пикеров</strong>
            </Note>
          </Section>

          <Section title="Методы пикинга — сравнение" accent="green">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 font-medium text-gray-600 border-b">Метод</th>
                    <th className="text-right p-2 font-medium text-gray-600 border-b">Производит.</th>
                    <th className="text-right p-2 font-medium text-gray-600 border-b">Применение</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Discrete (1 заказ = 1 маршрут)", "60–100 стр/ч", "Малые объёмы"],
                    ["Batch Picking (N заказов сразу)", "150–250 стр/ч", "Средние объёмы"],
                    ["Zone Picking (зоны)", "200–400 стр/ч", "Крупные СКЦ"],
                    ["Wave Picking (волновой)", "300–500+ стр/ч", "Автоматиз. склады"],
                    ["Goods-to-Person (AS/RS + AMR)", "400–800 стр/ч", "Высокоавтоматиз."],
                  ].map(([m, p, a]) => (
                    <tr key={m} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-2 text-gray-600">{m}</td>
                      <td className="p-2 text-right font-medium text-teal-700 tabular-nums">{p}</td>
                      <td className="p-2 text-right text-gray-400">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Слотирование ABC/XYZ" accent="amber">
            <Formula>{"A-товары (20% SKU → 80% оборота):\n  → «горячая» зона, 600–1600 мм от пола,\n    ближайшая к упаковке\n\nB-товары (30% SKU → 15% оборота):\n  → «тёплая» зона, средняя дистанция\n\nC-товары (50% SKU → 5% оборота):\n  → «холодная» зона, нижние/верхние ярусы,\n    удалённые аллеи"}</Formula>
            <Note type="warning">
              Динамическое слотирование (пересмотр ABC каждые 2–4 недели) даёт +5–15% производительности
              пикинга без дополнительных капиталовложений — только настройка WMS.
            </Note>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 5 — УПАКОВКА
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 5 && (
        <div>
          <Section title="Расчёт числа упаковочных станций" accent="orange">
            <Formula>{"N_stations = (Orders/day × CT_pack_min) /\n              (H_shift × 60 × U_labor)\n\nCT_pack = T_take + T_check + T_pack +\n           T_label + T_seal + T_place\nДиапазон: 43–80 с (0,7–1,3 мин)"}</Formula>

            <Slider label="Время цикла упаковки CT_pack" min={30} max={180} step={5} value={ctPack} onChange={setCtPack} unit="с" hint="Простая упаковка без VAS: 43–60 с · С маркировкой: 70–100 с" />
            <Slider label="Длина смены" min={6} max={12} step={1} value={packShift} onChange={setPackShift} unit="ч" />
            <Slider label="U_labor" min={70} max={95} step={5} value={uPackLabor} onChange={setUPackLabor} unit="%" />

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Row label="Заказов в день" value={ordersPerDay.toLocaleString()} unit="зак" />
              <Row label={`CT_pack = ${ctPack} с = ${(ctPack / 60).toFixed(2)} мин`} value={ctPack} unit="с" sub />
              <Row label="Расчётное число станций" value={calc.nStationsRaw.toFixed(1)} />
              <Row label="N_stations (округление вверх)" value={calc.nStations} unit="ст" highlight />
            </div>

            <Note type="info">
              <strong>Пример:</strong> {ordersPerDay.toLocaleString()} зак × {(ctPack / 60).toFixed(2)} мин / ({packShift}ч × 60 × {uPackLabor / 100}) = {calc.nStationsRaw.toFixed(1)} → <strong>{calc.nStations} станций</strong>
            </Note>
          </Section>

          <Section title="Декомпозиция времени цикла CT_pack" accent="green">
            <div className="space-y-2">
              {[
                ["T_take", "Взять короб нужного размера", "5–10 с"],
                ["T_check", "Визуальный контроль содержимого", "5–10 с"],
                ["T_pack", "Упаковать, заполнить пустоты", "15–30 с"],
                ["T_label", "Напечатать и приклеить этикетку", "10–15 с"],
                ["T_seal", "Заклеить скотчем", "5–10 с"],
                ["T_place", "Поставить на конвейер", "3–5 с"],
              ].map(([var_, desc, time]) => (
                <div key={var_} className="flex items-center justify-between border-b border-gray-50 py-1.5">
                  <div className="text-xs">
                    <span className="font-mono text-gray-500 mr-2">{var_}</span>
                    <span className="text-gray-600">{desc}</span>
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums flex-shrink-0">{time}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-xs font-medium">
                <span>Итого CT_pack</span>
                <span className="text-orange-700">43–80 с</span>
              </div>
            </div>
          </Section>

          <Section title="Типовой состав упаковочной станции" accent="blue">
            <div className="space-y-1.5 mt-1">
              {[
                "Регулируемый рабочий стол (H: 750–900 мм)",
                "Весы (точность ≥ 5 г)",
                "Термотрансферный принтер этикеток (300 dpi, скорость ≥ 150 мм/с)",
                "Сканер штрихкодов / 2D-кодов (DataMatrix для «Честный ЗНАК»)",
                "Диспенсер скотча с автоотрезом",
                "Буфер упаковочных материалов (запас на 2–4 часа работы)",
                "ТСД или монитор с интерфейсом WMS",
              ].map(item => (
                <div key={item} className="flex gap-2 text-xs text-gray-600">
                  <span className="text-gray-300 flex-shrink-0">•</span>{item}
                </div>
              ))}
            </div>
          </Section>

          <Section title="VAS — услуги с добавленной стоимостью" accent="purple">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 font-medium text-gray-600 border-b">Операция</th>
                    <th className="text-right p-2 font-medium text-gray-600 border-b">Выработка</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Подарочная упаковка", "10–20 зак/ч"],
                    ["Kitting (сборка наборов)", "20–50 наборов/ч"],
                    ["Брендирование (инсерты, стикеры)", "50–100 ед/ч"],
                    ["Переупаковка", "30–80 ед/ч"],
                    ["Маркировка «Честный ЗНАК»", "50–120 ед/ч"],
                    ["RFID-таггинг", "100–200 ед/ч"],
                  ].map(([op, rate]) => (
                    <tr key={op} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-2 text-gray-600">{op}</td>
                      <td className="p-2 text-right text-gray-500 tabular-nums">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 6 — KPI
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 6 && (
        <div>
          {kpiGroups.map(({ title, accent, items }) => (
            <Section key={title} title={title} accent={accent}>
              <div className="space-y-1">
                {items.map(({ name, bench, crit }) => (
                  <div key={name} className="flex items-start justify-between py-1.5 border-b border-gray-50 gap-2">
                    <span className="text-xs text-gray-600 flex-1">{name}</span>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-green-700">{bench}</div>
                      {crit && <div className="text-xs text-red-400">{crit}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ))}

          <Section title="Автоматизация: уровни и ROI" accent="purple">
            <div className="space-y-2">
              {[
                { sol: "RF-терминалы (ТСД), Print-and-Apply", roi: "—", effect: "+20–30% производительности" },
                { sol: "Voice Picking / Pick-to-Light", roi: "6–24 мес.", effect: "+40–60% производительности" },
                { sol: "Конвейеры + автосортер", roi: "12–30 мес.", effect: "+50–80% пропускной способности" },
                { sol: "Парк AMR (10–20 роботов)", roi: "18–36 мес.", effect: "−60–70% пробега персонала" },
                { sol: "AS/RS (AutoStore, Shuttle)", roi: "3–6 лет", effect: "×4 плотности хранения" },
                { sol: "Полностью автоматизированный РЦ", roi: "5–8 лет", effect: "×4–8 удельная выработка" },
              ].map(({ sol, roi, effect }) => (
                <div key={sol} className="flex items-start justify-between border-b border-gray-50 py-1.5 gap-2">
                  <span className="text-xs text-gray-600 flex-1">{sol}</span>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-blue-700">{roi}</div>
                    <div className="text-xs text-gray-400">{effect}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Пошаговый чеклист «Greenfield Project»" accent="amber">
            <div className="space-y-1 mt-1">
              {[
                ["Фаза 1", "P-Q Analysis, Профиль операции, ABC/XYZ-матрица"],
                ["Фаза 1", "SKU-карта, грузопотоки (вход/выход), пики, прогноз 3–5 лет"],
                ["Фаза 1", "Выбор макро-планировки (U/I/L), базовая концепция зонирования"],
                ["Фаза 2", "Расчёт ёмкости (паллето-места, м²)"],
                ["Фаза 2", "Матрица взаимосвязей (Activity Relationship Chart)"],
                ["Фаза 2", "Расчёт доков, пикеров, упаковочных станций"],
                ["Фаза 2", "Выбор стеллажных систем и погрузочной техники"],
                ["Фаза 3", "Block Layout → Detailed Layout (стеллажи, станции, проходы)"],
                ["Фаза 3", "ТЗ на инженерные системы (HVAC, освещение, спринклеры)"],
                ["Фаза 3", "ТЗ на WMS, интеграции (ERP, TMS, маркетплейсы)"],
                ["Фаза 4", "WMS внедрена, первичное слотирование A-товаров"],
                ["Фаза 4", "KPI-дашборд запущен, цикловая инвентаризация IRA ≥ 99,9%"],
              ].map(([phase, item], i) => (
                <div key={i} className="flex gap-2 items-start text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-300 flex-shrink-0 w-14">{phase}</span>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-300 text-center">
        По методологии SLP (Мьюзер) · Источники: Cranfield University, VDI 3644, ANSI/NFPA 13
      </div>
    </div>
  );
}
