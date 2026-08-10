<template>

  <div>

    <div class="container is-fluid">

      <div v-if="!gui" class="flex-loading">

        <loading-one v-if="osStep === 1" @firstDone="waitingFirst($event)" />
        <loading-two v-if="osStep === 2" @secondDone="waitingSecond($event)" />

      </div>

    </div>

    <desktop v-if="gui" v-cloak />

  </div>

</template>

<script>

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
          this.gui = true;
        }
      }
    },

    methods: {

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