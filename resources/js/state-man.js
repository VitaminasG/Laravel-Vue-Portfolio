export const store = {

    debug: false,

    state: {

        show: false

    },

    changeState(boll) {

        this.state.show = boll;

        if (this.debug) {
            console.log('ChangeState triggered with ', boll);
            console.log('CurrentState is : ', this.state.show);
        }

    },

    clearState(){

        this.state.show = '';

        if (this.debug){
            console.log('clearState triggered', this.state.show);
            this.state.show = '';
        }

    },

    dispatchState(){

        if (this.debug){
            console.log('Dispatched with value: ', this.state.show );
        }

        return this.state.show;
    }

};