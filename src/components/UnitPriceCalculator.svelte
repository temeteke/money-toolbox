<script>
  import { onMount } from 'svelte';
  import { getQueryParams, updateQueryParam, encodeData, decodeData } from '../utils/urlParams.js';

  // URLから初期データを読み込む
  let initialProducts = [
    { id: 1, name: '', price: '', amount: '', store: '' },
    { id: 2, name: '', price: '', amount: '', store: '' }
  ];
  let initialNextId = 3;

  if (typeof window !== 'undefined') {
    const params = getQueryParams();
    if (params.data) {
      const decoded = decodeData(params.data);
      if (decoded && decoded.products && Array.isArray(decoded.products)) {
        initialProducts = decoded.products;
        initialNextId = decoded.nextId || (Math.max(...decoded.products.map(p => p.id)) + 1);
      }
    }
  }

  let products = initialProducts;
  let nextId = initialNextId;

  // データが変更されたらURLを更新
  $: if (typeof window !== 'undefined') {
    const data = encodeData({ products, nextId });
    if (data) {
      updateQueryParam('data', data);
    }
  }

  function addProduct() {
    products = [...products, { id: nextId++, name: '', price: '', amount: '', store: '' }];
  }

  function removeProduct(id) {
    if (products.length > 2) {
      products = products.filter(p => p.id !== id);
    }
  }

  function getDisplayName(product) {
    const parts = [];
    if (product.name) parts.push(product.name);
    if (product.amount) parts.push(`${product.amount}`);
    if (product.store) parts.push(`(${product.store})`);
    return parts.length > 0 ? parts.join(' ') : `商品${product.id}`;
  }

  $: productsWithUnitPrice = products.map(product => ({
    ...product,
    unitPrice: product.price && product.amount
      ? parseFloat(product.price) / parseFloat(product.amount)
      : null,
    displayName: getDisplayName(product)
  }));

  $: sortedProducts = productsWithUnitPrice
    .filter(p => p.unitPrice !== null)
    .sort((a, b) => a.unitPrice - b.unitPrice);

  $: bestProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;

  $: comparison = sortedProducts.length >= 2
    ? {
        best: sortedProducts[0],
        worst: sortedProducts[sortedProducts.length - 1],
        diff: (((sortedProducts[sortedProducts.length - 1].unitPrice - sortedProducts[0].unitPrice) / sortedProducts[sortedProducts.length - 1].unitPrice) * 100).toFixed(1)
      }
    : null;

  function getRank(productId) {
    const index = sortedProducts.findIndex(p => p.id === productId);
    return index >= 0 ? index : -1;
  }

  function getUnitPrice(product) {
    return productsWithUnitPrice.find(p => p.id === product.id)?.unitPrice;
  }
</script>

<div class="calculator">
  <h2>🏷️ 単価比較</h2>
  <p class="description">容量違いや店舗違いの単価を比較してお得な選択肢を見つけます</p>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th class="rank-col">順位</th>
          <th>商品名</th>
          <th>容量</th>
          <th>店名</th>
          <th>価格（円）</th>
          <th>単価</th>
          <th class="action-col"></th>
        </tr>
      </thead>
      <tbody>
        {#each products as product (product.id)}
          {@const rank = getRank(product.id)}
          {@const unitPrice = getUnitPrice(product)}
          <tr class:best={rank === 0}>
            <td class="rank-cell">
              {#if rank === 0}
                <span class="rank-medal">🥇</span>
              {:else if rank === 1}
                <span class="rank-medal">🥈</span>
              {:else if rank === 2}
                <span class="rank-medal">🥉</span>
              {:else if rank > 2}
                <span class="rank-number">{rank + 1}</span>
              {/if}
            </td>
            <td>
              <input
                type="text"
                bind:value={product.name}
                placeholder="例: コーラ"
                class="table-input"
              />
            </td>
            <td>
              <input
                type="number"
                bind:value={product.amount}
                placeholder="500"
                min="0"
                step="0.1"
                class="table-input number-input"
              />
            </td>
            <td>
              <input
                type="text"
                bind:value={product.store}
                placeholder="例: スーパーA"
                class="table-input"
              />
            </td>
            <td>
              <input
                type="number"
                bind:value={product.price}
                placeholder="298"
                min="0"
                step="1"
                class="table-input number-input"
              />
            </td>
            <td class="unit-price-cell">
              {#if unitPrice}
                <span class="unit-price-value">¥{unitPrice.toFixed(2)}</span>
              {:else}
                <span class="unit-price-empty">-</span>
              {/if}
            </td>
            <td class="action-cell">
              {#if products.length > 2}
                <button class="remove-btn" on:click={() => removeProduct(product.id)} title="削除">×</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <button class="add-btn" on:click={addProduct}>+ 商品を追加</button>

  {#if comparison}
    <div class="result">
      <div class="result-label">最もお得なのは...</div>
      <div class="result-value">🎉 {comparison.best.displayName}！</div>
      <div class="result-detail">最も高い選択肢より約{comparison.diff}%お得です</div>
    </div>
  {/if}
</div>

<style>
  .calculator {
    max-width: 1200px;
    margin: 0 auto;
  }

  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .description {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
    margin-bottom: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }

  thead {
    background: var(--primary-color);
    color: white;
  }

  th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
  }

  th.rank-col {
    width: 60px;
    text-align: center;
  }

  th.action-col {
    width: 50px;
  }

  tbody tr {
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  tbody tr.best {
    background-color: #fffef0;
    border-left: 4px solid #ffd700;
  }

  tbody tr.best:hover {
    background-color: #fffce0;
  }

  td {
    padding: 0.75rem;
  }

  .rank-cell {
    text-align: center;
    font-size: 1.5rem;
  }

  .rank-medal {
    display: inline-block;
  }

  .rank-number {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .table-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
  }

  .table-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }

  .table-input.number-input {
    text-align: right;
  }

  .unit-price-cell {
    text-align: right;
    font-weight: bold;
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  .unit-price-value {
    color: var(--primary-color);
  }

  .unit-price-empty {
    color: #ccc;
  }

  .action-cell {
    text-align: center;
  }

  .remove-btn {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 1.25rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    padding: 0;
    line-height: 1;
  }

  .remove-btn:hover {
    background: #cc0000;
  }

  .add-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: opacity 0.2s;
  }

  .add-btn:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    th, td {
      padding: 0.5rem 0.4rem;
      font-size: 0.85rem;
    }

    .table-input {
      font-size: 0.85rem;
      padding: 0.4rem;
    }

    .rank-cell {
      font-size: 1.2rem;
    }

    .unit-price-cell {
      font-size: 0.95rem;
    }
  }
</style>
