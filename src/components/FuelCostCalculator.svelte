<script>
  let calculationType = 'fuel'; // 'fuel' or 'comparison'
  let distance = '';
  let fuelEfficiency = '';
  let fuelPrice = '';
  let alternativeCost = '';
  let tripsPerMonth = '';

  $: distanceKm = parseFloat(distance) || 0;
  $: efficiency = parseFloat(fuelEfficiency) || 0;
  $: price = parseFloat(fuelPrice) || 0;
  $: altCost = parseFloat(alternativeCost) || 0;
  $: trips = parseFloat(tripsPerMonth) || 0;

  // 燃料消費量（リットル）
  $: fuelConsumed = efficiency > 0 ? distanceKm / efficiency : 0;

  // 燃料コスト
  $: fuelCost = fuelConsumed * price;

  // 1kmあたりのコスト
  $: costPerKm = distanceKm > 0 ? fuelCost / distanceKm : 0;

  // 月間コスト（通勤などで定期的に使う場合）
  $: monthlyCost = fuelCost * trips;
  $: monthlyAltCost = altCost * trips;

  // 年間コスト
  $: yearlyCost = monthlyCost * 12;
  $: yearlyAltCost = monthlyAltCost * 12;

  // コスト差
  $: costDifference = monthlyAltCost - monthlyCost;
  $: yearlyCostDifference = costDifference * 12;
</script>

