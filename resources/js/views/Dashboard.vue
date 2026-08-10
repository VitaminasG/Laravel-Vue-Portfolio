<template>
  <div>

    <div id="_dash">

      <!-- Login Links -->
      <div class="flex py-1 px-1">
        <p>Hello, {{ username }}</p>
        <a href="/" @click.prevent="logout">Logout</a>
      </div>

      <h2 class="text-center">Dashboard</h2>
      <div class="flex-block flex-center h-100">
        <stats />
      </div>
    </div>

  </div>
</template>

<script>

  import store from './../store/vueStore';
  const stats = () => import('../components/statistics');

  export default {
    name: "Dashboard",
    components:{
      stats,
    },
    computed: {
      // Read through the getter rather than copying it into data(): the name
      // is written to the store after login, and a data() copy would freeze
      // whatever the value happened to be when this component was created.
      username() {
        return store.getters.user;
      },
    },
    methods:{
      logout(){
        store.dispatch('logout');
        this.$router.push('/');
      }
    }
  }
</script>

<style scoped>

    #_dash{
        height: 100vh;
    }

    h2{
        font-size: 1.5rem;
        padding-top: 1rem;
    }
</style>