<template>

    <div class="container is-fluid h-100 eMain">

        <div class="flex-center h-100">

            <div>

                <div class="fontSize-3">

                    <p class="text-center">

                        404

                    </p>

                </div>

                <p class="fontSize-2 py-2">

                    {{ message }}

                </p>

                <div class="fontSize-2 flex-center text-underline pt-2">

                    <a href="/">

                        Go Home

                    </a>

                </div>

            </div>


        </div>

    </div>

</template>

<script>

    export default {

        name: "Error",

        data() {
            return{

                message: 'You have error - Page not found'

            }
        }

    }

</script>

<style scoped>

    .eMain{

        height: 100vh;

    }

</style>