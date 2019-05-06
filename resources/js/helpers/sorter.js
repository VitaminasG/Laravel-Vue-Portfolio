class Serve {

    // Getters & Setters

    // DEBUG mode.
    /**
     * Get - debug mode.
     * @returns {boolean}
     */
    get debug() {
        return this._debug;
    }

    /**
     * Set - debug mode.
     * @param {boolean} value.
     */
    set debug(value) {
        this._debug = value;
    }

    // API list.
    /**
     * Get - API list.
     *
     * @returns {array}
     */
    get apiList() {

        return this._apiList;
    }

    // Constructor

    constructor(){

        // Default settings.
        this._debug = false;
        this._apiList = this.list();
    }

    /**
     * Sorted list by method.
     * @param {object} list.
     * @param {string} method.
     *
     * @return {object}
     */
    sortedBy(list, method){

        if(this._debug) {
            console.log('Api list by method: '+ method);
        }

        return Object.entries(list[method]);
    }

    /**
     * A default - API list.
     *
     * @return {object}
     */
    list(){

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
            },
        };

        return apiL;
    }
}

export default new Serve();