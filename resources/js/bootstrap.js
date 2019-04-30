import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import gsap from 'gsap';
import _ from 'lodash';
import auth from './auth';
import serve from './serveApi';

window.Vue = Vue;
Vue.use(VueRouter);

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// TODO: make separate class for handling localStorage
window.auth = auth;
window.serve = serve;

// Change to true for debugging
auth.debug = false;
auth.verify();

let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

window._ = _;

window.gsap = gsap;
