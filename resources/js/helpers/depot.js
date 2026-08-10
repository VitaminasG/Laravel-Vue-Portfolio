class depot {

  constructor() {
    this.store = localStorage;
  }

  /**
   * Set - single item to local storage.
   * @param {string} name - custom name as key.
   * @param {...object} i - custom object value cast with json.stringify.
   */
  setLoc(name, i) {
    this.store.setItem(name, JSON.stringify(i));
  }

  /**
   * Get - single item from local storage.
   * @param {string} name - custom name as key.
   *
   * @return {values} - return with json.parse.
   */
  getLoc(name) {

    if (!this.store.getItem(name)) {
      this.store.setItem(name, null);
    }

    return JSON.parse(this.store.getItem(name));
  }

  /**
   * Clear - local storage.
   *
   * @return {void}
   */
  clearStore() {
    this.store.clear();
  }

}

export default new depot();
