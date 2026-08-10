<template>

  <div id="_login" class="flex-center">

    <div id="_panel" class="flex-block h-50 w-25">

      <article v-if="error" class="dashed-box is-error flex-block mb-1">
        <div class="_box-header flex">
          <p>Access Denied</p>
        </div>
        <div class="_box-body text-center">
          {{ message }}
        </div>
      </article>

      <article v-if="success" class="_box-success flex-block mb-1">
        <div class="_box-header flex">
          <p>Credentials was changed successfully!</p>
        </div>
        <div class="_box-body text-center flex-block">
          {{ message }}
          <div class="__link">
            <router-link to="/Login">
              <div class="text-underline text-alert">
                Go to Login Page
              </div>
            </router-link>
            <p>OR</p>
            <router-link to="/">
              <div class="text-underline text-alert">
                Back to Home Page
              </div>
            </router-link>
          </div>
        </div>
      </article>

      <article v-if="!success" class="dashed-box is-prompt flex-block mb-1">
        <div class="_box-header flex-block p-1">
          <p class="pt-1 fontSize-1h text-underline text-center">
            Register Page
          </p>
          <p class="pt-1 fontSize-1h">
            You are here because:
          </p>
          <p class="pt-1 fontSize-1h">
            A: You have been forced to do it.
          </p>
          <p class="pb-1 fontSize-1h">
            B: You want to change your credentials to super unpredictable...
          </p>
        </div>
      </article>

      <div class="field">
        <label>Old Email</label>
        <div class="w-100">
          <input v-model="oldEmail" class="dashed-input w-100" type="email" name="oldEmail">
        </div>
      </div>

      <div class="field">
        <label>Old Password</label>
        <div class="w-100">
          <input v-model="oldPassword" class="dashed-input w-100" type="password" name="oldPassword">
        </div>
      </div>

      <div class="field">
        <label>New Email</label>
        <div class="w-100">
          <input v-model="email" class="dashed-input w-100" type="email" name="email">
        </div>
      </div>

      <div class="field">
        <label>New Password</label>
        <div class="w-100">
          <input v-model="password" class="dashed-input w-100" type="password" name="password">
        </div>
      </div>

      <div class="flex-center">
        <button class="dashed-button" @click.prevent="register">Verify</button>
      </div>
    </div>

  </div>

</template>

<script>

  import axios from 'axios';

  export default {
    name: "Register",
    data(){
      return {
        oldEmail: '',
        email:'',
        oldPassword: '',
        password:'',
        message:'',
        error: false,
        success: false,
      }
    },

    methods:{
      register(){

        let data = {
          oldEmail: this.oldEmail,
          oldPassword: this.oldPassword,
          email: this.email,
          password: this.password
        };

        axios.post('/api/register', data)
          .then(success => {
            if(success.data.status === 201){
              this.error = false;
              this.success = true;
              this.message = success.data.message;
            }
          })
          .catch(({response})=>{
            this.success = false;
            this.error = true;
            this.message = response.data.message;
          });

        // Clear input after submit
        this.oldEmail = '';
        this.oldPassword = '';
        this.email = '';
        this.password = '';
      },
    }
  }

</script>

<style scoped>

    #_login{
        min-height: 100vh;
    }



    ._box-success{
        padding: 0.5rem;
        border: 2px dashed #86c60b;
        color: #86c60b;
        box-shadow: 0 0 5px rgba(134, 198, 11, 0.60);
    }




</style>