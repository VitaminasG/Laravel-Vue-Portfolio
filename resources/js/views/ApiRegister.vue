<template>

    <div id="_login" class="flex-center">

        <div id="_panel" class="flex-block h-50 w-25">

            <article class="_box flex-block mb-1">
                <div class="_box-header flex">
                    <p class="p-1 fontSize-1h w-75">
                        You are here because you have been forced to do it or you want to change your credentials...
                    </p>
                </div>
                <div class="_box-body text-center">
                    {{ message }}
                </div>
            </article>

            <div class="field">
                <label>Old Email</label>
                <div class="w-100">
                    <input class="_input w-100" type="email" name="oldEmail" v-model="oldEmail">
                </div>
            </div>

            <div class="field">
                <label>New Email</label>
                <div class="w-100">
                    <input class="_input w-100" type="email" name="email" v-model="email">
                </div>
            </div>

            <div class="field">
                <label>Old Password</label>
                <div class="w-100">
                    <input class="_input w-100" type="password" name="oldPassword" v-model="oldPassword">
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

    export default {
        name: "register",
        data(){
            return {
                oldEmail: '',
                email:'',
                oldPassword: '',
                password:'',
                message:'',
            }
        },
        methods:{
            register(){
                let data = {
                    oldEmail: this.oldEmail,
                    email: this.email,
                    oldPassword: this.oldPassword,
                    password: this.password
                };

                axios.post('/api/register', data)
                    .then(({data})=>{
                        this.message = '';
                        // this.$router.push('/Login');
                    })
                    .catch(({response})=>{
                        console.log(response.message);
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