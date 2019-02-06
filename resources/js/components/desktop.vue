<template>

        <div class="desktop h-100">

            <div class="d-content h-50">

                <div class="d-file flex-center">
                    <a class="mx-1" @click="toggle(true)" v-on:mouseover="mouseOver">
                        <img src="../../assets/DocumentIcon.png" alt="ReadMe">
                        <p class="text-center">ReadMe.txt</p>
                    </a>
                </div>

                <div class="d-file flex-center">
                    <a class="mx-1">
                        <img src="../../assets/MailIcon.png" alt="Mail">
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

                <text-file>

                    <template slot="header">
                        Read Me.txt
                    </template>

                    <template slot="content">

                        <p class="px-1">
                            Hey! As you noticed this personal project tried to convey and give a feeling,
                            as being a person who used one of many computer systems existed almost three
                            decades ago. If someone was a curious kid during that period, they should know
                            where I'm heading. I didn't want to bring back everything in this project like
                            it was age's ago and replicate everything in very small details like Windows
                            98 used to be and to have a same ugly low-resolution Graphical User Interface
                            (GUI). Either, I am not a romantic person, who still remembers the good old days
                            spent surrounded by friends and chilling after a football match which we had in
                            common courtyard and cooling down by having a cold glass of water... Next to a
                            computer screen protected with a greenish cover from low refresh rate and playing
                            DUNE from a floppy disk. Ufff, that was very impressive. However, I still don't
                            get it till now, how they managed to fit all polyphonic soundtrack, graphical
                            assets and code inside one 2MB size floppy disk. I am still thinking it was made
                            with Magic!
                        </p>

                        <p class="px-1">
                            I just want to highlight what kind big leap WE have done in the
                            telecommunication industry. Technologies progressing very fast
                            and to be on top of it is impossible. For me web development like
                            endless sea which you want and trying to drink without choking.
                        </p>

                        <p class="px-1">
                            I will drop a small bit of history to the visitors who maybe hadn’t a chance to live ~25 years
                            ago or maybe, to have at home or even, to have a friend who owned that very expensive piece of
                            technology which gave us possibility by few seconds to send an email to the other
                            side of the world... Even a user by using this hi-tech had to be patient because it
                            took longer to load all required internet or system assets. I named this project - Fierce Monkey
                            OS. It is a fictional name made by me regarding to my logo. I am Code Monkey! Copy and Past :D
                        </p>

                        <p class="px-1">
                            P.S. - All code of this website you can find by clicking on desktop github icon.
                        </p>

                    </template>

                </text-file>

            </keep-alive>

        </div>

</template>

<script>

    import { store } from "../state-man";

    import textFile from "../components/textFile"

    export default {

        name: "desktop",

        data(){
            return {

                clock: '',
                date: '',

                filename: '',
                show : ''

            }

        },

        components : {

            textFile

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

            toggle(event){

                store.clearState();
                store.changeState(event);
                this.show = store.dispatchState()

            },

            mouseOver(){

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