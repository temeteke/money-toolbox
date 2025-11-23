<script>
  export let isOpen = false;
  export let features = [];
  export let onSelect;

  function handleSelect(featureId) {
    onSelect(featureId);
    isOpen = false;
  }

  function handleClose() {
    isOpen = false;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        <h2>その他の機能</h2>
        <button class="close-button" on:click={handleClose}>×</button>
      </div>
      <div class="features-grid">
        {#each features as feature}
          <button class="feature-card" on:click={() => handleSelect(feature.id)}>
            <span class="feature-icon">{feature.icon}</span>
            <span class="feature-label">{feature.label}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: var(--surface);
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h2 {
    font-size: 1.5rem;
    margin: 0;
    color: var(--text-primary);
  }

  .close-button {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:hover {
    background: var(--background);
    color: var(--text-primary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--background);
    cursor: pointer;
    transition: all 0.2s;
  }

  .feature-card:hover {
    background: var(--surface);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px var(--shadow);
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .feature-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    text-align: center;
  }

  @media (max-width: 640px) {
    .features-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
      padding: 1rem;
    }

    .feature-card {
      padding: 1.25rem 0.75rem;
    }

    .feature-icon {
      font-size: 2rem;
    }

    .feature-label {
      font-size: 0.85rem;
    }
  }
</style>
