<template>

    <div class="">

        <div class="modal" v-bind:class="{ 'is-active' : this.isActive}">

            <div class="modal-background"></div>

            <div class="modal-card w-50">

                <header class="modal-card-head">

                    <p class="modal-card-title">

                        <slot name="header"></slot>

                    </p>

                    <button @click="closeMod" class="delete" ></button>

                </header>

                <section class="modal-card-body">

                <!-- Form Field -->

                    <form @submit.prevent="submit">

                        <div class="field">

                            <label class="label">Your Name: </label>

                            <div class="control">

                                <input class="input" type="text" name="name" v-model="fields.name" placeholder="e.g Alex Smith">

                                <div class="error pt-1">

                                    <p class="text-alert" v-if="errors && errors.name">
                                        Please fill your name
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div class="field">

                            <label class="label">Your Email Address: </label>

                            <div class="control">

                                <input class="input" type="email"  name="from" v-model="fields.from" placeholder="e.g. alexsmith@gmail.com">

                                <div class="error pt-1">

                                    <p class="text-alert" v-if="errors && errors.from">
                                        Please fill your email address
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div class="field">

                            <textarea class="textarea" name="message" v-model="fields.message" placeholder="Please type your message here..." rows="5">

                            </textarea>

                            <div class="control error pt-1">

                                <p class="text-alert" v-if="errors && errors.message">
                                   Please add message
                                </p>

                            </div>

                        </div>

                        <div class="field">

                            <div class="control py-1">

                                <button class="submit px-1">Submit</button>

                            </div>

                        </div>

                    </form>

                </section>

            </div>

        </div>

        <div class="feedback text-center" v-show="success">

            <p>Your message received. I will contact you shortly.</p>

        </div>

    </div>

</template>

<script>

    import { store } from "../state-man";

    import { TimelineMax } from "gsap/all";

    export default {

        name: "mailMe",

        data(){

            return {

                debug: false,

                isActive : '',
                success: false,
                message: '',


                fields: {},
                errors: {}

            }
        },

        watch: {

            isActive(){

                return store.dispatchState();

            }

        },

        created(){

            this.isActive = store.dispatchState();

        },

        methods: {

            closeMod(){

                store.clearState();
                store.changeState(false);
                this.isActive = store.dispatchState();

            },

            submit() {

                    this.clear();

                    if(this.debug){
                        console.log('Clearing Field and Error Obj!');
                    }

                    axios.post('/ContactMe', this.fields).then(response => {

                            if(this.debug){
                                console.log('Sending Data: ', this.fields);
                            }

                            this.fields = {};

                            if(response.status === 200 ){

                                this.feedback();

                            }}).catch(error => {

                                if( error.response ){

                                    this.errors = error.response.data.errors;

                                    if(this.debug){
                                        console.log('cached some errors : ', this.errors);
                                    }

                                } else if (error.request ){

                                    console.log(error.request);

                                }
                            });

            },

            clear(){

                this.errors = {};

            },

            // animation

            feedback(){

                this.success = true;

                let tl = new TimelineMax;

                tl.fromTo(".feedback", 1,{y: 60, opacity: 0 }, {y: 0, opacity: 1})
                    .to(".feedback", 1, {opacity: 0}, "+=3")

            }

        }
    }
</script>

<style scoped>

    .delete::before, .delete::after {
        background-color: #c33c3c;
    }

    .delete:hover {
        background-color: rgba(210,11,0,0.31);
    }

    .modal {
        text-shadow: none;
        color: #0a0a0a;
    }

    .modal-card-title {
        color: #0a0a0a;
    }

    .modal-card-body {
        font-size: 1.5em
    }

    .label {
        font-size: 1.25rem;
    }

    .input {
        font-size: 1.25rem;
    }

    input::placeholder {
        color: #6a6a6a;
    }

    textarea {
        font-size: 1.25rem;
    }

    textarea::placeholder {
        color: #6a6a6a;
        font-size: 1.25rem;
    }

    .error {
        height: 25px;
    }

    .text-alert {
        color: #c65f4b;
    }

    .submit {
        font-size: 1.25rem;
    }

    .feedback {
        color: #c4c4c4;
        text-shadow: 0 0 2px rgba(255, 234, 207, 0.8);
        font-size: 2em;
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 1.5em;
        background-color: #303030;
        z-index: 50;
    }


</style>