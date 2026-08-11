<template>

  <div class="h-100 flex-center">

    <div class="text-center h-50">

      <img class="obj h-50" src="../../assets/mFace.gif" alt="Small">

      <p class="title obj">FierceMonkey_OS</p>

      <img class="barL" src="../../assets/loadingBarOrg5.gif" alt="loading">

    </div>

  </div>

</template>

<script>

  import { TweenMax} from "gsap/all";
  import { TIMING } from '../helpers/bootSequence';

  export default {

    name: "LoadingTwo",

    data(){
      return{

        subStep: 0

      }
    },

    watch: {

      subStep(){

        if(this.subStep === 1){

          this.$emit('secondDone', true);

        }

      }

    },

    mounted() {

      TweenMax.staggerFromTo('.obj', TIMING.logo.fadeIn, {autoAlpha:0, y: TIMING.logo.riseFrom}, {autoAlpha: 1, y: 0 }, TIMING.logo.stagger );
      TweenMax.staggerFromTo('.barL', TIMING.logo.fadeIn, {opacity: 0}, {opacity: 1});

      let to = this;

      setTimeout( to.increaseVal , TIMING.logoHoldMs);

    },

    methods: {

      increaseVal(){

        this.subStep++;

      }

    }

  }
</script>

<style scoped>

</style>