<template>

        <div class="desktop h-100">

            <div class="d-content h-50">

                <div class="d-file flex-center">
                    <a class="my-1" @click="toggleText(true, 'text1')" v-on:mouseover="mouseOver()">
                        <img src="../../assets/DocumentIcon.png" alt="ReadMe">
                        <p class="text-center">ReadMe.txt</p>
                    </a>
                </div>

                <div class="d-file flex-center">
                    <a class="my-1" @click="toggleText(true, 'text2')" v-on:mouseover="mouseOver()">
                        <img src="../../assets/DocumentIcon.png" alt="AboutMe">
                        <p class="text-center">AboutMe.txt</p>
                    </a>
                </div>

                <div class="d-file flex-center">
                    <a class="my-1" @click="toggleMail(true)" v-on:mouseover="mouseOver()">
                        <img src="../../assets/MailIcon.png" alt="MailMe">
                        <p class="text-center">Inbox</p>
                    </a>
                </div>

            </div>

            <div class="d-footer">

                <div class="task-right text-center">

                    <p class="date">
                        {{ clock }}
                    </p>

                    <p class="date">
                        {{ date }}
                    </p>

                </div>

            </div>

            <keep-alive v-if="show">

                <component :is="targetComp">

                        <template slot="header">

                            <span v-show="modalType === 'text'">

                                {{ textFiles[pointing].header}}

                            </span>

                            <span v-show="modalType === 'mail'">
                                Mail Tool
                            </span>

                        </template>

                        <template slot="content">

                            <span v-show="modalType === 'text'" v-for="text in textFiles[pointing].content">

                                <p class="pb-1 text-justify">{{ text }}</p>

                            </span>

                            <span v-show="modalType === 'mail'">

                                <div class="flex-center">

                                    <p>{{ 'I am Mail Content' }}</p>

                                </div>

                            </span>

                        </template>

                </component>

            </keep-alive>

        </div>

</template>

