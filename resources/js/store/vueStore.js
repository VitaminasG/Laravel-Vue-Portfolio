import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import _store from "../helpers/depot";
import _sorter from "../helpers/sorter";

// Set custom Js-helpers to Global
window.depot = _store;
window.sorter = _sorter;

// Debug mode
window.depot.debug = true;
window.sorter.debug = true;

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
        token: state => state.session.token,
        user: state => state.session.user,
    },

    mutations: {
        setTarget(state, target){
            state.api.target = target;
        },
        setVerified(state){
            state.session.verified = depot.getLoc('verified');
        },
        setStatus(state, status){
            state.status = status;
        },

    },

    actions:{

        setTarget({commit}, {list, method, route}){
            let newList = list[method];
            commit('setTarget', newList[route])
        },

        freshA({commit}, url){

            depot.clearStore();

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
    }

});