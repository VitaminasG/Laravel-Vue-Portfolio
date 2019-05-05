import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import _store from "../helpers/depot";
import _sorter from "../helpers/sorter";

// Set custom Js-helpers to Global
window.depot = _store;
window.sorter = _sorter;

// Debug mode
window.depot.debug = false;
window.sorter.debug = false;

Vue.use(Vuex);

export default new Vuex.Store({

    state: {
        debug: true,
        api: {
            list: sorter.apiList,
            target:[],
        },
        session:{
            verified:'',
            confirmed:'',
            token:'',
            user:'',
        },
        status:[],
        data:[],
    },

    getters: {

        list: state => state.api.list,
        target: state => state.api.target,
        verified: state => state.session.verified,
        confirmed: state => state.session.confirmed,
        token: state => state.session.token,
        user: state => state.session.user,
    },

    mutations: {
        setTarget(state, target){
            state.api.target = target;
        },
        setStatus(state, status){
            state.status = status;
        },
        setVerified(state){
            state.session.verified = depot.getLoc('verified');
        },
        setStorage(state){
            state.session.confirmed = depot.getLoc('confirmed');
            state.session.token = depot.getLoc('token');
            state.session.user = depot.getLoc('user');
        },
        setConfirmed(state){
            state.session.confirmed = depot.getLoc('confirmed');
        },
        setToken(state){
          state.session.token = depot.getLoc('token');
        },
        setUser(state){
            state.session.user = depot.getLoc('user');
        },

    },

    actions:{

        setTarget({commit}, {list, method, route}){
            let newList = list[method];
            commit('setTarget', newList[route])
        },

        checkStorage({commit}){
          commit('setStorage');
        },

        freshA({commit}, url){

            return new Promise((resolve, reject) =>{
                axios.get(url)
                    .then( success => {
                        depot.setLoc('verified', success.data.check);
                        resolve(success.data.check);
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    })
            })
        },

        freshB({dispatch, commit}, url){
          return dispatch('freshA', url).then(() => {
              commit('setVerified');
          })
        },

        loginA({commit}, { user, token }){

            depot.setLoc('user', user);
            depot.setLoc('token', token);

            // check if token locStore was set correctly
            if(!depot.getLoc('token')){

                console.log('Token not found!');
                depot.setLoc('confirmed', false);

            } else {

                depot.setLoc('confirmed', true);

                axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            }
        },

        loginB({ dispatch, commit }, { user, token }){
            return dispatch('loginA', {user:user, token:token} ).then(() => {
                commit('setStorage');
            })
        },

        logout({commit}){

            return new Promise((resolve) => {
                depot.clearStore();
                delete axios.defaults.headers.common['Authorization'];
                resolve()
            }).then(() => {
                commit('setStorage');
            })
        }
    }

});