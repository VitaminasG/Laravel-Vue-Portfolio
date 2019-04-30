class Serve {

    constructor(){

        // temporary
        this.debug = true;
    }

    /**
     * Ajax call if Admin changed default
     * Check Laravel user_table migration line:28
     *
     * @return {void}
     */
    freshLog() {

        window.axios.get('/api/verify')

        // onFulFilled
            .then(success => {

                if(this.debug) {
                    console.log(success.statusText);
                }

                auth.setLoc('_verified', success.data.check);

                if(this.debug) {
                    console.log('_verified, set to: ' + auth.getLoc('_verified'));
                }
            })

            // onRejected
            .catch(({response}) => {

                if(this.debug) {
                    console.log(response.statusText);
                }

                auth.setLoc('_verified', response.data.check);
            });
    };
}

export default new Serve();