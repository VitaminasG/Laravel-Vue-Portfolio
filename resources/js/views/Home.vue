<template>

    <div class="container is-fluid" v-cloak>

        <!--TODO: create link component-->
        <div class="__link">
            <router-link to="/login">
                <img src="../../assets/dashboard.svg">
            </router-link>
        </div>

        <div class="main section h-100">

                <div class="flex-block loading w-100" v-if="loading">

                    <div class="flex-block h-100" v-cloak>

                        <div v-if="step > 0" class="pb-2">

                            <div>

                                <div v-if="countStep >= 0 " v-for="(symbol, index) in newFirstTl.text1" class="inline">

                                        <transition-group appear @before-appear="beforeAppear" @appear="typing" @after-appear="doneTyping">

                                            <span :key="symbol" :data-index="index">{{ symbol }}</span>

                                        </transition-group>

                                </div>

                            </div>

                            <div>

                                <div v-if="countStep > 1" v-for="(symbol, index) in newFirstTl.text2" class="inline">

                                    <transition-group appear @before-appear="beforeAppear" @appear="typing" @after-appear="doneTyping">

                                        <span :key="symbol" :data-index="index">{{ symbol }}</span>

                                    </transition-group>

                                </div>

                            </div>

                            <div>

                                <div v-if="countStep > 2" v-for="(symbol, index) in newFirstTl.text3" class="inline">

                                    <transition-group appear @before-appear="beforeAppear" @appear="typing" @after-appear="doneTyping">

                                        <span :key="symbol" :data-index="index">{{ symbol }}</span>

                                    </transition-group>

                                </div>

                            </div>

                            <div>

                                <div v-if="countStep > 3" v-for="(symbol, index) in newFirstTl.text4" class="inline">

                                    <transition-group appear @before-appear="beforeAppear" @appear="typing" @after-appear="doneTyping">

                                        <span :key="symbol" :data-index="index">{{ symbol }}</span>

                                    </transition-group>

                                </div>

                            </div>

                        </div>

                        <!-- Typing Intro message end -->

                        <div v-if="step > 1">

                            <transition appear @appear="transition('msg')" :css="false">

                                <div ref="msg" class="flex-block">

                                    <div class="msg columns">

                                        <div class="column is-one-third avatar flex-center">

                                            <img src="../../assets/avatar.gif" alt="Avatar">

                                        </div>

                                        <div class="column flex-block">

                                            <p class="pb-1">
                                                You take your own responsibility by processing granted digital data.
                                                If you have any negative reactions from "Back to the Future" side-effects,
                                                unacceptable strong opinion statements, or not very trendy web design
                                                decision developed by an author - Gediminas Palsys, please stop reading now and
                                                don’t look into any website elements inside this introduction page.
                                                Start immediately removing all traces from your current browser and lock all
                                                your memories about me.
                                            </p>

                                            <p>
                                                Also, the materials could be changed over a time but the purpose of the site
                                                will stay based on the original idea to serve as personal informative network
                                                tool to communicate with users - stakeholders of the internet. All materials
                                                published on this website should serve for all different users, no matter of
                                                his/her/it race, financial or social situation, without any hidden intentions to harm.
                                                The author always got upper hand to control a data on a website and to express
                                                any ideas transmitted through the prism of his perception. Any useful web source-code
                                                and problem-solving decisions made and found by you during all visit at
                                                gediminaspalsys.uk, is allowed to keep for yourself and in some cases must
                                                be used on publicly accessed web environments if it will help to save a
                                                humanity. Also, the author has rights to keep all website assets and
                                                written materials as his own property.
                                            </p>
                                        </div>

                                    </div>

                                    <div class="pb-1">

                                        <p class="text-alert">
                                            *** Author will be very grateful if you will spread only positive energy and
                                            not in any situation bad about anything associated with this website.
                                        </p>

                                        <p>
                                            Terms & Conditions based on free man speech - <span class="text-alert">Martin Luther King, Jr</span>.
                                            You on the mountaintop!
                                        </p>

                                    </div>

                                </div>

                            </transition>


                        </div>

                        <!-- End Of Message Board -->

                        <div class="flex-block">

                            <div class="my-1">

                                <div v-if="step >= 3" v-for="(relax, index) in newSecondTl.text1" class="inline">

                                    <transition-group appear @before-appear="beforeAppear" @appear="typing" @after-appear="doneTyping">

                                        <span :key="relax" :data-index="index">{{ relax }}</span>

                                    </transition-group>

                                </div>

                            </div>

                            <div v-if="step === 4">

                                <transition appear @appear="transition('next')" :css="false">

                                    <div ref="next">

                                        <label>Press "Enter" to proceed </label>

                                        <input v-focus type="text" name="enter" @keyup.enter="loginPage">

                                    </div>

                                </transition>

                            </div>

                        </div>

                        <!-- End Of Intro -->

                    </div>

                </div>

                <div class="term-header">

                    <div v-if="!loading">
                        <div class="level">
                            <div class="level-left">
                                <div class="level-item">
                                    <div>
                                        <img src="../../assets/Conbined.png" alt="Fierce Monkey Intro">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="level">
                            <div class="level-left">
                                <div class="level-item">

                                    <div>
                                        <p>*** Hey-ho! Welcome to my neighbourhood -- Fierce Monkey OS ***</p>
                                        <p>*** Built using Laravel, VueJs, GSAP - GreenSock and other bunch of web technologies ***</p>
                                        <p>*** The default username and password is <span class="text-alert">‘visitor’</span> and <span class="text-alert">‘visiting’</span> ***</p>

                                        <p class="">***************************************************************************************************************</p>
                                        <p>*** You can find out more about Author by clicking on one of social network icons at the bottom of the page ***</p>
                                        <p>***************************************************************************************************************</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <!-- End Of Header -->

                <div v-if="!loading" class="term-controller" >

                    <Login @loginData="checkData($event)"></Login>

                </div>
                <!-- End Of Controller -->


                <div class="term-footer" v-if="step >= 0">

                            <transition-group appear @appear="afterFooter" tag="div" class="columns">

                            <div :key="items.div1" class="column text-center socialAnim">
                                <div>
                                    <a href="https://github.com/VitaminasG" target="_blank"><img src="../../assets/iconfinder_mark-github.png"></a>
                                </div>
                            </div>

                            <div :key="items.div2" class="column text-center socialAnim">
                                <div>
                                    <a href="https://www.linkedin.com/in/gediminas-palsys-240999113" target="_blank"><img src="../../assets/iconfinder_LinkedIn.png"></a>
                                </div>
                            </div>

                            <div :key="items.div3" class="column text-center socialAnim">
                                <div>
                                    <a href="https://www.instagram.com/gediminas_vitaminas/" target="_blank"><img src="../../assets/iconfinder_Intsagram.png"></a>
                                </div>
                            </div>

                            <div :key="items.div4" class="column text-center socialAnim">
                                <div>
                                    <a href="https://twitter.com/VitaminasG" target="_blank"><img src="../../assets/iconfinder_Twitter.png"></a>
                                </div>
                            </div>

                            <div :key="items.div5" class="column text-center socialAnim">
                                <div>
                                    <a href="https://www.facebook.com/vitaminas.g" target="_blank"><img src="../../assets/iconfinder_Facebook.png"></a>
                                </div>
                            </div>

                            </transition-group>

                </div>
                <!-- End Of Footer -->

            </div>

    </div>

