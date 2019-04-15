<template>
    <div>

    <div id="_dash" v-if="authenticated && user">

        <!-- Login Links -->
        <div class="flex py-1 px-1">
            <p>Hello, {{ user.name }}</p>
            <router-link to="/logout">Logout</router-link>
        </div>

        <h2 class="text-center">Dashboard</h2>
        <div class="flex-block flex-center h-100">
            <!-- Text Editor 1 -->
            <div class="my-1 w-25">

                <div class="_card">

                    <header class="_card-header">
                        <p class="_card-header-title">First Text</p>
                    </header>

                    <div class="_card-content">
                        <div class="content">
                            <textarea class="_card-textarea" placeholder="e.g. Hello world" rows="10">

                            </textarea>
                        </div>
                    </div>

                    <footer class="_card-footer flex-center">
                        <button class="_card-button">Save</button>
                    </footer>

                </div>

            </div>
        </div>
    </div>

        <article v-else class="_box flex-block">
            <div class="_box-header flex">
                <p>Access Denied</p>
            </div>
        </article>

    </div>
</template>

<script>

    export default {
        name: "Dashboard",
        data(){
            return{
                authenticated: auth.check(),
                user: auth.user,
            }
        },
        components: {

        },
        mounted() {
            Event.$on('userLoggedIn', () =>{
                this.authenticated = true;
                this.user = auth.user;
            });
        }
    }
</script>

<style scoped>

    #_dash{
        height: 100vh;
    }

    ._card{
        padding: 0.5rem;
        border: 2px dashed #86c60b;
        color: #86c60b;
        text-shadow: 0 0 5px rgba(134, 198, 11, 0.6);
    }

    ._card-textarea{
        width: 100%;
        height: 100%;
        border: 2px dashed #86c60b;
        background: none;
    }

    ._card-button {
        border: 1px dashed #86c60b;
        padding: 0.2rem;
        background: none;
        color: #86c60b;
        width: 50%;
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