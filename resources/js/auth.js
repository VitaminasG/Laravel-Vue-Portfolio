class Auth {

    /**
     * Get and Set _debug
     *
     * @returns {boolean}
     */
    get debug() {
        return this._debug;
    }

    set debug(value) {
        this._debug = value;
    }

    /**
     * Get and Set _verified
     *
     * @returns {values}
     */
    get verified() {

        return this.getLoc('_verified');
    }

    set verified(value) {

        this._verified = value;
    }

    constructor() {

        // Setter and Getters
        this._debug = true;
        this._verified = false;

        // default
        this.token = null;
        this.user = null;

        this.confirmed = false;
    }

    /**
     * Same as adminFirst.
     *
     * @return {boolean}
     */
    verify(){

        if(this._debug) {
            console.log('Run serve.freshLog');
        }

        serve.freshLog();
    }

    /**
     * Store back-end admin token and name.
     *
     * @return {void}
     */
    login(token, user) {

        this.setLoc('token', token);
        this.setLoc('user', user);

        // check if token locStore was set correctly
        if(!this.getLoc('token')){

            console.log('Token not found!');
            return;

        } else {

            this.token = this.getLoc('token');
            this.user = this.getLoc('user');

        }

        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

        this.confirmed = true;
    };

    /**
     * Logout for dashboard.
     * Still in progress...
     *
     * @return {boolean} - Set to True to trigger something...
     */
    logout(){

        this.clearStore();

        return true;

    }

    /**
     * Set - single item to local storage.
     * @param {string} name - custom name as key.
     * @param {...object} i - custom object value cast with json.stringify.
     */
    setLoc(name, i) {

        localStorage.setItem(name, JSON.stringify(i));

        if(this._debug){
            console.log('SetLoc with name: ' + name + 'and value: ' + i);
        }

    };

    /**
     * Get - single item from local storage.
     * @param {string} name - custom name as key.
     *
     * @return {values} - return with json.parse.
     */
    getLoc(name) {

        if(!localStorage.getItem(name)){

            console.log('Storage with name: ' + name + ' is empty!')

        } else {

            if(this._debug){
                console.log('getLoc with name: ' + name + ' , value: '
                    + JSON.parse(localStorage.getItem(name)))
            }

            return JSON.parse(localStorage.getItem(name))
        }
    };

    /**
     * Clear - local storage.
     */
    clearStore(){

        window.localStorage.clear();
    }

    /**
     * Check if token exist;
     *
     * @return {boolean}
     */
    confirm() {

        return !! this.getLoc('token');
    };

}

export default new Auth();