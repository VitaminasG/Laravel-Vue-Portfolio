<template>

    <div id="_login" class="flex-center">

        <div id="_panel" class="flex-block h-50">

            <article v-if="error" class="_box flex-block">
                <div class="_box-header flex">
                    <p>Access Denied</p>
                </div>
                <div class="_box-body">
                    {{ message }}
                </div>
            </article>

            <div class="field">
                <label>Email</label>
                <div class="">
                    <input class="_input" type="email" name="username" v-model="username">
                </div>
            </div>

            <div class="field">
                <label>Password</label>
                <div class="">
                    <input class="_input" type="password" name="password" v-model="password">
                </div>
            </div>

            <div class="flex-center">
                <button class="_box-button" @click="login">Login</button>
            </div>
        </div>

    </div>

</template>

<script>

    import axios from 'axios/index';

    export default {
        name: "login",
        data(){
            return {
                username:'',
                password:'',
                error: false,
                message:{},
            }
        },
        mounted(){
          axios.get('/api/login')
              .then(({data})=>{
                this.message = data;
                console.log(this.message);
            })
        },
        methods:{
            login(){
                let data = {
                    username: this.username,
                    password: this.password
                };

                axios.post('/api/login', data)
                    .then(({data})=>{
                        this.error = false;
                        this.message = '';
                        auth.login(data.token, data.user);
                        this.$router.push('/dashboard');
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

    ._box{
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

</style>