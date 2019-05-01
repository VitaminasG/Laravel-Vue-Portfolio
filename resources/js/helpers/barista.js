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

        if(!this._apiList) {
            return this._apiList;
        }

        return this.getList();
    }

    /**
     * Set - new API list.
     * @param value.
     */
    set apiList(value) {

        this.setList(value);
    }

    // CONSTRUCTOR

    constructor(){

        // Default settings.
        this._debug = false;
        this._apiList = this.list();
    }

    /**
     * Get URL list for Back-end Routes.
     *
     * @return {object}.
     * @
     */
    getList(){

        console.log('SomeOne lost a List! Please, barista.serve.list() !!!');

        // Get a new default list.

        return Object.entries(this.list());

    }

    /**
     * Set a new API list.
     * @param {object} newList.
     */
    setList(newList){

        if(this._debug) {
            console.log('Set a new API list...');
        }

        this.apiList = newList;
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
                verify: {link: apiP + 'verify', method: 'get'},
                register: {link: apiP + 'register', method: 'get'},
            },
            post: {
                register: {link: apiP + 'register', method: 'post'},
                verify: {link: apiP + 'login', method: 'post'},
            },
        };

        return apiL;
    }
}

export default new Serve();