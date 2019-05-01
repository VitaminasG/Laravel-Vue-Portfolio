class Police {

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

        window.StorageOperator.setLoc('token', token);
        window.StorageOperator.setLoc('user', user);

        // check if token locStore was set correctly
        if(!window.StorageOperator.getLoc('token')){

            console.log('Token not found!');
            return this.confirmed ;

        } else {

            this.token = window.StorageOperator.getLoc('token');
            this.user = window.StorageOperator.getLoc('user');
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

        window.StorageOperator.clearStore();

        return true;

    }

    /**
     * Check if token exist;
     *
     * @return {values}
     */
    confirm() {

        return window.StorageOperator.getLoc('token');
    };

}

export default new Police();