<template>

    <div id="_login" class="flex-center">

        <div id="_panel" class="flex-block h-50 w-25">

            <article v-if="error" class="_box-error flex-block mb-1">
                <div class="_box-header flex">
                    <p>Access Denied</p>
                </div>
                <div class="_box-body text-center">
                    {{ message }}
                </div>
            </article>

            <article v-if="success" class="_box-success flex-block mb-1">
                <div class="_box-header flex">
                    <p>Access Granted</p>
                </div>
                <div class="_box-body text-center flex-block">
                    {{ message }}
                    <div class="__link">
                        <router-link to="/login">
                            <a class="text-underline text-alert" @click.prevent="check">Go to Login Page</a>
                        </router-link>
                    </div>
                </div>
            </article>

            <article class="_box flex-block mb-1">
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
                    <input class="_input w-100" type="email" name="oldEmail" v-model="oldEmail">
                </div>
            </div>

            <div class="field">
                <label>Old Password</label>
                <div class="w-100">
                    <input class="_input w-100" type="password" name="oldPassword" v-model="oldPassword">
                </div>
            </div>

            <div class="field">
                <label>New Email</label>
                <div class="w-100">
                    <input class="_input w-100" type="email" name="email" v-model="email">
                </div>
            </div>

            <div class="field">
                <label>New Password</label>
                <div class="w-100">
                    <input class="_input w-100" type="password" name="password" v-model="password">
                </div>
            </div>

            <div class="flex-center">
                <button class="_box-button" @click.prevent="register">Verify</button>
            </div>
        </div>

    </div>

</template>

<script>

    import axios from 'axios';
    import auth from './../auth';

    export default {
        name: "register",
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
                            auth.verify();
                        }
                    })
                    .catch(({response})=>{
                        this.success = false;
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

    ._box-success{
        padding: 0.5rem;
        border: 2px dashed #86c60b;
        color: #86c60b;
        box-shadow: 0 0 5px rgba(134, 198, 11, 0.60);
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