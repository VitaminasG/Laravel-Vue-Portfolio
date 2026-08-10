/**
 * The single source of API endpoint URLs for the parts of the app that resolve
 * them through Vuex (the router guard's verify check, the dashboard stats and
 * logout). ApiLogin and ApiRegister post to their endpoints directly, so those
 * are deliberately not listed here — an entry nobody reads is worse than no
 * entry, as the removed `post.verify` key showed: it pointed at /api/login and
 * read like it pointed at /api/verify.
 */
class Serve {

  /**
   * Get - API list.
   *
   * @returns {object}
   */
  get apiList() {
    return this._apiList;
  }

  constructor() {
    this._apiList = this.list();
  }

  /**
   * A default - API list.
   *
   * @return {object}
   */
  list() {

    const apiP = '/api/';

    return {
      get: {
        verify: apiP + 'verify',
        stats: apiP + 'stats',
      },
      post: {
        logout: apiP + 'logout',
      },
    };
  }
}

export default new Serve();
