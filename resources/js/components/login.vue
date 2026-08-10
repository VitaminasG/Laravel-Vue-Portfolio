<template>

  <div>

    <div class="form-field">
      <label>Username :</label>
      <input ref="username" v-model="username" v-focus type="text" @keyup.enter="user = true">
    </div>

    <div v-if="user" class="form-field">
      <label>Password :</label>
      <input v-model="password" v-focus type="password" @keyup.enter="check">
    </div>

    <div v-if="error.length > 0">
      <label>{{ error }}</label>
      <input v-focus type="text" @keyup.enter="restart">
    </div>

  </div>

</template>

<script>
  export default {

    name: "Login",

    directives: {
      focus: {
        // directive definition
        inserted: function (el) {
          el.focus()
        }
      }
    },

    data(){
      return {
        error: '',
        username: '',
        password: '',
        user: false,
        passed: ''
      }
    },

    methods: {

      check(){

        if(this.username === 'visitor' && this.password === 'visiting'){
          this.passed = true;
          this.$emit('loginData', this.passed);
        } else {
          this.passed = false;
          this.$emit('loginData', this.passed);
          this.error = 'Incorect Username or Password. Please press "ENTER" and try again!';
        }

      },

      restart(){

        this.$refs.username.focus();
        this.user = false;
        this.error = '';

      }

    }
  }
</script>

<style scoped>

    .form-field > input {
        font-size: 1.5em;
    }

</style>