<template>

  <div class="">

    <div class="modal" :class="{ 'is-active' : isActive}" role="dialog" aria-modal="true">

      <div class="modal-background" />

      <div class="modal-card w-50">

        <header class="modal-card-head">

          <h2 class="modal-card-title">

            <slot name="header" />

          </h2>

          <button class="delete" type="button" aria-label="Close window" @click="closeMod" />

        </header>

        <section class="modal-card-body">

          <!-- Form Field -->

          <form @submit.prevent="submit">

            <div class="field">

              <label class="label">Your Name: </label>

              <div class="control">

                <input v-model="fields.name" class="input" type="text" name="name" placeholder="e.g Alex Smith">

                <div class="error pt-1">

                  <p v-if="errors && errors.name" class="text-alert">
                    Please fill your name
                  </p>

                </div>

              </div>

            </div>

            <div class="field">

              <label class="label">Your Email Address: </label>

              <div class="control">

                <input v-model="fields.from" class="input" type="email" name="from" placeholder="e.g. alexsmith@gmail.com">

                <div class="error pt-1">

                  <p v-if="errors && errors.from" class="text-alert">
                    Please fill your email address
                  </p>

                </div>

              </div>

            </div>

            <div class="field">

              <textarea v-model="fields.message" class="textarea" name="message" placeholder="Please type your message here..." rows="5" />

              <div class="control error pt-1">

                <p v-if="errors && errors.message" class="text-alert">
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

    <div v-show="success" class="feedback text-center">

      <p>Your message received. I will contact you shortly.</p>

    </div>

  </div>

</template>

<script>

  import { store } from "../state-man";

  import { TimelineMax } from "gsap/all";

  export default {

    name: "MailMe",

    data(){

      return {

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

    mounted(){

      window.addEventListener('keydown', this.onKeydown);
    },

    beforeDestroy(){

      window.removeEventListener('keydown', this.onKeydown);
    },

    methods: {

      closeMod(){

        store.clearState();
        store.changeState(false);
        this.isActive = store.dispatchState();

        this.$emit('closed');

      },

      onKeydown(event){

        if(this.isActive && event.key === 'Escape'){

          this.closeMod();
        }

      },

      submit() {

        this.clear();

        axios.post('/ContactMe', this.fields).then(response => {

          this.fields = {};

          if(response.status === 200 ){

            this.feedback();

          }}).catch(error => {

          if( error.response ){

            this.errors = error.response.data.errors;

          } else if (error.request ){

            console.error('The contact form request never reached the server.', error.request);

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