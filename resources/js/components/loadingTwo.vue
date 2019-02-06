<template>

    <div class="h-100 flex-center">

        <div class="text-center">
            <img class="obj" src="../../assets/mFace.gif" alt="Small">
            <p class="title obj">FierceMonkey_OS</p>
            <img class="barL" src="../../assets/loadingBarOrg5.gif" alt="loading">
        </div>

    </div>

</template>

<script>

    import { TweenMax} from "gsap/all";

    export default {

        name: "loadingTwo",

        data(){
            return{

                subStep: 0

            }
        },

        mounted() {

            TweenMax.staggerFromTo('.obj', 3, {autoAlpha:0, y: -150}, {autoAlpha: 1, y: 0 }, 1.5 );
            TweenMax.staggerFromTo('.barL', 1, {opacity: 0, y: 50}, {opacity: 1, y: 0, delay: 3 });

            let to = this;

            setTimeout( to.increaseVal , 6500);

        },

        watch: {

            subStep(){

                if(this.subStep === 1){

                    this.$emit('secondDone', true);

                }

            }

        },

        methods: {

            increaseVal(){

                this.subStep++;

            }

        }

    }
</script>

<style scoped>

</style>