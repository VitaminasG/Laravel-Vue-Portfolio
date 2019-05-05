class depot {

    // Getters & Setters

    // DEBUG mode.
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

    // Constructor
    constructor(){
        this._debug = false;
        this.store = localStorage;
    }

    /**
     * Set - single item to local storage.
     * @param {string} name - custom name as key.
     * @param {...object} i - custom object value cast with json.stringify.
     */
    setLoc(name, i) {

        this.store.setItem(name, JSON.stringify(i));

        if(this._debug){
            console.log('SetLoc with name: ' + name + ' and value: ' + i);
        }

    };

    /**
     * Get - single item from local storage.
     * @param {string} name - custom name as key.
     *
     * @return {values} - return with json.parse.
     */
    getLoc(name) {

        if(!this.store.getItem(name)){

            console.log('Storage with name: ' + name + ' is empty! Was set to null.');
            this.store.setItem(name, null);

            return JSON.parse(this.store.getItem(name));

        } else {

            if(this._debug){
                console.log('getLoc with name: ' + name + ' , value: '
                    + JSON.parse(this.store.getItem(name)))
            }

            return JSON.parse(this.store.getItem(name))
        }
    };

    /**
     * Clear - local storage.
     *
     * @return {void}
     */
    clearStore(){

        if(this._debug){
            console.log('Storage was Cleared!')
        }
        this.store.clear();
    }

}

export default new depot();