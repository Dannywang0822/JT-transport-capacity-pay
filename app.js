/* 承运商运费保障平台 · 测试环境演示 (mock) */
(function () {
  const STORAGE_KEY = "jitu_freight_demo_v1";
  const STATUS = {
    draft: { label: "草稿", cls: "draft" },
    published: { label: "已发布", cls: "published" },
    accepted: { label: "已接单锁价", cls: "accepted" },
    in_transit: { label: "履约中", cls: "in_transit" },
    signed: { label: "已签收", cls: "signed" },
    objection: { label: "异议期", cls: "objection" },
    first_paid: { label: "首笔已代扣", cls: "first_paid" },
    tail_due: { label: "尾款账期中", cls: "tail_due" },
    fallback: { label: "兜底代扣", cls: "fallback" },
    done: { label: "已完结", cls: "done" },
    disputed: { label: "争议中", cls: "disputed" },
  };

  const ROLES = [
    { id: "franchise", label: "加盟商端", shell: "phone" },
    { id: "carrier", label: "承运商端", shell: "phone" },
    { id: "driver", label: "司机端", shell: "phone" },
    { id: "hub", label: "分拨签收", shell: "phone" },
    { id: "admin", label: "管理后台", shell: "desk" },
  ];

  const SCRIPT = [
    { id: "publish", text: "加盟商发布运输需求（或使用预置运单 WB-DEMO-01）" },
    { id: "accept", text: "承运商接单锁价" },
    { id: "load", text: "司机模拟装车扫码 + 上传封签" },
    { id: "sign", text: "目的分拨中心签收（电子围栏内）" },
    { id: "objection", text: "结束异议期 → 触发首笔代扣 60%" },
    { id: "tail", text: "承运商确认尾款收款，或管理后台触发超期兜底" },
    { id: "board", text: "管理后台查看看板 / 代扣记录 / 信用分" },
  ];

  function yuan(n) {
    return "¥" + Number(n || 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
  }
  function nowStr() {
    const d = new Date();
    const p = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function today() {
    const d = new Date();
    const p = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function addDays(isoDate, days) {
    const d = new Date(isoDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    const p = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function seedState() {
    const t = today();
    return {
      role: "franchise",
      adminTab: "board",
      clock: nowStr(),
      franchise: {
        id: "FR-ZZ-A",
        name: "豫A加盟商（郑州示例）",
        credit: 72,
        dailyPayable: 52000,
        deductRatio: 0.6,
      },
      carrier: {
        id: "CR-YYD",
        name: "豫运达物流（示例）",
        phone: "138****2618",
        ontime: 0.982,
      },
      driver: {
        id: "DR-01",
        name: "王师傅",
        plate: "豫A·D8821",
        vehicle: "9.6米厢货",
      },
      waybills: [
        {
          id: "WB-DEMO-01",
          franchiseId: "FR-ZZ-A",
          franchiseName: "豫A加盟商（郑州示例）",
          carrierId: null,
          carrierName: null,
          route: "郑州分拨 → 洛阳分拨",
          fromHub: "郑州分拨中心",
          toHub: "洛阳分拨中心",
          vehicleNeed: "9.6米厢货",
          loadAt: t + " 05:00",
          arriveSla: t + " 09:00",
          price: 8000,
          deductRatio: 0.6,
          status: "published",
          sealNo: null,
          events: [
            { t: t + " 04:10", text: "加盟商发布运输需求", ok: true },
          ],
          firstAmount: 0,
          tailAmount: 0,
          firstPaidAt: null,
          tailDueAt: null,
          graceAt: null,
          carrierConfirmed: false,
          fallbackTriggered: false,
          settleBatchId: null,
          voucherNo: null,
          fallbackVoucherNo: null,
          demoFocus: true,
        },
        {
          id: "WB-HN-0018",
          franchiseId: "FR-ZZ-A",
          franchiseName: "豫A加盟商（郑州示例）",
          carrierId: "CR-YYD",
          carrierName: "豫运达物流（示例）",
          route: "郑州分拨 → 洛阳分拨",
          fromHub: "郑州分拨中心",
          toHub: "洛阳分拨中心",
          vehicleNeed: "9.6米厢货",
          loadAt: addDays(t, -2) + " 05:18",
          arriveSla: addDays(t, -2) + " 09:00",
          price: 8000,
          deductRatio: 0.6,
          status: "tail_due",
          sealNo: "SEAL-7781",
          events: [
            { t: addDays(t, -2) + " 04:00", text: "发布并接单锁价 ¥8,000", ok: true },
            { t: addDays(t, -2) + " 05:18", text: "装车扫码成功（围栏内）", ok: true },
            { t: addDays(t, -2) + " 05:22", text: "封签 SEAL-7781 已上传", ok: true },
            { t: addDays(t, -2) + " 08:42", text: "洛阳分拨签收 · 工号 8821", ok: true },
            { t: addDays(t, -2) + " 10:00", text: "异议期开始（48h）", ok: true },
            { t: t + " 10:05", text: "异议期满无争议 · 首笔代扣 ¥4,800", ok: true },
          ],
          firstAmount: 4800,
          tailAmount: 3200,
          firstPaidAt: addDays(t, -0) + " 10:05",
          tailDueAt: addDays(t, 14),
          graceAt: addDays(t, 21),
          carrierConfirmed: false,
          fallbackTriggered: false,
          settleBatchId: "STL-" + addDays(t, 0).replace(/-/g, ""),
          voucherNo: "VF-HN-" + addDays(t, 0).replace(/-/g, "") + "-0018",
          fallbackVoucherNo: null,
          demoFocus: false,
        },
        {
          id: "WB-HN-0007",
          franchiseId: "FR-ZZ-A",
          franchiseName: "豫A加盟商（郑州示例）",
          carrierId: "CR-LC",
          carrierName: "洛城物流（示例）",
          route: "开封分拨 → 南阳分拨",
          fromHub: "开封分拨中心",
          toHub: "南阳分拨中心",
          vehicleNeed: "7.6米厢货",
          loadAt: addDays(t, -40) + " 06:00",
          arriveSla: addDays(t, -40) + " 14:00",
          price: 5000,
          deductRatio: 0.6,
          status: "tail_due",
          sealNo: "SEAL-3301",
          events: [
            { t: addDays(t, -40) + " 05:00", text: "接单锁价 ¥5,000", ok: true },
            { t: addDays(t, -40) + " 14:10", text: "南阳分拨签收", ok: true },
            { t: addDays(t, -38) + " 10:00", text: "首笔代扣 ¥3,000", ok: true },
          ],
          firstAmount: 3000,
          tailAmount: 2000,
          firstPaidAt: addDays(t, -38) + " 10:00",
          tailDueAt: addDays(t, -8),
          graceAt: addDays(t, -1),
          carrierConfirmed: false,
          fallbackTriggered: false,
          settleBatchId: "STL-" + addDays(t, -38).replace(/-/g, ""),
          voucherNo: "VF-HN-0007-FIRST",
          fallbackVoucherNo: null,
          overdueDemo: true,
          demoFocus: false,
        },
        {
          id: "WB-HN-0009",
          franchiseId: "FR-ZZ-A",
          franchiseName: "豫A加盟商（郑州示例）",
          carrierId: "CR-YYD",
          carrierName: "豫运达物流（示例）",
          route: "安阳分拨 → 信阳分拨",
          fromHub: "安阳分拨中心",
          toHub: "信阳分拨中心",
          vehicleNeed: "9.6米厢货",
          loadAt: addDays(t, -20) + " 04:30",
          arriveSla: addDays(t, -20) + " 12:00",
          price: 9200,
          deductRatio: 0.6,
          status: "done",
          sealNo: "SEAL-9910",
          events: [
            { t: addDays(t, -20) + " 12:20", text: "签收", ok: true },
            { t: addDays(t, -18) + " 10:00", text: "首笔代扣 ¥5,520", ok: true },
            { t: addDays(t, -5) + " 16:00", text: "承运商确认尾款已收款", ok: true },
          ],
          firstAmount: 5520,
          tailAmount: 3680,
          firstPaidAt: addDays(t, -18) + " 10:00",
          tailDueAt: addDays(t, -5),
          graceAt: addDays(t, 2),
          carrierConfirmed: true,
          fallbackTriggered: false,
          settleBatchId: "STL-DONE-0009",
          voucherNo: "VF-HN-0009-FIRST",
          fallbackVoucherNo: null,
          demoFocus: false,
        },
      ],
      deductions: [
        {
          id: "DD-0018",
          waybillId: "WB-HN-0018",
          type: "FIRST",
          typeLabel: "首笔",
          franchiseName: "豫A加盟商（郑州示例）",
          amount: 4800,
          batchId: "STL-" + today().replace(/-/g, ""),
          payableBefore: 52000,
          result: "自动通过",
          resultTone: "ok",
          at: today() + " 10:05",
          voucher: "VF-HN-" + today().replace(/-/g, "") + "-0018",
        },
      ],
      cityBars: [
        { label: "郑州", value: 42 },
        { label: "洛阳", value: 28 },
        { label: "南阳", value: 22 },
        { label: "新乡", value: 18 },
        { label: "开封", value: 15 },
        { label: "其他", value: 61 },
      ],
      credits: [
        { name: "豫A加盟商（郑州示例）", score: 72, ratio: "60%", note: "本月被兜底 0 次（演示中可触发）" },
        { name: "豫B加盟商（洛阳示例）", score: 88, ratio: "50%", note: "按时付尾款加分" },
        { name: "豫C加盟商（南阳示例）", score: 55, ratio: "80%", note: "信用偏低，提高首笔比例" },
        { name: "豫D加盟商（开封示例）", score: 41, ratio: "100%", note: "需追加保证金 / 可能暂停发单" },
      ],
      logs: [],
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seedState();
  }
  function save() {
    state.clock = nowStr();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function reset() {
    if (!confirm("确认重置为初始模拟数据？当前演示进度会清空。")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = seedState();
    save();
    toast("已重置模拟数据");
    render();
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  function statusBadge(s) {
    const m = STATUS[s] || { label: s, cls: "draft" };
    return `<span class="status ${m.cls}">${m.label}</span>`;
  }

  function findWb(id) {
    return state.waybills.find((w) => w.id === id);
  }

  function pushEvent(wb, text, ok = true) {
    wb.events.push({ t: nowStr(), text, ok });
  }

  function scriptProgress() {
    const demo = findWb("WB-DEMO-01") || state.waybills.find((w) => w.demoFocus);
    const overdue = findWb("WB-HN-0007");
    const done = {
      publish: !!(demo && ["published", "accepted", "in_transit", "signed", "objection", "first_paid", "tail_due", "fallback", "done"].includes(demo.status)),
      accept: !!(demo && !["published", "draft"].includes(demo.status)),
      load: !!(demo && ["in_transit", "signed", "objection", "first_paid", "tail_due", "fallback", "done"].includes(demo.status) && demo.sealNo),
      sign: !!(demo && ["signed", "objection", "first_paid", "tail_due", "fallback", "done"].includes(demo.status)),
      objection: !!(demo && ["first_paid", "tail_due", "fallback", "done"].includes(demo.status)),
      tail: !!(
        (demo && (demo.status === "done" || demo.fallbackTriggered || demo.carrierConfirmed)) ||
        (overdue && (overdue.status === "done" || overdue.fallbackTriggered || overdue.carrierConfirmed))
      ),
      board: true,
    };
    let current = "publish";
    for (const s of SCRIPT) {
      if (!done[s.id] || s.id === "board") {
        current = s.id;
        break;
      }
      if (s.id !== "board") current = s.id;
    }
    if (done.tail) current = "board";
    return { done, current };
  }

  function openModal(title, bodyHtml, actions) {
    const modal = document.getElementById("modal");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    const act = document.getElementById("modalActions");
    act.innerHTML = "";
    (actions || [{ label: "关闭", ghost: true }]).forEach((a) => {
      const b = document.createElement("button");
      b.className = "btn " + (a.primary ? "primary" : a.ok ? "ok" : a.danger ? "danger" : "ghost");
      b.textContent = a.label;
      b.onclick = () => {
        modal.classList.add("hidden");
        if (a.onClick) a.onClick();
      };
      act.appendChild(b);
    });
    modal.classList.remove("hidden");
  }

  /* ========== Actions ========== */
  function publishWaybill(form) {
    const id = "WB-DEMO-" + String(Math.floor(Math.random() * 90) + 10);
    const wb = {
      id,
      franchiseId: state.franchise.id,
      franchiseName: state.franchise.name,
      carrierId: null,
      carrierName: null,
      route: form.route,
      fromHub: form.fromHub,
      toHub: form.toHub,
      vehicleNeed: form.vehicleNeed,
      loadAt: form.loadAt,
      arriveSla: form.arriveSla,
      price: Number(form.price),
      deductRatio: state.franchise.deductRatio,
      status: "published",
      sealNo: null,
      events: [{ t: nowStr(), text: "加盟商发布运输需求", ok: true }],
      firstAmount: 0,
      tailAmount: 0,
      firstPaidAt: null,
      tailDueAt: null,
      graceAt: null,
      carrierConfirmed: false,
      fallbackTriggered: false,
      settleBatchId: null,
      voucherNo: null,
      fallbackVoucherNo: null,
      demoFocus: true,
    };
    state.waybills.forEach((w) => (w.demoFocus = false));
    state.waybills.unshift(wb);
    save();
    toast("已发布需求 " + id);
    render();
  }

  function acceptWaybill(id) {
    const wb = findWb(id);
    if (!wb || wb.status !== "published") return toast("运单不可接单");
    wb.status = "accepted";
    wb.carrierId = state.carrier.id;
    wb.carrierName = state.carrier.name;
    wb.deductRatio = state.franchise.deductRatio;
    pushEvent(wb, `承运商接单锁价 ${yuan(wb.price)} · 首笔比例 ${Math.round(wb.deductRatio * 100)}%`);
    save();
    toast("已接单锁价");
    render();
  }

  function driverLoad(id) {
    const wb = findWb(id);
    if (!wb || wb.status !== "accepted") return toast("请先完成接单");
    openModal(
      "模拟装车扫码",
      `<div class="sim-box">
        <div class="icon">📷</div>
        <div>模拟：司机在 <b>${wb.fromHub}</b> 电子围栏内扫码</div>
        <div class="callout ok">定位校验通过 · 围栏内 · 准点窗口</div>
        <div class="field" style="text-align:left;margin-top:8px">
          <label>封签号（可改）</label>
          <input id="sealInput" value="SEAL-7781" />
        </div>
      </div>`,
      [
        { label: "取消", ghost: true },
        {
          label: "确认扫码成功并上传封签",
          primary: true,
          onClick: () => {
            const seal = (document.getElementById("sealInput") || {}).value || "SEAL-7781";
            wb.status = "in_transit";
            wb.sealNo = seal;
            pushEvent(wb, `装车扫码成功（围栏内）· 车牌 ${state.driver.plate}`);
            pushEvent(wb, `封签 ${seal} 已上传`);
            save();
            toast("装车完成，进入履约中");
            render();
          },
        },
      ]
    );
    // seal input exists after modal render — patch after paint
    setTimeout(() => {}, 0);
  }

  function hubSign(id) {
    const wb = findWb(id);
    if (!wb || wb.status !== "in_transit") return toast("仅履约中运单可签收");
    openModal(
      "目的分拨签收",
      `<div class="sim-box">
        <div class="icon">✅</div>
        <div>模拟：<b>${wb.toHub}</b> 操作员扫码签收</div>
        <div class="callout info">签收方为分拨中心（非加盟商）· 电子围栏内 · 封签比对 ${wb.sealNo}</div>
        <div class="callout ok">封签一致 · 件数/重量对接中转系统（模拟通过）</div>
      </div>`,
      [
        { label: "取消", ghost: true },
        {
          label: "确认签收并进入异议期",
          ok: true,
          onClick: () => {
            wb.status = "objection";
            pushEvent(wb, `${wb.toHub} 签收 · 工号 8821 · 围栏内`);
            pushEvent(wb, "异议期开始（演示可一键结束 48h）");
            save();
            toast("已签收，进入异议期");
            render();
          },
        },
      ]
    );
  }

  function endObjection(id) {
    const wb = findWb(id);
    if (!wb || wb.status !== "objection") return toast("运单不在异议期");
    const first = Math.round(wb.price * wb.deductRatio);
    const payable = state.franchise.dailyPayable;
    if (first > payable) {
      return openModal("余额不足", `<p>首笔 ${yuan(first)} 超过当日应付余额 ${yuan(payable)}，真实环境将排队或走保证金。本演示简化为拦截。</p>`, [
        { label: "知道了", ghost: true },
      ]);
    }
    openModal(
      "模拟日结算代扣",
      `<p>异议期满 · 无争议</p>
       <div class="detail-kv">
         <div class="k">合同价</div><div>${yuan(wb.price)}</div>
         <div class="k">首笔比例</div><div>${Math.round(wb.deductRatio * 100)}%</div>
         <div class="k">代扣金额</div><div><b>${yuan(first)}</b></div>
         <div class="k">加盟商当日应付</div><div>${yuan(payable)} → ${yuan(payable - first)}</div>
         <div class="k">凭证</div><div>受「${wb.franchiseName}」委托代付</div>
       </div>
       <div class="callout warn">测试环境：不接真实结算接口，仅模拟批次扣减与到账通知。</div>`,
      [
        { label: "取消", ghost: true },
        {
          label: "执行首笔代扣",
          primary: true,
          onClick: () => {
            const batch = "STL-" + today().replace(/-/g, "");
            const voucher = "VF-" + wb.id + "-FIRST";
            wb.firstAmount = first;
            wb.tailAmount = wb.price - first;
            wb.firstPaidAt = nowStr();
            wb.tailDueAt = addDays(today(), 30);
            wb.graceAt = addDays(today(), 37);
            wb.settleBatchId = batch;
            wb.voucherNo = voucher;
            wb.status = "tail_due";
            state.franchise.dailyPayable -= first;
            pushEvent(wb, `异议期满无争议 · 首笔代扣 ${yuan(first)}（批次 ${batch}）`);
            pushEvent(wb, `进入尾款账期 · 到期 ${wb.tailDueAt} · 宽限至 ${wb.graceAt}`);
            state.deductions.unshift({
              id: "DD-" + Date.now(),
              waybillId: wb.id,
              type: "FIRST",
              typeLabel: "首笔",
              franchiseName: wb.franchiseName,
              amount: first,
              batchId: batch,
              payableBefore: state.franchise.dailyPayable + first,
              result: "自动通过",
              resultTone: "ok",
              at: nowStr(),
              voucher,
            });
            save();
            toast("首笔代扣成功（模拟）" + yuan(first));
            render();
          },
        },
      ]
    );
  }

  function confirmTail(id) {
    const wb = findWb(id);
    if (!wb || wb.status !== "tail_due") return toast("无待确认尾款");
    openModal(
      "确认已收到尾款",
      `<p>确认已收到加盟商支付的尾款 <b>${yuan(wb.tailAmount)}</b>？</p>
       <div class="callout info">确认后运单完结，并通知加盟商。信用分将加分（模拟 +2）。</div>`,
      [
        { label: "取消", ghost: true },
        {
          label: "确认已收款",
          ok: true,
          onClick: () => {
            wb.carrierConfirmed = true;
            wb.status = "done";
            state.franchise.credit = Math.min(100, state.franchise.credit + 2);
            updateCreditRow();
            pushEvent(wb, `承运商确认尾款已收款 ${yuan(wb.tailAmount)}`);
            save();
            toast("尾款确认完成，运单已完结");
            render();
          },
        },
      ]
    );
  }

  function triggerFallback(id) {
    const wb = findWb(id);
    if (!wb || wb.status !== "tail_due") return toast("运单不在尾款账期");
    const amount = wb.tailAmount;
    if (amount > state.franchise.dailyPayable) {
      return openModal("余额不足", `<p>兜底金额 ${yuan(amount)} 超过当日应付 ${yuan(state.franchise.dailyPayable)}。</p>`, [
        { label: "知道了", ghost: true },
      ]);
    }
    openModal(
      "触发兜底全额代扣",
      `<p>账期+宽限期已满（或演示强制触发），加盟商未确认支付尾款。</p>
       <div class="detail-kv">
         <div class="k">尾款</div><div><b>${yuan(amount)}</b></div>
         <div class="k">动作</div><div>从日结算应付全额代扣给承运商</div>
         <div class="k">信用</div><div>扣 5 分，后续首笔比例可能上调</div>
       </div>`,
      [
        { label: "取消", ghost: true },
        {
          label: "执行兜底代扣",
          danger: true,
          onClick: () => {
            const batch = "STL-" + today().replace(/-/g, "");
            const voucher = "VF-" + wb.id + "-TAIL";
            wb.fallbackTriggered = true;
            wb.fallbackVoucherNo = voucher;
            wb.status = "done";
            state.franchise.dailyPayable -= amount;
            state.franchise.credit = Math.max(0, state.franchise.credit - 5);
            if (state.franchise.credit < 60) state.franchise.deductRatio = 0.8;
            if (state.franchise.credit < 50) state.franchise.deductRatio = 1;
            updateCreditRow();
            pushEvent(wb, `宽限期满未付 · 兜底代扣 ${yuan(amount)}（批次 ${batch}）`);
            pushEvent(wb, `信用扣分 -5 · 当前 ${state.franchise.credit}`);
            state.deductions.unshift({
              id: "DD-" + Date.now(),
              waybillId: wb.id,
              type: "FULL_TAIL",
              typeLabel: "兜底",
              franchiseName: wb.franchiseName,
              amount,
              batchId: batch,
              payableBefore: state.franchise.dailyPayable + amount,
              result: "自动通过",
              resultTone: "ok",
              at: nowStr(),
              voucher,
            });
            save();
            toast("兜底代扣成功（模拟）");
            render();
          },
        },
      ]
    );
  }

  function updateCreditRow() {
    const row = state.credits.find((c) => c.name === state.franchise.name);
    if (row) {
      row.score = state.franchise.credit;
      row.ratio = Math.round(state.franchise.deductRatio * 100) + "%";
      row.note = state.franchise.credit < 60 ? "信用下降，已提高首笔代扣比例" : row.note;
    }
  }

  /* ========== Views ========== */
  function renderRoleBar() {
    const bar = document.getElementById("roleBar");
    bar.innerHTML = ROLES.map(
      (r) => `<button type="button" class="role-btn ${state.role === r.id ? "active" : ""}" data-role="${r.id}">${r.label}</button>`
    ).join("");
    bar.querySelectorAll("[data-role]").forEach((btn) => {
      btn.onclick = () => {
        state.role = btn.getAttribute("data-role");
        save();
        render();
      };
    });
  }

  function renderScript() {
    const { done, current } = scriptProgress();
    const ol = document.getElementById("scriptSteps");
    ol.innerHTML = SCRIPT.map((s) => {
      const cls = done[s.id] && s.id !== "board" ? "done" : s.id === current ? "current" : "";
      const mark = done[s.id] && s.id !== "board" ? "✓ " : s.id === current ? "→ " : "";
      return `<li class="${cls}">${mark}${s.text}</li>`;
    }).join("");
    document.getElementById("btnReset").onclick = reset;
  }

  function wbCard(wb, buttonsHtml) {
    return `<div class="wb-card" data-id="${wb.id}">
      <div class="row1">
        <div class="wb-id">${wb.id}${wb.demoFocus ? ' <span class="status published">演示主单</span>' : ""}</div>
        ${statusBadge(wb.status)}
      </div>
      <div class="route">${wb.route}</div>
      <div class="meta-grid">
        <div>合同价 <b>${yuan(wb.price)}</b></div>
        <div>首笔比例 <b>${Math.round((wb.deductRatio || 0.6) * 100)}%</b></div>
        <div>承运商 <b>${wb.carrierName || "待接单"}</b></div>
        <div>装车时限 <b>${wb.loadAt}</b></div>
        ${wb.firstAmount ? `<div>已代扣首笔 <b>${yuan(wb.firstAmount)}</b></div>` : "<div></div>"}
        ${wb.tailAmount && wb.status !== "done" ? `<div>尾款 <b>${yuan(wb.tailAmount)}</b></div>` : wb.status === "done" ? `<div>状态 <b>已结清</b></div>` : "<div></div>"}
      </div>
      <div class="actions">${buttonsHtml || ""}</div>
    </div>`;
  }

  function viewFranchise() {
    const mine = state.waybills.filter((w) => w.franchiseId === state.franchise.id);
    const pendingTail = mine.filter((w) => w.status === "tail_due");
    const formHtml = `
      <div class="wb-card">
        <div class="wb-id">发布运输需求</div>
        <div class="callout info">发布后承运商可接单；接单瞬间锁价，改价需双方确认（演示未展开改价）。</div>
        <form class="form" id="publishForm">
          <div class="field"><label>线路</label>
            <select name="route">
              <option>郑州分拨 → 洛阳分拨</option>
              <option>开封分拨 → 南阳分拨</option>
              <option>新乡分拨 → 周口分拨</option>
              <option>安阳分拨 → 信阳分拨</option>
            </select>
          </div>
          <div class="field"><label>车型</label>
            <select name="vehicleNeed"><option>9.6米厢货</option><option>7.6米厢货</option><option>13米挂车</option></select>
          </div>
          <div class="field"><label>约定运费（元）</label><input name="price" type="number" value="8000" min="100" required /></div>
          <div class="field"><label>要求装车时间</label><input name="loadAt" value="${today()} 05:00" /></div>
          <div class="field"><label>要求到达时限</label><input name="arriveSla" value="${today()} 09:00" /></div>
          <button class="btn primary block" type="submit">发布并等待承运商接单</button>
        </form>
      </div>`;

    return `<div class="phone-shell">
      <div class="screen-head"><h2>加盟商端</h2><span class="badge warn">模拟</span></div>
      <div class="screen-body">
        <div class="metrics">
          <div class="metric warn"><div class="v">${state.franchise.credit}</div><div class="l">信用分 · 首笔 ${Math.round(state.franchise.deductRatio * 100)}%</div></div>
          <div class="metric"><div class="v">${yuan(state.franchise.dailyPayable)}</div><div class="l">今日可扣应付余额</div></div>
          <div class="metric danger"><div class="v">${yuan(pendingTail.reduce((s, w) => s + w.tailAmount, 0))}</div><div class="l">待付尾款合计</div></div>
          <div class="metric"><div class="v">${pendingTail.length}</div><div class="l">尾款账期中</div></div>
        </div>
        ${formHtml}
        <h3 style="font-size:14px;margin:16px 0 8px">我的运单</h3>
        <div class="card-list">
          ${mine
            .map((w) =>
              wbCard(
                w,
                w.status === "tail_due"
                  ? `<span class="callout warn" style="margin:0;flex:1">请在 ${w.tailDueAt} 前支付尾款 ${yuan(w.tailAmount)}，并请承运商确认</span>`
                  : ""
              )
            )
            .join("")}
        </div>
      </div>
    </div>`;
  }

  function viewCarrier() {
    const open = state.waybills.filter((w) => w.status === "published");
    const mine = state.waybills.filter((w) => w.carrierId === state.carrier.id || (w.carrierName && w.carrierName.includes("豫运达")));
    // also show accepted by current carrier via id match after accept
    const myAll = state.waybills.filter((w) => w.carrierId === state.carrier.id);
    const paid = myAll.reduce((s, w) => s + (w.firstAmount || 0) + (w.carrierConfirmed || w.fallbackTriggered ? w.tailAmount || 0 : 0), 0);
    const tailWait = myAll.filter((w) => w.status === "tail_due").reduce((s, w) => s + w.tailAmount, 0);

    return `<div class="phone-shell">
      <div class="screen-head"><h2>承运商端 · ${state.carrier.name}</h2><span class="badge warn">模拟</span></div>
      <div class="screen-body">
        <div class="metrics">
          <div class="metric ok"><div class="v">${yuan(paid)}</div><div class="l">已到账（含历史）</div></div>
          <div class="metric warn"><div class="v">${yuan(tailWait)}</div><div class="l">尾款待收</div></div>
          <div class="metric"><div class="v">${myAll.filter((w) => ["accepted", "in_transit"].includes(w.status)).length}</div><div class="l">履约中</div></div>
          <div class="metric ok"><div class="v">${Math.round(state.carrier.ontime * 1000) / 10}%</div><div class="l">准点率</div></div>
        </div>
        <h3 style="font-size:14px;margin:8px 0">可接需求</h3>
        <div class="card-list">
          ${
            open.length
              ? open
                  .map((w) =>
                    wbCard(w, `<button class="btn primary sm" data-act="accept" data-id="${w.id}">接单锁价</button>
                      <button class="btn ghost sm" data-act="detail" data-id="${w.id}">详情</button>`)
                  )
                  .join("")
              : `<div class="empty">暂无可接需求 · 请到加盟商端发布，或使用预置 WB-DEMO-01</div>`
          }
        </div>
        <h3 style="font-size:14px;margin:16px 0 8px">我的运单 / 收款</h3>
        <div class="card-list">
          ${myAll
            .map((w) => {
              let btns = `<button class="btn ghost sm" data-act="detail" data-id="${w.id}">详情</button>`;
              if (w.status === "tail_due") {
                btns =
                  `<button class="btn ok sm" data-act="confirmTail" data-id="${w.id}">确认已收尾款 ${yuan(w.tailAmount)}</button>` +
                  btns;
              }
              return wbCard(w, btns);
            })
            .join("") || `<div class="empty">接单后显示在这里</div>`}
        </div>
      </div>
    </div>`;
  }

  function viewDriver() {
    const tasks = state.waybills.filter(
      (w) => w.carrierId === state.carrier.id && ["accepted", "in_transit"].includes(w.status)
    );
    return `<div class="phone-shell">
      <div class="screen-head"><h2>司机端 · ${state.driver.name}</h2><span class="badge warn">模拟</span></div>
      <div class="screen-body">
        <div class="callout info">车牌 ${state.driver.plate} · ${state.driver.vehicle} · 定位/扫码能力在真机小程序中接入，此处用按钮模拟。</div>
        <div class="card-list">
          ${
            tasks.length
              ? tasks
                  .map((w) => {
                    let btns = "";
                    if (w.status === "accepted") {
                      btns = `<button class="btn primary block" data-act="load" data-id="${w.id}">模拟装车扫码 / 上传封签</button>`;
                    } else if (w.status === "in_transit") {
                      btns = `<div class="callout ok" style="margin:0;width:100%">已在途 · 等待目的分拨签收（请切换到「分拨签收」）</div>`;
                    }
                    return wbCard(w, btns);
                  })
                  .join("")
              : `<div class="empty">暂无任务 · 请先让承运商接单</div>`
          }
        </div>
      </div>
    </div>`;
  }

  function viewHub() {
    const pending = state.waybills.filter((w) => w.status === "in_transit");
    const objection = state.waybills.filter((w) => w.status === "objection");
    return `<div class="phone-shell">
      <div class="screen-head"><h2>目的分拨签收台</h2><span class="badge warn">模拟</span></div>
      <div class="screen-body">
        <div class="callout warn">卸货签收必须由分拨中心人员操作，加盟商不可自签，防止拒签拖款。</div>
        <h3 style="font-size:14px;margin:8px 0">待签收（围栏内）</h3>
        <div class="card-list">
          ${
            pending.length
              ? pending
                  .map(
                    (w) =>
                      wbCard(
                        w,
                        `<button class="btn primary block" data-act="sign" data-id="${w.id}">模拟电子围栏内签收</button>`
                      )
                  )
                  .join("")
              : `<div class="empty">暂无待签收运单</div>`
          }
        </div>
        <h3 style="font-size:14px;margin:16px 0 8px">异议期中（运营可提前结束演示）</h3>
        <div class="card-list">
          ${
            objection.length
              ? objection
                  .map(
                    (w) =>
                      wbCard(
                        w,
                        `<button class="btn warn block" data-act="endObjection" data-id="${w.id}">结束异议期并首笔代扣 60%</button>`
                      )
                  )
                  .join("")
              : `<div class="empty">无异议期运单</div>`
          }
        </div>
      </div>
    </div>`;
  }

  function viewAdmin() {
    const tabs = [
      { id: "board", label: "全省看板" },
      { id: "deduct", label: "代扣记录" },
      { id: "credit", label: "信用分" },
      { id: "fallback", label: "兜底队列" },
    ];
    const monthDeduct = state.deductions.reduce((s, d) => s + d.amount, 0) + 186000; // base mock
    const fallbackQueue = state.waybills.filter(
      (w) => w.status === "tail_due" && (w.overdueDemo || (w.graceAt && w.graceAt <= today()))
    );
    const tab = state.adminTab || "board";

    let body = "";
    if (tab === "board") {
      const max = Math.max(...state.cityBars.map((b) => b.value));
      body = `
        <div class="metrics four">
          <div class="metric"><div class="v">${yuan(monthDeduct)}</div><div class="l">本月代扣总额（含模拟底数）</div></div>
          <div class="metric ok"><div class="v">6.8%</div><div class="l">加盟商拖欠率</div></div>
          <div class="metric warn"><div class="v">${yuan(
            state.deductions.filter((d) => d.type === "FULL_TAIL").reduce((s, d) => s + d.amount, 0) + (fallbackQueue.length ? 0 : 18600)
          )}</div><div class="l">本月兜底金额</div></div>
          <div class="metric ok"><div class="v">97.1%</div><div class="l">承运商准点率</div></div>
        </div>
        <div class="wb-card">
          <div class="wb-id">各地市代扣分布（示例）</div>
          <div class="bars" style="margin-top:10px">
            ${state.cityBars
              .map(
                (b) => `<div class="bar-row"><div>${b.label}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${(b.value / max) * 100}%"></div></div>
                <div>${b.value}万</div></div>`
              )
              .join("")}
          </div>
        </div>
        <div class="callout info">资金定位：极兔河南在加盟商授权下从每日应付结算款中抵扣代付，不沉淀资金、不开资金池。测试环境未接真实结算接口。</div>`;
    } else if (tab === "deduct") {
      body = `<div class="table-wrap"><table>
        <thead><tr><th>时间</th><th>运单</th><th>加盟商</th><th>类型</th><th>金额</th><th>批次</th><th>结果</th><th>凭证</th></tr></thead>
        <tbody>
          ${state.deductions
            .map(
              (d) => `<tr>
              <td>${d.at}</td><td>${d.waybillId}</td><td>${d.franchiseName}</td>
              <td>${d.typeLabel}</td><td>${yuan(d.amount)}</td><td>${d.batchId}</td>
              <td><span class="status ${d.resultTone === "ok" ? "done" : "tail_due"}">${d.result}</span></td>
              <td>${d.voucher}</td></tr>`
            )
            .join("")}
        </tbody></table></div>`;
    } else if (tab === "credit") {
      body = `<div class="table-wrap"><table>
        <thead><tr><th>加盟商</th><th>信用分</th><th>首笔代扣比例</th><th>备注</th></tr></thead>
        <tbody>
          ${state.credits
            .map(
              (c) => `<tr><td>${c.name}</td><td><b>${c.score}</b></td><td>${c.ratio}</td><td>${c.note}</td></tr>`
            )
            .join("")}
        </tbody></table></div>
        <div class="callout warn" style="margin-top:12px">规则摘要：按时付尾款加分；被兜底扣分；分数低则提高首笔比例（可达 80%–100%），并可能要求追加保证金。</div>`;
    } else {
      body = `
        <div class="callout danger">账期+宽限期已满且承运商未确认收款的运单，可一键触发兜底全额代扣（模拟）。</div>
        <div class="card-list">
          ${
            fallbackQueue.length
              ? fallbackQueue
                  .map(
                    (w) =>
                      wbCard(
                        w,
                        `<button class="btn danger sm" data-act="fallback" data-id="${w.id}">触发兜底全额代扣 ${yuan(w.tailAmount)}</button>
                         <button class="btn ghost sm" data-act="detail" data-id="${w.id}">详情</button>`
                      )
                  )
                  .join("")
              : `<div class="empty">当前无超期兜底队列 · 可用预置运单 WB-HN-0007 演示</div>`
          }
        </div>`;
    }

    return `<div class="desk-shell">
      <div class="screen-head" style="background:#fff;border:1px solid var(--line);border-radius:12px 12px 0 0">
        <h2>极兔河南 · 管理后台</h2>
        <span class="badge warn">测试环境 · 模拟数据</span>
      </div>
      <div class="screen-body" style="background:#fff;border:1px solid var(--line);border-top:none;border-radius:0 0 12px 12px">
        <div class="tabs">
          ${tabs
            .map(
              (t) =>
                `<button type="button" class="tab ${tab === t.id ? "active" : ""}" data-admin-tab="${t.id}">${t.label}</button>`
            )
            .join("")}
        </div>
        ${body}
      </div>
    </div>`;
  }

  function showDetail(id) {
    const wb = findWb(id);
    if (!wb) return;
    openModal(
      "运单详情 " + wb.id,
      `<div class="detail-kv">
        <div class="k">状态</div><div>${statusBadge(wb.status)}</div>
        <div class="k">线路</div><div>${wb.route}</div>
        <div class="k">加盟商</div><div>${wb.franchiseName}</div>
        <div class="k">承运商</div><div>${wb.carrierName || "—"}</div>
        <div class="k">合同价</div><div>${yuan(wb.price)}</div>
        <div class="k">首笔 / 尾款</div><div>${yuan(wb.firstAmount)} / ${yuan(wb.tailAmount || wb.price - wb.firstAmount)}</div>
        <div class="k">封签</div><div>${wb.sealNo || "—"}</div>
        <div class="k">尾款到期</div><div>${wb.tailDueAt || "—"}（宽限 ${wb.graceAt || "—"}）</div>
        <div class="k">凭证</div><div>${wb.voucherNo || "—"}</div>
      </div>
      <div class="wb-id">履约时间线</div>
      <div class="timeline">
        ${wb.events
          .map((e) => `<div class="tl-item"><div class="t">${e.t}</div><div>${e.text}</div></div>`)
          .join("")}
      </div>`,
      [{ label: "关闭", ghost: true }]
    );
  }

  function bindMainActions() {
    const main = document.getElementById("main");
    const form = document.getElementById("publishForm");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const route = String(fd.get("route"));
        const parts = route.split("→").map((s) => s.trim());
        publishWaybill({
          route,
          fromHub: parts[0] || "始发分拨",
          toHub: parts[1] || "目的分拨",
          vehicleNeed: String(fd.get("vehicleNeed")),
          price: fd.get("price"),
          loadAt: String(fd.get("loadAt")),
          arriveSla: String(fd.get("arriveSla")),
        });
      };
    }
    main.querySelectorAll("[data-act]").forEach((btn) => {
      btn.onclick = () => {
        const act = btn.getAttribute("data-act");
        const id = btn.getAttribute("data-id");
        if (act === "accept") acceptWaybill(id);
        if (act === "load") driverLoad(id);
        if (act === "sign") hubSign(id);
        if (act === "endObjection") endObjection(id);
        if (act === "confirmTail") confirmTail(id);
        if (act === "fallback") triggerFallback(id);
        if (act === "detail") showDetail(id);
      };
    });
    main.querySelectorAll("[data-admin-tab]").forEach((btn) => {
      btn.onclick = () => {
        state.adminTab = btn.getAttribute("data-admin-tab");
        save();
        render();
      };
    });
  }

  function render() {
    document.getElementById("clock").textContent = "模拟时钟 " + (state.clock || nowStr());
    renderRoleBar();
    renderScript();
    const main = document.getElementById("main");
    const map = {
      franchise: viewFranchise,
      carrier: viewCarrier,
      driver: viewDriver,
      hub: viewHub,
      admin: viewAdmin,
    };
    main.innerHTML = (map[state.role] || viewFranchise)();
    bindMainActions();
  }

  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") e.target.classList.add("hidden");
  });

  save();
  render();
})();
