<template>

  <div>

    <div class="modal" :class="{ 'is-active' : isActive}" role="dialog" aria-modal="true">

      <div class="modal-background" />

      <div class="modal-card">

        <header class="modal-card-head">

          <h2 class="modal-card-title">
            <slot name="header" /> - textPad
          </h2>

          <button class="delete" type="button" aria-label="Close window" @click="closeMod" />

        </header>

        <section class="modal-card-body">

          <slot class="py-1" name="content" />

        </section>

        <footer class="modal-card-foot">

          <slot name="footer" />

        </footer>

      </div>

    </div>

  </div>

</template>

<script>

  import { store } from "../state-man";

  export default {

    name: "TextFile",

    data(){

      return {

        isActive : ''

      }
    },

    watch: {

      isActive: function(){

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

    .modal-card {
        width: 90%;
    }

    .modal-card-title {
        color: #0a0a0a;
    }

    .modal-card-body {
        font-size: 1.5em
    }

</style>