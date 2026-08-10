<template>

  <div>

    <div class="modal" :class="{ 'is-active' : isActive}">

      <div class="modal-background" />

      <div class="modal-card">

        <header class="modal-card-head">

          <p class="modal-card-title">
            <slot name="header" /> - textPad
          </p>

          <button class="delete" @click="closeMod" />

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

    methods: {

      closeMod(){

        store.clearState();
        store.changeState(false);
        this.isActive = store.dispatchState();

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