</template>

<script>

    const Login = () => import('../components/login');

    import { TweenMax } from "gsap/all";
    import { materials } from '../textMaterial';

    export default {
        name: "Home",
        data(){
            return{
                loading: null,
                debug: false,

                // Animation Steps
                step: 1,
                countStep : 0,

                items: {
                    div1: 'div1', div2: 'div2', div3: 'div3', div4: 'div4', div5: 'div5'
                }
            }
        },

        directives: {

            focus: {

                inserted: function (el) {

                    el.focus()

                }
            }
        },

        watch: {

            countStep: function(){

                let to = this;

                switch( this.countStep ){

                    case 5:

                        this.step++;

                        setTimeout( to.delayAfter, 2000 );

                        break;

                    case 7:

                        setTimeout( to.delayAfter, 1000 );

                        break;

                    default:

                        if(this.debug) {

                            console.log('What to do now? We have Step: ' + this.countStep);

                        }
                }

            }

        },

        created(){

            this.loading = true;

        },

        components: {

            Login,

        },

        computed : {

            newFirstTl(){

                return materials.builder('one', 'first');

            },

            newSecondTl(){

                return materials.builder('one', 'second');

            }

        },

        methods: {

            // Footer Animation

            afterFooter(){

                TweenMax.staggerFromTo('.socialAnim', 1, { y:50, opacity: 0},{ y:0, opacity: 1, delay: 22}, 0.5 )

            },

            // Animation Block

            beforeAppear(el) {

                if(this.debug){

                    console.log('Before Enter');

                }

                el.style.opacity = 0;
            },

            typing(el, done){

                if(this.debug) {

                    console.log('Enter');

                }

                let delay = el.dataset.index * 75;

                setTimeout(function(){

                    TweenMax.to(el, 0.1, {opacity: 1, onComplete: done})

                }, delay)
            },

            doneTyping:

                _.throttle(function(){

                    if(this.debug) {

                        console.log('adding time again from Throttle');

                    }

                    this.countStep += 1;

                    if(this.debug) {

                        console.log('Now is step after Throttle: ' + this.countStep);

                    }

                },3500),

            transition(value){


                TweenMax.fromTo(this.$refs[value], 0.5, { opacity: 0}, { opacity: 1} );

            },

            // Animation Block end

            proceed(){

                this.loading = false

            },

            section(name){

              materials.create(name);

            },

            split(text, key, name){

                materials.strSplit(text, key, name);

            },

            checkData(value){

                    if(value){

                        this.$router.push('/OS');

                    }

            },

            delayAfter(){

                if(this.debug){

                    console.log('Here I am after TimeOut');

                }

                this.step++;

            },

            loginPage(){

                this.loading = false;
            }
        }
    }
</script>

<style scoped>

    .__link{
        position: absolute;
        top: 0.5rem;
        right: 0;
    }

    .__link a:hover {

        filter: drop-shadow(0px 0px 2px rgba(151, 197, 29, 0.31)) invert(10%);

    }

    .main {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .loading p {
        font-size: 1.25em;
    }

    .msg {
        border-top: 1px solid #86C60B;
        border-bottom: 1px solid #86C60B;
        text-align: justify;
    }

    .avatar > img {
        height: 300px;
        width: 250px;
    }

    .term-header img {
        width: 50%;
        margin: auto 0;
        padding-left: 3.5em;
    }

    .term-header{
        font-size: 1.25em;
        margin-top: 2em;
        max-width: 50%;
    }

    .term-controller{
        height: 200px;
    }

    .term-content{
        height: 350px;
    }

    .term-footer{
        width: 25%;
        margin: auto auto 0 auto;
        padding-bottom: 1em;
    }

    .socialAnim a:hover {

        filter: drop-shadow(0px 0px 5px #97c51d) invert(10%);

    }

    .inline {
        display: inline;
        font-size: 1.25em;
    }

</style>