<template>

  <!-- Web Statistics -->
  <div class="my-1 w-50 h-50">

    <div class="dashed-box h-100">

      <header class="_card-header">
        <p class="_card-header-title">Web Statistics</p>
      </header>

      <div class="_card-content flex-block h-100">

        <table class="table w-100">
          <thead>
            <tr>
              <th>IP</th>
              <th>Agent</th>
              <th>Date</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <th>IP</th>
              <th>Agent</th>
              <th>Date</th>
            </tr>
          </tfoot>
          <tbody>
            <tr v-for="stat in stats" :key="stat.date + stat.ip">
              <td>{{ stat.ip }}</td>
              <td>{{ stat.agent }}</td>
              <td>{{ stat.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
    
</template>

<script>
  import store from '../store/vueStore';

  export default {
    name: "Statistics",
    data(){
      return{

      }
    },
    computed:{
      stats: function(){
        return store.getters.data;
      }
    },
    mounted(){
      store.dispatch('setTarget', {
        list: store.getters.list,
        method: 'get',
        route: 'stats'}).then(() => {
          store.dispatch('stats', store.getters.target);
        });
    }
  }
</script>

<style scoped>
    .table {
        background-color: transparent;
        color: inherit;
    }

    .table td, .table th{
        border: none;
    }

    .table thead td, .table thead th{
        color: #d4e62a;
    }

    .table tfoot td, .table tfoot th{
        color: #d4e62a;
    }
</style>