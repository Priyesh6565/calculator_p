const BASE = 1000;
const defaults = {
  materials: [
    { name: "CORN", rate: 5300, moisture: 100, percent: 0 },
    { name: "CUTTY", rate: 3200, moisture: 200, percent: 30 },
    { name: "SHOWDUST", rate: 5100, moisture: 150, percent: 70 },
    { name: "Material 4", rate: 0, moisture: 0, percent: 0 }
  ],
  processing: 1000,
  extra: 0,
  partyRate: 7900,
  ourRate: 6400
};

const $ = (id) => document.getElementById(id);
const money = (value) => Number.isFinite(value)
  ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value)
  : "—";
const num = (value) => value === "" ? NaN : Number(value);

function materialCard(item, index) {
  const card = document.createElement("article");
  card.className = "material-card";
  card.innerHTML = `
    <div class="material-title">
      <h3>${item.name}</h3>
      <span>Material ${index + 1}</span>
    </div>
    <div class="material-inputs">
      <div class="field">
        <label for="rate-${index}">Rate (₹)</label>
        <input id="rate-${index}" data-index="${index}" data-key="rate" type="number" inputmode="decimal" min="0" step="any" value="${item.rate}">
      </div>
      <div class="field">
        <label for="moisture-${index}">Moisture</label>
        <input id="moisture-${index}" data-index="${index}" data-key="moisture" type="number" inputmode="decimal" min="0" max="${BASE}" step="any" value="${item.moisture}">
      </div>
      <div class="field">
        <label for="percent-${index}">Material %</label>
        <input id="percent-${index}" data-index="${index}" data-key="percent" type="number" inputmode="decimal" min="0" max="100" step="any" value="${item.percent}">
      </div>
      <div class="field">
        <label>Final material</label>
        <input id="final-${index}" type="text" value="—" readonly aria-label="Calculated final material">
      </div>
    </div>
    <div class="calc-strip">
      <div class="calc-cell"><span>Final material rate</span><strong id="unit-${index}">—</strong></div>
      <div class="calc-cell"><span>Tone rate</span><strong id="tone-${index}">—</strong></div>
      <div class="calc-cell"><span>Final contribution</span><strong id="contribution-${index}">—</strong></div>
    </div>`;
  return card;
}

function build() {
  const host = $("materials");
  defaults.materials.forEach((item, index) => host.appendChild(materialCard(item, index)));
  document.querySelectorAll("input").forEach(input => input.addEventListener("input", calculate));
  $("reset").addEventListener("click", () => {
    defaults.materials.forEach((item, index) => {
      $(`rate-${index}`).value = item.rate;
      $(`moisture-${index}`).value = item.moisture;
      $(`percent-${index}`).value = item.percent;
    });
    $("processing").value = defaults.processing;
    $("extra").value = defaults.extra;
    $("partyRate").value = defaults.partyRate;
    $("ourRate").value = defaults.ourRate;
    calculate();
  });
  calculate();
}

function calculate() {
  let total = 0;
  let invalidMessages = [];
  const breakdown = $("breakdownRows");
  breakdown.innerHTML = "";

  defaults.materials.forEach((item, index) => {
    const rateInput = $(`rate-${index}`);
    const moistureInput = $(`moisture-${index}`);
    const percentInput = $(`percent-${index}`);
    const rate = num(rateInput.value);
    const moisture = num(moistureInput.value);
    const percent = num(percentInput.value);
    [rateInput, moistureInput, percentInput].forEach(el => el.setAttribute("aria-invalid", "false"));

    let invalid = false;
    if (!Number.isFinite(rate) || rate < 0) {
      rateInput.setAttribute("aria-invalid", "true"); invalidMessages.push(`${item.name}: enter a valid non-negative rate.`); invalid = true;
    }
    if (!Number.isFinite(moisture) || moisture < 0 || moisture >= BASE) {
      moistureInput.setAttribute("aria-invalid", "true"); invalidMessages.push(`${item.name}: moisture must be at least 0 and less than ${BASE}.`); invalid = true;
    }
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      percentInput.setAttribute("aria-invalid", "true"); invalidMessages.push(`${item.name}: percentage must be between 0 and 100.`); invalid = true;
    }

    const finalMaterial = BASE - moisture;
    const unitRate = rate / finalMaterial;
    const toneRate = unitRate * BASE;
    const contribution = toneRate * percent / 100;
    const ok = !invalid && Number.isFinite(contribution);

    $(`final-${index}`).value = Number.isFinite(finalMaterial) && finalMaterial >= 0 ? finalMaterial.toLocaleString("en-IN", {maximumFractionDigits: 4}) : "—";
    $(`unit-${index}`).textContent = ok ? unitRate.toFixed(4) : "—";
    $(`tone-${index}`).textContent = ok ? money(toneRate) : "—";
    $(`contribution-${index}`).textContent = ok ? money(contribution) : "—";

    if (ok) {
      total += contribution;
      const row = document.createElement("div");
      row.className = "breakdown-row";
      row.innerHTML = `<span>${item.name} (${percent}%)</span><strong>${money(contribution)}</strong>`;
      breakdown.appendChild(row);
    }
  });

  const processing = num($("processing").value);
  const extra = num($("extra").value);
  const partyRate = num($("partyRate").value);
  const ourRate = num($("ourRate").value);

  if (!Number.isFinite(processing) || processing < 0) invalidMessages.push("Processing cost must be a valid non-negative number.");
  if (!Number.isFinite(extra)) invalidMessages.push("Other adjustment must be a valid number.");
  if (!Number.isFinite(partyRate)) invalidMessages.push("Enter a valid party rate.");
  if (!Number.isFinite(ourRate)) invalidMessages.push("Enter a valid our rate.");

  const allValid = invalidMessages.length === 0;
  if (allValid) {
    total += processing + extra;
    $("totalFinal").textContent = money(total);
    $("totalBreakdown").textContent = money(total);
    $("ourRate").value = total.toFixed(2);
    $("profit").textContent = money(partyRate - total);
    const pRow = document.createElement("div");
    pRow.className = "breakdown-row";
    pRow.innerHTML = `<span>Processing cost</span><strong>${money(processing)}</strong>`;
    breakdown.appendChild(pRow);
    const eRow = document.createElement("div");
    eRow.className = "breakdown-row";
    eRow.innerHTML = `<span>Other adjustment</span><strong>${money(extra)}</strong>`;
    breakdown.appendChild(eRow);
    $("warning").hidden = true;
    $("warning").textContent = "";
  } else {
    $("totalFinal").textContent = "Check inputs";
    $("totalBreakdown").textContent = "—";
    $("profit").textContent = Number.isFinite(partyRate) && Number.isFinite(ourRate) ? money(partyRate - ourRate) : "—";
    $("warning").hidden = false;
    $("warning").textContent = [...new Set(invalidMessages)].join(" ");
  }
}

build();
