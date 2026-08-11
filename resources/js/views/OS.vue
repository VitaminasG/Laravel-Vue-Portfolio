<template>

  <div>

    <div class="container is-fluid">

      <div v-if="!gui" class="flex-loading">

        <loading-one v-if="osStep === 1" @firstDone="waitingFirst($event)" />
        <loading-two v-if="osStep === 2" @secondDone="waitingSecond($event)" />

        <button type="button" class="skip-intro" @click="reveal">
          Press [ESC] to skip
        </button>

      </div>

    </div>

    <desktop v-if="gui" v-cloak />

  </div>

</template>

<script>

  import { shouldSkipBoot, rememberBoot } from '../helpers/bootSequence';

  const loadingOne = () => import('../components/loadingOne');
  const loadingTwo = () => import('../components/loadingTwo');
  const desktop = () => import('../components/desktop');

  export default {

    name: "Home",

    components: {

      loadingOne,
      loadingTwo,
      desktop
    },

    data(){
      return{
        gui: false,
        osStep: 1
      }
    },

    watch: {

      osStep(){

        if(this.osStep === 3){

          this.display = false;
          this.reveal();
        }
      }
    },

    created(){

      // A returning visitor, or one whose system asks for reduced motion, goes
      // straight to the desktop. `/OS?boot=1` replays the sequence.
      if(shouldSkipBoot()){

        this.gui = true;
      }
    },

    mounted(){

      window.addEventListener('keydown', this.onKeydown);
    },

    beforeDestroy(){

      window.removeEventListener('keydown', this.onKeydown);
    },

    methods: {

      /**
       * Show the desktop and record that this visitor has been through the
       * boot sequence — whether they watched it or skipped it. Choosing to
       * skip is as clear a signal as sitting through it.
       */
      reveal(){

        this.gui = true;
        rememberBoot();
      },

      onKeydown(event){

        if(this.gui){
          return;
        }

        if(event.key === 'Escape' || event.key === 'Enter'){

          this.reveal();
        }
      },

      waitingFirst(event){

        if(event){
          this.osStep++;
        }

      },

      waitingSecond(event){

        if(event){
          this.osStep++;
        }
      }
    }
  }
</script>

<style scoped>

    .flex-loading {
        height: 100vh;
        font-size: 1.25em;
        display: flex;
        flex-direction: column;
    }


</style>
