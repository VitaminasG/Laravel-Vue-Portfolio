<template>

    <!-- Web Statistics -->
    <div class="my-1 w-50 h-50">

        <div class="_card h-100">

            <header class="_card-header">
                <p class="_card-header-title">Web Statistics</p>
            </header>

            <div class="_card-content flex-block h-100">

                    <div v-for="stat in stats">

                        <div class="flex text-underline">
                            <p>IP: {{ stat.ip }}</p>
                            <p>Agent: {{ stat.agent }}</p>
                            <p>Date: {{ stat.date }}</p>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    
</template>

<script>
    import axios from 'axios';
    import store from '../store/vueStore';

    export default {
        name: "statistics",
        data(){
            return{

            }
        },
        mounted(){
            store.dispatch('setTarget', {
                list: store.getters.list,
                method: 'get',
                route: 'stats'}).then(() => {
                    store.dispatch('stats', store.getters.target);
            });
        },
        computed:{
            stats: function(){
                return store.getters.data;
            }
        }
    }
</script>

<style scoped>
    ._card{
        padding: 0.5rem;
        border: 2px dashed #86c60b;
        color: #86c60b;
        text-shadow: 0 0 5px rgba(134, 198, 11, 0.6);
    }
</style>