<div class="calculator">
  <h2>🚗 移動コスト計算</h2>
  <p class="description">燃費や交通費から移動コストを計算・比較</p>

  <div class="card">
    <div class="input-group">
      <label for="calculationType">計算タイプ</label>
      <select id="calculationType" bind:value={calculationType}>
        <option value="fuel">燃費計算のみ</option>
        <option value="comparison">他の交通手段と比較</option>
      </select>
    </div>

    <div class="input-group">
      <label for="distance">移動距離（km）</label>
      <input
        id="distance"
        type="number"
        bind:value={distance}
        placeholder="例: 50"
        min="0"
        step="0.1"
      />
    </div>

    <div class="input-group">
      <label for="fuelEfficiency">燃費（km/L）</label>
      <input
        id="fuelEfficiency"
        type="number"
        bind:value={fuelEfficiency}
        placeholder="例: 15"
        min="0"
        step="0.1"
      />
      <small>電気自動車の場合は km/kWh で入力可能</small>
    </div>

    <div class="input-group">
      <label for="fuelPrice">燃料価格（円/L）</label>
      <input
        id="fuelPrice"
        type="number"
        bind:value={fuelPrice}
        placeholder="例: 160"
        min="0"
        step="1"
      />
      <small>電気の場合は円/kWh（例: 30円/kWh）</small>
    </div>

    {#if calculationType === 'comparison'}
      <div class="input-group">
        <label for="alternativeCost">代替手段のコスト（円/回）</label>
        <input
          id="alternativeCost"
          type="number"
          bind:value={alternativeCost}
          placeholder="例: 500（電車・バスなど）"
          min="0"
          step="10"
        />
      </div>

      <div class="input-group">
        <label for="tripsPerMonth">月間利用回数<span class="optional">（任意）</span></label>
        <input
          id="tripsPerMonth"
          type="number"
          bind:value={tripsPerMonth}
          placeholder="例: 20（通勤など）"
          min="0"
          step="1"
        />
      </div>
    {/if}
  </div>

  {#if distanceKm > 0 && efficiency > 0 && price > 0}
    <div class="result">
      <div class="result-label">1回の移動コスト</div>
      <div class="result-value">¥{Math.round(fuelCost).toLocaleString()}</div>
      <div class="result-detail">{distanceKm}km あたり</div>
    </div>

    <div class="breakdown card">
      <h3>⛽ 燃費詳細</h3>
      <div class="breakdown-item">
        <span>移動距離</span>
        <span>{distanceKm}km</span>
      </div>
      <div class="breakdown-item">
        <span>燃料消費量</span>
        <span>{fuelConsumed.toFixed(2)}L</span>
      </div>
      <div class="breakdown-item">
        <span>燃料単価</span>
        <span>¥{price.toLocaleString()}/L</span>
      </div>
      <div class="breakdown-item highlight">
        <span>1回のコスト</span>
        <span>¥{Math.round(fuelCost).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>1kmあたり</span>
        <span>¥{costPerKm.toFixed(2)}</span>
      </div>
    </div>

    {#if calculationType === 'comparison' && altCost > 0}
      <div class="comparison card">
        <h3>🔄 交通手段の比較</h3>
        <div class="comparison-grid">
          <div class="comparison-option">
            <div class="option-header car">🚗 自動車</div>
            <div class="option-cost">¥{Math.round(fuelCost).toLocaleString()}</div>
            <div class="option-label">1回あたり</div>
            {#if trips > 0}
              <div class="option-monthly">月間: ¥{Math.round(monthlyCost).toLocaleString()}</div>
            {/if}
          </div>
          <div class="comparison-option">
            <div class="option-header alt">🚃 代替手段</div>
            <div class="option-cost">¥{Math.round(altCost).toLocaleString()}</div>
            <div class="option-label">1回あたり</div>
            {#if trips > 0}
              <div class="option-monthly">月間: ¥{Math.round(monthlyAltCost).toLocaleString()}</div>
            {/if}
          </div>
        </div>

        <div class="comparison-result">
          {#if fuelCost < altCost}
            <div class="result-badge better">
              自動車の方が <strong>¥{Math.round(altCost - fuelCost).toLocaleString()}</strong> お得
            </div>
          {:else if fuelCost > altCost}
            <div class="result-badge worse">
              代替手段の方が <strong>¥{Math.round(fuelCost - altCost).toLocaleString()}</strong> お得
            </div>
          {:else}
            <div class="result-badge equal">同じコストです</div>
          {/if}
        </div>

        {#if trips > 0}
          <div class="breakdown-item">
            <span>月間コスト差</span>
            <span class:positive={costDifference > 0} class:negative={costDifference < 0}>
              {costDifference > 0 ? '+' : ''}{Math.round(costDifference).toLocaleString()}円
            </span>
          </div>
          <div class="breakdown-item">
            <span>年間コスト差</span>
            <span class:positive={yearlyCostDifference > 0} class:negative={yearlyCostDifference < 0}>
              {yearlyCostDifference > 0 ? '+' : ''}{Math.round(yearlyCostDifference).toLocaleString()}円
            </span>
          </div>
        {/if}
      </div>
    {/if}

    <div class="info-box card">
      <h3>💡 参考情報</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">10km移動</div>
          <div class="info-value">¥{Math.round(costPerKm * 10).toLocaleString()}</div>
        </div>
        <div class="info-item">
          <div class="info-label">50km移動</div>
          <div class="info-value">¥{Math.round(costPerKm * 50).toLocaleString()}</div>
        </div>
        <div class="info-item">
          <div class="info-label">100km移動</div>
          <div class="info-value">¥{Math.round(costPerKm * 100).toLocaleString()}</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .calculator {
    max-width: 600px;
    margin: 0 auto;
  }

  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .description {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .optional {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: normal;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .breakdown {
    margin-top: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .breakdown-item:last-child {
    border-bottom: none;
  }

  .breakdown-item.highlight {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.1rem;
  }

  .positive {
    color: var(--error);
  }

  .negative {
    color: var(--success);
  }

  .comparison {
    margin-top: 1rem;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .comparison-option {
    padding: 1.5rem;
    background: var(--background);
    border-radius: 8px;
    text-align: center;
  }

  .option-header {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 6px;
  }

  .option-header.car {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
  }

  .option-header.alt {
    background: var(--surface);
    color: var(--text-primary);
  }

  .option-cost {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
  }

  .option-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  .option-monthly {
    font-size: 0.95rem;
    color: var(--text-secondary);
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
  }

  .comparison-result {
    margin-bottom: 1rem;
  }

  .result-badge {
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-size: 1rem;
  }

  .result-badge.better {
    background: var(--success);
    color: white;
  }

  .result-badge.worse {
    background: var(--background);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
  }

  .result-badge.equal {
    background: var(--background);
    color: var(--text-secondary);
  }

  .result-badge strong {
    font-size: 1.2rem;
  }

  .info-box {
    margin-top: 1rem;
    background: var(--background);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .info-item {
    text-align: center;
    padding: 1rem;
    background: var(--surface);
    border-radius: 8px;
  }

  .info-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .info-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  @media (max-width: 640px) {
    .comparison-grid {
      grid-template-columns: 1fr;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
