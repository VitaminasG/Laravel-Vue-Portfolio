<template>

    <div>

            <div class="form-field">
                <label>Username :</label>
                <input type="text" v-focus v-model="username" ref="username" @keyup.enter="user = true">
            </div>

            <div class="form-field" v-if="user">
                <label>Password :</label>
                <input type="password" v-focus v-model="password" @keyup.enter="check">
            </div>

            <div v-if="error.length > 0">
                <label>{{ error }}</label>
                <input type="text" v-focus @keyup.enter="restart">
            </div>

    </div>

</template>

<script>
    export default {

        name: "Login",

        data(){
            return {
                error: '',
                username: '',
                password: '',
                user: false,
                passed: ''
            }
        },

        directives: {
            focus: {
                // directive definition
                inserted: function (el) {
                    el.focus()
                }
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