<script>

    import { store } from "../state-man";

    const file = () => import('../components/textFile');

    const mail = () => import('../components/mailMe');

    export default {

        name: "desktop",

        data(){
            return {

                debug: true,

                clock: '',
                date: '',

                show: '',
                pointing: 'text1',
                modalType: '',
                textFiles: {

                    text1: {

                        header: 'ReadMe.txt',

                        content: {

                            c1: 'Hey, You made it at last! As you noticed this personal project tried to convey\n' +
                                'and give a feeling, as being a person who used one of many computer\n' +
                                'systems existed almost three decades ago. If someone was a curious kid during that period,\n' +
                                'they should know where I\'m heading. I didn\'t want to bring back everything in this project like\n' +
                                'it was age\'s ago and replicate everything in very small details like Windows\n' +
                                '98 used to be and to have a same ugly low-resolution Graphical User Interface\n' +
                                '(GUI). Either, I am not a romantic person, who still remembers the good old days\n' +
                                'spent with friends next to a computer screen protected with a greenish cover\n' +
                                'from low refresh rate and playing DUNE from a floppy disk. Ufff, that was very\n' +
                                'impressive. However, I still don\'t get it till now, how they managed to fit all\n' +
                                'polyphonic soundtracks, graphical assets and code inside one 2MB size floppy\n' +
                                'disk. I am still thinking it was made with Magic!',

                            c2: 'I will drop a small bit of history to the visitors who maybe had not a chance to live ~25 years\n' +
                                'ago or maybe, to have at home or even, to have a friend who owned that very expensive piece of\n' +
                                'technology which gave us possibility by few seconds to send an email to the other\n' +
                                'side of the world... Even a user by using this hi-tech had to be patient because it\n' +
                                'took longer to load all required internet or system assets. I named this project - Fierce Monkey\n' +
                                'OS. It is a fictional name made by me regarding to my logo. I am Code Monkey!',

                            c3: 'P.S. - All code for this website you can find by clicking\n' +
                                'on desktop github icon or send me an email by using Mail icon.'

                        }

                    },

                    text2: {

                        header: 'AboutMe.txt',

                        content: {

                            c1: 'I am a self-motivated person, who has a big passion for web technologies.\n' +
                                'Since my childhood, I noticed that I have a big curiosity to understand\n' +
                                'how computers working and what they can do for us. The cognitive path about\n' +
                                'computers was related to remote technologies. Since that time, I am focused \n' +
                                'on programming languages and IT systems which helps to communicate and\n' +
                                'complete tasks from a distance. I had a period of my life spent with Linux\n' +
                                'OS by administrating, as well as deploying internet network. My life goal\n' +
                                'was to travel to the United Kingdom and get a Higher education in the Computer\n' +
                                'Science field. In my believe this country had achieved many goals in this\n' +
                                'field and study programs are much more accurately constructed to prepare an\n' +
                                'information technology specialist. However, the industry evolving rapidly and\n' +
                                'to be at the same pace with all trends is very difficult. In 2018, I graduated\n' +
                                'from Birbeck University at the heart of London with web technology level 5\n' +
                                'degree. I am currently freelancing as Back-End and Front-End web developer.\n' +
                                'My field may vary from demand but the main core technologies still are on the\n' +
                                'hilltop. My main back-end scripting language is PHP and for the front-end\n' +
                                'currently, I am using Vue JavaScript framework. I am able to design systems\n' +
                                'from scratch by finding all functional and non-functional requirements for\n' +
                                'the client and providing the best solution to minimise the cost. I speak and\n' +
                                'write in three languages – English, Lithuanian and Russian.'

                        }}

                },

            }

        },

        components: {

            targetComp: ''

        },

        computed: {

        },

        mounted(){

            this.time(setInterval(this.time.bind(this), 1000));

        },

        watch: {

            show: function(){

                return store.dispatchState();

            }

        },

        methods: {

            time(){

                let cd =  new Date;

                this.date = ('0' + cd.getDate()).slice(-2) + '/'
                    + ( '0' + cd.getMonth()+1).slice(-2) + '/' + cd.getFullYear();

                this.clock = ('0' + cd.getHours()).slice(-2) + ' : ' + ('0' + cd.getMinutes()).slice(-2)
                    + ' : ' + ('0' + cd.getSeconds()).slice(-2);
            },

            toggleText(event, target){

                this.modalType = 'text';

                if (this.debug){
                    console.log('Pointing to: ', target);
                    console.log('Modal Type: ', this.modalType);
                }

                // Clear and Add State of Modal

                store.clearState();
                store.changeState(event);
                this.show = store.dispatchState();

                this.pointing = target;

                // Add TextFile Component
                this.targetComp = file;

            },

            toggleMail(event){

                this.modalType = 'mail';

                if (this.debug){
                    console.log('Modal Type: ', this.modalType);
                }

                // Clear and Add State of Modal

                store.clearState();
                store.changeState(event);
                this.show = store.dispatchState();

                // Add mail Component
                this.targetComp = mail;

            },

            mouseOver(){

                // Restore state on hover the icon

                store.dispatchState();
                this.show = store.dispatchState();

            }

        }

    }
</script>

<style scoped>

    .desktop {
        background-image: url('../../assets/wallpaper.jpg');
        background-size: cover;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .d-content {
        padding: 2rem 2rem 0 2rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .d-file {
        width: 150px;
    }

    .d-content > a {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .d-content a img {
        padding: 0.5rem;
    }

    .d-content a  p {
        color: #e4e4e4;
    }

    a:hover {
        outline: 3px dotted #0a0a0a;
        outline-offset: 0.75rem;
        cursor: default;
    }

    .d-footer {
        margin-top: auto;
        display: flex;
        flex-direction: row-reverse;
        background-color: #333333;
    }

    .task-right {
        border-left: 4px solid rgba(165, 165, 165, 0.25);
        padding: 0 0.75em;
    }

    .date {
        color: #d6d6d6;
        font-size: 1.25em;
    }

</style>