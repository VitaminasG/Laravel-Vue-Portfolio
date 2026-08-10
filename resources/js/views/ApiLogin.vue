<template>

  <div id="_login" class="flex-center">

    <div class="__link">
      <router-link to="/">
        <img src="../../assets/exit.svg">
      </router-link>
    </div>

    <div id="_panel" class="flex-block h-50 w-25">

      <article v-if="error" class="dashed-box is-error flex-block mb-1">
        <div class="_box-header flex fontSize-1h">
          <p>Access Denied</p>
        </div>
        <div class="_box-body text-center fontSize-1h">
          {{ message }}
        </div>
      </article>

      <article class="dashed-box is-prompt flex-block mb-1">
        <div class="_box-header flex">
          <p class="p-1 fontSize-1h w-75 text-center text-underline">
            SignIn
          </p>
        </div>
      </article>

      <div class="field">
        <label>Email</label>
        <div class="w-100">
          <input v-model="email" class="dashed-input w-100" type="email" name="email">
        </div>
      </div>

      <div class="field">
        <label>Password</label>
        <div class="w-100">
          <input v-model="password" class="dashed-input w-100" type="password" name="password">
        </div>
      </div>

      <div class="flex-center">
        <button class="dashed-button" @click.prevent="login">Login</button>
      </div>
    </div>

  </div>

</template>

<script>

  import axios from 'axios';
  import store from './../store/vueStore';

  export default {
    name: "Login",
    data(){
      return {
        email:'',
        password:'',
        error: false,
        message:'',
      }
    },
    mounted(){

      //Checking if already logged-in
      store.dispatch('checkStorage').then(() => {
        if(store.getters.confirmed){
          this.$router.push('/Dashboard');
        }
      })
    },
    methods:{
      login(){

        let data = {
          email: this.email,
          password: this.password
        };

        axios.post('/api/login', data)
          .then( response => {
            this.error = false;
            this.message = '';
            store.dispatch('loginB', {user:response.data.name, token: response.data.token} );
            this.$router.push('/Dashboard');
          })
          .catch( ({ response }) => {
            this.error = true;
            this.message = response.data.message;
          })
      },
    }
  }

</script>

<style scoped>

    #_login{
        min-height: 100vh;
    }

    .__link{
        position: absolute;
        top: 2rem;
        right: 2rem;
    }

    .__link a:hover {

        filter: drop-shadow(0px 0px 2px rgba(151, 197, 29, 0.31)) invert(10%);

    }






</style>