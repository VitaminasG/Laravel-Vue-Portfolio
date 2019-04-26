class Auth {

    constructor(){
        this.token = null;
        this.user = null;
    }

    login(token, user) {

        window.localStorage.setItem('token', token);
        window.localStorage.setItem('user', JSON.stringify(user));

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }
}

export default new Auth();