import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import _auth from "./../helpers/police";
import _store from "./../helpers/operator";
import _servant from "./../helpers/barista";

// Set custom Js-helpers to Global
window.Police = _auth;
window.StorageOperator = _store;
window.Barista = _servant;

Vue.use(Vuex);

const vueStore =  new Vuex.Store({

    state: {
        debug: true,
        helper: {
            barista: Barista,
            operator: StorageOperator,
            police: Police,
        },
        verified: [],
        status:[],
        api:[],
        link:[],

    },

    mutations: {

        getlink(state, link){
            state.link = link;
        },
        getApi(state, api){
            state.api = api;
        },
        getVerify(state, verified){
            state.verified = verified;
        },
        getStatus(state, status){
            state.status = status;
        },

    },


    actions:{

        getVerify({ commit }){

            return axios.get(this.state.link)
                .then(success => commit('getVerify', success.data.check ))
                .catch(response => commit('getStatus', response.statusText))
        },


        getApi({commit}){

            if(!this.helper.barista){
                commit('getApi', this.helper.barista.apiList());
            }
        },

        getLink({commit}){
            let url = this.state.api['get'].verify.link;
            commit('getLink', url);
        }
    }

});

export default vueStore;