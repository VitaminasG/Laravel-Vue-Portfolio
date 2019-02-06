<template>

 <div class="mMain">

            <div class="container flex-block">

                <!-- PopUp message -->

                <div ref="pop" class="grow-one mPop text-center flex-center">

                    <div class="flex w-100">

                        <div class="flex-block">

                            <p>
                                Browser User-Agent header is used <span class="text-underline">ONLY</span> to get your Device type.
                            </p>

                            <p>
                                Let's save Our Planet by optimising JavaScript.
                            </p>


                        </div>

                        <div class="flex-center">

                            <a @click="close">

                                <img src="../../assets/mobileAssets/CloseIcon.png" alt="Close">

                            </a>

                        </div>

                    </div>

                </div>

                <!-- Avatar At top -->

                <div class="grow-one">

                    <div class="flex-center">

                        <img ref="avatar" class="mFaceGif" src="../../assets/mFace.gif" alt="What You looking at?">

                    </div>

                </div>

                <!-- Mid Information -->

                <div class="grow-one flex-block">

                    <p class="text-center">
                        This information is displayed because you are using a different
                        device with the not required resolution. Here you will get a minor
                        amount of animation and some personal details about the author.
                    </p>

                    <p class="text-center">
                        To be able to present a planned browsing experience,
                        please use a Desktop or Laptop computer.
                    </p>

                </div>

                <!-- Social Icons -->

                <div class="grow-two flex-center">

                    <div class="flex w-75">

                        <a href="https://github.com/VitaminasG" target="_blank">
                            <img src="../../assets/mobileAssets/mGithub.png" alt="Git">
                        </a>

                        <a href="https://www.linkedin.com/in/gediminas-palsys-240999113" target="_blank">
                            <img src="../../assets/mobileAssets/mIn.png" alt="LinkedIn">
                        </a>

                        <a href="https://www.instagram.com/gediminas_vitaminas/" target="_blank">
                            <img src="../../assets/mobileAssets/mInsta.png" alt="Instagram">
                        </a>

                        <a href="https://twitter.com/VitaminasG" target="_blank">
                            <img src="../../assets/mobileAssets/mTweet.png" alt="Tweeter">
                        </a>

                        <a href="https://www.facebook.com/vitaminas.g" target="_blank">
                            <img src="../../assets/mobileAssets/mFb.png" alt="Facebook">
                        </a>

                    </div>

                </div>

                <!-- Arrow Scroll Down -->

                <div class="grow-three flex-center">

                    <a class="mArrow flex-block" ref="arrow">

                        <div class="flex-center">

                            <svg xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 width="23px" height="23px">
                                <path fill-rule="evenodd"  fill="rgb(179, 198, 17)"
                                      d="M6.658,1.998 L6.658,11.439 L1.999,11.439 L11.000,20.002 L20.001,11.439 L15.342,11.439 L15.342,1.998 L6.658,1.998 Z"/>
                            </svg>

                        </div>

                        <p class="text-center">Scroll Down</p>

                    </a>

                </div>

            </div>

            <div class="container flex-block">

                <div v-scroll="aboutMe" class="flex-block mAbout">

                    <!-- Picture Of Me -->

                    <div class="grow-one flex-center">

                        <img class="h-75" src="../../assets/mobileAssets/mMe.jpg" alt="">

                    </div>

                    <!-- Information about Me -->

                    <div class="grow-two flex-center">

                        <div class="w-75">

                            <p class="text-justify">
                                I am a self-motivated person, who has a big passion for web technologies.
                                Since my childhood, I noticed that I have a big curiosity to understand how
                                computers working and what they can do for us. The cognitive path about
                                computers was related to remote technologies. Since that time, I am focused
                                on programming languages and IT systems which helps to communicate and
                                complete tasks from a distance. I had a period of my life spent with Linux
                                OS by administrating, as well as deploying internet network. In 2018, I graduated from Birbeck
                                University at the heart of London with web technology level 5 degree. I am currently
                                freelancing as Back-End and Front-End web developer. My field may vary from
                                demand but the main core technologies still are on the hilltop. My main back-end
                                scripting language is PHP and for the front-end currently, I am using Vue
                                JavaScript framework. I am able to design systems from scratch by finding
                                all functional and non-functional requirements for the client and providing
                                the best solution to minimise the cost. I speak and write in three languages
                                – English, Lithuanian and Russian.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

     <!-- footer Bottom -->

     <footer class="flex-center">

         <p>All Rights Reserved @ GediminasPalsys.com {{ new Date().getFullYear() }}</p>

     </footer>

 </div>
</template>

<script>

    import { TweenMax } from "gsap/TweenMax";

    export default {

        name: 'mHome',

        data(){

            return{

            }

        },

        mounted() {

                const { pop } = this.$refs;

                TweenMax.fromTo(pop, 1, {y:-50, opacity: 0},{y:0, opacity: 1, delay: 2} );

                const { arrow } = this.$refs;

                TweenMax.to(arrow, 2, {opacity: 1, y: 20, repeat: -1, delay: 1});

        },

        methods: {

            close(){

                const { pop } = this.$refs;

                TweenMax.to(pop, 0.5, {opacity: 0} )

            },

            aboutMe(evt, el) {

                if (window.scrollY > 500 ) {

                    TweenMax.to(el, 2.5, {opacity: 1, ease: Sine.easeOut});

                }
                return window.scrollY > 510
            }

        }

    }

</script>

<style scoped>

    .mMain{

        background-color: #0a0a0a;
    }

    .mPop{
        position: sticky;
        top: 0;
        border-bottom: 2px solid #bdd112;
        background-color: rgba(0, 0, 0, 0.51);
        max-height: 15vh;
        margin: -1rem -1rem 0 -1rem;
    }

    img.mFaceGif {

        /* Play with css filter to get better result */

        filter: drop-shadow(0px 0px 1px rgba(169, 220, 71, 0.4));
        height: 20vh;
    }

    .mArrow {
        opacity: 0;
    }

    .mAbout {
        opacity: 0;
    }

    footer {
        padding-bottom: 1em;
    }

</style>