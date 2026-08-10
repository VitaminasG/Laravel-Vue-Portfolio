class Serve {

  /**
   * Get - API list.
   *
   * @returns {array}
   */
  get apiList() {
    return this._apiList;
  }

  constructor() {
    this._apiList = this.list();
  }

  /**
   * Sorted list by method.
   * @param {object} list.
   * @param {string} method.
   *
   * @return {object}
   */
  sortedBy(list, method) {
    return Object.entries(list[method]);
  }

  /**
   * A default - API list.
   *
   * @return {object}
   */
  list() {

    let apiP, apiL;

    // API prefix
    apiP = '/api/';

    // API list
    apiL = {
      get: {
        verify: apiP + 'verify',
        register: apiP + 'register',
        stats: apiP + 'stats',
      },
      post: {
        register: apiP + 'register',
        verify: apiP + 'login',
        logout: apiP + 'logout',
      },
    };

    return apiL;
  }
}

export default new Serve();