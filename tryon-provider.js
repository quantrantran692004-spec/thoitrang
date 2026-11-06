// Preview provider contract. A future AI provider can implement the same
// preview({ productId, looks }) method without changing the shop interface.
(() => {
  const statuses = Object.freeze(['ready', 'generating', 'completed', 'failed', 'unavailable']);
  class SavedLookProvider {
    constructor() { this.status = 'ready'; }
    preview({ productId, looks }) {
      try {
        const matches = looks.filter(look => look.image && look.products.includes(productId));
        this.status = matches.length ? 'completed' : 'unavailable';
        return { status: this.status, looks: matches };
      } catch (error) {
        this.status = 'failed';
        return { status: this.status, looks: [], error };
      }
    }
  }
  window.TryOnProvider = { statuses, SavedLookProvider };
})();
