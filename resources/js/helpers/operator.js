class Operator {

    // Getters & Setters

    // DEBUG mode.
    /**
     * Get and Set debug mode.
     *
     * @returns {boolean}
     */
    get debug() {
        return this._debug;
    }

    set debug(value) {
        this._debug = value;
    }

    // Constructor
    constructor() {

        // Debug mode.
        this._debug = false;

        // Default settings.
        this.token = null;
        this.user = null;
    }

    /**
     * Store back-end admin token and name.
     * @param token
     * @param user
     *
     * @return {boolean}
     */
    login(token, user) {

        depot.setLoc('token', token);
        depot.setLoc('user', user);

        // check if token locStore was set correctly
        if(!depot.getLoc('token')){

            console.log('Token not found!');
            return this.confirmed ;

        } else {

            this.token = depot.getLoc('token');
            this.user = depot.getLoc('user');
            this.confirmed = true;

        }

        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

        return this.confirmed ;
    };

    /**
     * Logout for dashboard.
     * Still in progress...
     *
     * @return {boolean} - Set to True to trigger something...
     */
    logout(){

        depot.clearStore();

        return true;

    }

    /**
     * Check if token exist;
     *
     * @return {values}
     */
    confirm() {

        return depot.getLoc('token');
    };

}

export default new Operator();