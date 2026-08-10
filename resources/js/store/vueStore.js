import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import _store from "../helpers/depot";
import _sorter from "../helpers/sorter";

// Set custom Js-helpers to Global
window.depot = _store;
window.sorter = _sorter;

Vue.use(Vuex);

export default new Vuex.Store({

  state: {
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
    data: state => state.data,
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
    setData(state, data){
      state.data = data;
    }

  },

  actions:{

    setTarget({commit}, {list, method, route}){
      let newList = list[method];
      commit('setTarget', newList[route])
    },

    checkStorage({commit}){
      commit('setStorage');
    },

    freshA(context, url){

      return new Promise((resolve, reject) =>{
        axios.get(url)
          .then( success => {
            depot.setLoc('verified', success.data.check);
            resolve(success.data.check);
          })
          .catch(error => {
            console.error('Failed to check whether the admin has been verified.', error);
            reject(error);
          })
      })
    },

    freshB({dispatch, commit}, url){
      return dispatch('freshA', url).then(() => {
        commit('setVerified');
      })
    },

    loginA(context, { user, token }){

      depot.setLoc('user', user);
      depot.setLoc('token', token);

      // check if token locStore was set correctly
      if(!depot.getLoc('token')){

        console.error('Login succeeded but the token could not be stored; the session will not persist.');
        depot.setLoc('confirmed', false);

      } else {

        depot.setLoc('confirmed', true);

        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      }
    },

    loginB({ dispatch, commit }, { user, token }){
      return dispatch('loginA', {user:user, token:token} ).then(() => {
        commit('setStorage');
      })
    },

    stats({ dispatch, commit, getters}, url){
      dispatch('checkStorage').then(()=>{

        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + getters.token;

        return new Promise((resolve, reject) => {
          axios.get(url).then( success => {
            commit('setData', success.data.data);
            resolve();
          })
            .catch( error => {
              console.error('Failed to load dashboard stats.', error);
              reject(error);
            })
        })
      });

    },

    logout({commit, getters}){

      // Send the token explicitly instead of relying on
      // window.axios.defaults.headers.common['Authorization'], which is
      // only ever set as a side effect of loginA/stats and is never
      // rehydrated from localStorage on page load. Without this, a
      // logout fired before that default exists went out unauthenticated,
      // failed silently, and left the server-side token valid while the
      // UI reported a successful logout.
      return axios.post(getters.list.post.logout, {}, {
        headers: { Authorization: 'Bearer ' + getters.token }
      })
        .catch(error => {
          console.error('Logout request to the server failed; the API token may still be valid server-side.', error);
        })
        .then(() => {
          // Clear the local session even if the request failed, so the
          // user is never stuck in a half-logged-in state.
          depot.clearStore();
          delete window.axios.defaults.headers.common['Authorization'];
          commit('setStorage');
        });
    }
  }

});