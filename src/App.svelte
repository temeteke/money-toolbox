<script>
  import { writable } from 'svelte/store';
  import UnitPriceCalculator from './components/UnitPriceCalculator.svelte';
  import DiscountCalculator from './components/DiscountCalculator.svelte';
  import TaxCalculator from './components/TaxCalculator.svelte';
  import SplitBillCalculator from './components/SplitBillCalculator.svelte';

  const activeTab = writable('unit-price');

  const tabs = [
    { id: 'unit-price', label: '単価比較', icon: '🏷️' },
    { id: 'discount', label: '割引計算', icon: '💰' },
    { id: 'tax', label: '税込/税抜', icon: '🧾' },
    { id: 'split', label: '割り勘', icon: '🍽️' }
  ];

  function setTab(tabId) {
    activeTab.set(tabId);
  }
</script>

<main>
  <header>
    <div class="container">
      <h1>💼 Money Toolbox</h1>
      <p class="subtitle">日常のお金の判断をサポート</p>
    </div>
  </header>

  <nav class="tabs">
    <div class="container">
      <div class="tab-list">
        {#each tabs as tab}
          <button
            class="tab"
            class:active={$activeTab === tab.id}
            on:click={() => setTab(tab.id)}
          >
            <span class="tab-icon">{tab.icon}</span>
            <span class="tab-label">{tab.label}</span>
          </button>
        {/each}
      </div>
    </div>
  </nav>

  <div class="container">
    <div class="content">
      {#if $activeTab === 'unit-price'}
        <UnitPriceCalculator />
      {:else if $activeTab === 'discount'}
        <DiscountCalculator />
      {:else if $activeTab === 'tax'}
        <TaxCalculator />
      {:else if $activeTab === 'split'}
        <SplitBillCalculator />
      {/if}
    </div>
  </div>

  <footer>
    <div class="container">
      <p>&copy; 2024 Money Toolbox</p>
    </div>
  </footer>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 2rem 0 1.5rem;
    box-shadow: 0 2px 8px var(--shadow);
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    opacity: 0.9;
    font-size: 0.95rem;
  }

  .tabs {
    background: var(--surface);
    border-bottom: 2px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 4px var(--shadow);
  }

  .tab-list {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tab-list::-webkit-scrollbar {
    display: none;
  }

  .tab {
    flex: 1;
    min-width: 120px;
    padding: 1rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 3px solid transparent;
  }

  .tab:hover {
    background: var(--background);
    color: var(--text-primary);
  }

  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: 600;
  }

  .tab-icon {
    font-size: 1.5rem;
  }

  .tab-label {
    font-size: 0.85rem;
  }

  .content {
    flex: 1;
    padding: 1.5rem 0;
  }

  footer {
    background: var(--surface);
    padding: 1.5rem 0;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border-color);
    margin-top: 2rem;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 1.5rem;
    }

    .tab {
      min-width: 90px;
      padding: 0.75rem 0.5rem;
    }

    .tab-icon {
      font-size: 1.25rem;
    }

    .tab-label {
      font-size: 0.75rem;
    }
  }
</style>
