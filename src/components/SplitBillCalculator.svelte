<script>
  let totalAmount = '';
  let numberOfPeople = '';
  let roundingMethod = 'up'; // up, down, or fair

  $: perPerson = calculateSplit(totalAmount, numberOfPeople, roundingMethod);

  function calculateSplit(total, people, method) {
    if (!total || !people || people < 1) return null;

    const totalNum = parseFloat(total);
    const peopleNum = parseInt(people);
    const baseAmount = totalNum / peopleNum;

    let amounts = [];
    let remainder = totalNum;

    if (method === 'up') {
      // 切り上げ: 全員が同じ（切り上げた）金額を払う
      const perPerson = Math.ceil(baseAmount);
      amounts = Array(peopleNum).fill(perPerson);
      remainder = totalNum;
    } else if (method === 'down') {
      // 切り捨て: 全員が同じ（切り捨てた）金額を払う
      const perPerson = Math.floor(baseAmount);
      amounts = Array(peopleNum).fill(perPerson);
      remainder = totalNum - (perPerson * peopleNum);
    } else {
      // 公平: 端数を最初の数人が多く払う
      const perPerson = Math.floor(baseAmount);
      const extraPeople = totalNum - (perPerson * peopleNum);

      amounts = Array(peopleNum).fill(perPerson);
      for (let i = 0; i < extraPeople; i++) {
        amounts[i] += 1;
      }
      remainder = 0;
    }

    return {
      baseAmount,
      amounts,
      total: amounts.reduce((a, b) => a + b, 0),
      remainder: method === 'up' ? amounts.reduce((a, b) => a + b, 0) - totalNum : remainder
    };
  }

  function getAmountCounts(amounts) {
    if (!amounts) return [];

    const counts = {};
    amounts.forEach(amount => {
      counts[amount] = (counts[amount] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([amount, count]) => ({ amount: parseInt(amount), count }))
      .sort((a, b) => b.amount - a.amount);
  }

  $: amountCounts = getAmountCounts(perPerson?.amounts);
</script>

<div class="calculator">
  <h2>🍽️ 割り勘計算</h2>
  <p class="description">飲み会や食事の支払いを公平に分割</p>

  <div class="card">
    <div class="input-group">
      <label for="totalAmount">合計金額（円）</label>
      <input
        id="totalAmount"
        type="number"
        bind:value={totalAmount}
        placeholder="例: 15000"
        min="0"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="numberOfPeople">人数</label>
      <input
        id="numberOfPeople"
        type="number"
        bind:value={numberOfPeople}
        placeholder="例: 4"
        min="1"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="rounding">端数処理</label>
      <select id="rounding" bind:value={roundingMethod}>
        <option value="fair">公平分割（端数を最初の数人が負担）</option>
        <option value="up">切り上げ（全員同額・多めに集める）</option>
        <option value="down">切り捨て（全員同額・不足が出る）</option>
      </select>
    </div>
  </div>

  {#if perPerson}
    <div class="breakdown card">
      <h3>💡 支払い内訳</h3>

      {#if roundingMethod === 'fair'}
        {#each amountCounts as {amount, count}}
          <div class="breakdown-item">
            <span>{count}人</span>
            <span>¥{amount.toLocaleString()}ずつ</span>
          </div>
        {/each}
      {:else}
        <div class="breakdown-item">
          <span>1人あたり</span>
          <span>¥{perPerson.amounts[0].toLocaleString()}</span>
        </div>
      {/if}

      <div class="breakdown-divider"></div>

      <div class="breakdown-item">
        <span>合計</span>
        <span>¥{perPerson.total.toLocaleString()}</span>
      </div>

      {#if roundingMethod === 'up' && perPerson.remainder > 0}
        <div class="breakdown-item success">
          <span>余り（お釣り）</span>
          <span>+¥{perPerson.remainder.toLocaleString()}</span>
        </div>
      {:else if roundingMethod === 'down' && perPerson.remainder > 0}
        <div class="breakdown-item warning">
          <span>不足額</span>
          <span>-¥{Math.round(perPerson.remainder).toLocaleString()}</span>
        </div>
      {/if}
    </div>

    <div class="result">
      <div class="result-label">1人あたり</div>
      <div class="result-value">
        {#if roundingMethod === 'fair' && amountCounts.length > 1}
          ¥{amountCounts[0].amount.toLocaleString()} / ¥{amountCounts[1].amount.toLocaleString()}
        {:else}
          ¥{perPerson.amounts[0].toLocaleString()}
        {/if}
      </div>
      <div class="result-detail">
        {#if roundingMethod === 'fair' && amountCounts.length > 1}
          {amountCounts[0].count}人が¥{amountCounts[0].amount.toLocaleString()}、
          {amountCounts[1].count}人が¥{amountCounts[1].amount.toLocaleString()}
        {:else if roundingMethod === 'up'}
          全員が同額（切り上げ）
        {:else}
          全員が同額（切り捨て）
        {/if}
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

  .breakdown {
    margin-bottom: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
  }

  .breakdown-item.success {
    color: var(--success);
  }

  .breakdown-item.warning {
    color: var(--warning);
  }

  .breakdown-divider {
    height: 2px;
    background: var(--border-color);
    margin: 0.5rem 0;
  }
</style>
