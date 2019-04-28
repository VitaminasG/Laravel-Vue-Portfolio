import axios from 'axios';

class Auth {

    constructor() {
        this.token = null;
        this.user = null;
        this.verified = false;
        this.confirmed = false;
    }

    // login(token, user) {
    //
    //     window.localStorage.setItem('token', token);
    //     window.localStorage.setItem('user', JSON.stringify(user));
    //
    //     axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    // };

    verify() {

        this.verified = false;

        axios.get('/api/verify')
            .then(({data}) => {
                this.verified = data;
            }).catch(({response}) => {
                console.log(response.statusText);
        });

        return this.verified;
    }

    confirm() {
        return this.confirmed;
    }
}

export default new Auth();