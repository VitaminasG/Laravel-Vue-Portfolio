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
            <stats></stats>
        </div>
    </div>

        <article class="_box flex-block">
            <div class="_box-header flex">
                <p>Access Denied</p>
            </div>
        </article>

    </div>
</template>

<script>

    import store from './../store/vueStore';
    const stats = () => import('../components/statistics');

    export default {
        name: "Dashboard",
        data(){
            return{
                username: store.getters.user,
                token: store.getters.token,
            }
        },
        components:{
          stats,
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

    ._box{
        padding: 0.5rem;
        border: 2px dashed #c63a42;
        color: #c63a42;
        text-shadow: 0 0 5px rgba(198, 58, 66, 0.6);
    }

    h2{
        font-size: 1.5rem;
        padding-top: 1rem;
    }
</style>