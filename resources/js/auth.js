import axios from 'axios';

class Auth {

    constructor() {

        // Change to True for debug
        this.debug = false;

        this.token = null;
        this.user = null;

        this.verified = '';
        this.confirmed = false;
    }

    freshLog() {

        // AJAX get request to check if user is verified credentials
        axios.get('/api/verify')

            // onFulFilled
            .then(success => {

                // Clear all items
                localStorage.clear();

                if(this.debug) {
                    console.log('Success!');
                    console.log(success);
                    console.log(success.statusText);
                }

                this.verified = success.data.check;
                this.setLoc('verified', this.verified);

                if(this.debug) {
                    console.log('Verify() will return value: ' + this.getLoc('verified'));
                }
            })

            // onRejected
            .catch(({response}) => {

                // Clear all items
                localStorage.clear();

                if(this.debug) {
                    console.log('Reject!');
                    console.log(response);
                    console.log(response.statusText);
                }

                this.verified = response.data.check;
                this.setLoc('verified', this.verified);
        });
    };

    login(token, user) {


        this.setLoc('token', token);

        this.setLoc('user', user);

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

        this.confirmed = true;
    };

    setLoc(name, i) {

        localStorage.setItem(name, JSON.stringify(i));

        if(this.debug){
            console.log('LocalStorage with name: ' + name);
            console.log('with value: ' + i)
        }

    };

    getLoc(name) {

        if(localStorage.getItem(name) === null){

            console.log('Storage with name: ' + name + ' is empty!')

        } else {

            if(this.debug){
                console.log('Get localStorage with name: '
                    + name + ' , value: '
                    + JSON.parse(window.localStorage.getItem(name)))
            }

            return JSON.parse(window.localStorage.getItem(name))
        }


    };

    verify(){

        this.freshLog();

        return this.getLoc('verified');
    }

    confirm() {

        return this.confirmed

    };

}

export default new Auth();