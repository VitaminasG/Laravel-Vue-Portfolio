<template>

    <div id="_login" class="flex-center">

        <div class="__link">
            <router-link to="/">
                <img src="../../assets/exit.svg">
            </router-link>
        </div>

        <div id="_panel" class="flex-block h-50 w-25">

            <article v-if="error" class="_box-error flex-block mb-1">
                <div class="_box-header flex fontSize-1h">
                    <p>Access Denied</p>
                </div>
                <div class="_box-body text-center fontSize-1h">
                    {{ message }}
                </div>
            </article>

            <article class="_box flex-block mb-1">
                <div class="_box-header flex">
                    <p class="p-1 fontSize-1h w-75 text-center text-underline">
                        SignIn
                    </p>
                </div>
            </article>

            <div class="field">
                <label>Email</label>
                <div class="w-100">
                    <input class="_input w-100" type="email" name="email" v-model="email">
                </div>
            </div>

            <div class="field">
                <label>Password</label>
                <div class="w-100">
                    <input class="_input w-100" type="password" name="password" v-model="password">
                </div>
            </div>

            <div class="flex-center">
                <button class="_box-button" @click.prevent="login">Login</button>
            </div>
        </div>

    </div>

</template>

<script>

    import axios from 'axios';
    import auth from '../helpers/operator';

    export default {
        name: "login",
        data(){
            return {
                email:'',
                password:'',
                error: false,
                message:'',
            }
        },
        methods:{
            login(){
                let data = {
                    email: this.email,
                    password: this.password
                };

                axios.post('/api/login', data)
                    .then(({data})=>{
                        this.error = false;
                        this.message = '';
                        auth.login(data.token, data.name);
                        this.$router.push('/Dashboard');
                    })
                    .catch(({response})=>{
                        this.error = true;
                        this.message = response.data.message;
                        console.log(response.data.message);
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

    ._box{
        border: 2px dashed #c6c327;
        color: #eae728;
        text-shadow: 0 0 5px rgba(134, 198, 11, 0.60);
    }

    ._box-error{
        padding: 0.5rem;
        border: 2px dashed #c63a42;
        color: #c63a42;
        text-shadow: 0 0 5px rgba(198, 58, 66, 0.6);
    }

    ._input{
        border: 2px dashed #86c60b;
    }

    ._box-button {
        border: 1px dashed #86c60b;
        padding: 0.2rem;
        background: none;
        color: #86c60b;
        width: 50%;
    }

    ._box-button:hover {
        border: 1px dashed #86c60b;
        box-shadow: 0 0 3px rgba(134, 198, 11, 0.60);
    }

</style>