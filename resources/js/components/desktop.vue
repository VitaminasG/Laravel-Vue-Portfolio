<template>

  <div class="desktop h-100">

    <!--
      The retro illusion depends on the desktop looking like a bare screen, so
      the one heading that names whose portfolio this is stays out of sight and
      in the accessibility tree, where a screen reader still finds it.
    -->
    <h1 class="visually-hidden">Gediminas Palsys — web developer portfolio</h1>

    <main class="d-content">

      <div class="d-file flex-center">
        <button type="button" class="d-icon my-1 flex-block" @click="toggleText(true, 'text1', $event)" @mouseover="mouseOver()">
          <img src="../../assets/DocumentIcon.png" alt="">
          <p class="text-center">ReadMe.txt</p>
        </button>
      </div>

      <div class="d-file flex-center">
        <button type="button" class="d-icon my-1 flex-block" @click="toggleText(true, 'text2', $event)" @mouseover="mouseOver()">
          <img src="../../assets/DocumentIcon.png" alt="">
          <p class="text-center">AboutMe.txt</p>
        </button>
      </div>

      <div class="d-file flex-center">
        <button type="button" class="d-icon my-1 flex-block" @click="toggleMail(true, $event)" @mouseover="mouseOver()">
          <img src="../../assets/MailIcon.png" alt="">
          <p class="text-center">ContactMe.exe</p>
        </button>
      </div>

      <div class="d-file flex-center">
        <a href="https://github.com/VitaminasG/Laravel-Vue-Portfolio" target="_blank" class="d-icon my-1 flex-block">
          <img src="../../assets/dGitHub.png" alt="">
          <p class="text-center">Github.link</p>
        </a>
      </div>

    </main>

    <footer class="d-footer flex">

      <div class="task-left text-center w-50">

        <a class="task-item task-item-a" href="/">Log off</a>

      </div>

      <div class="task-right text-center w-50">

        <div class="text-center task-item task-item-b">

          <p class="date">
            {{ clock }}
          </p>

          <p class="date">
            {{ date }}
          </p>

        </div>

      </div>

    </footer>

    <keep-alive v-if="show">

      <component :is="targetComp" @closed="restoreFocus">

        <template slot="header">

          <span v-show="modalType === 'text'">

            {{ textFiles[pointing].header }}

          </span>

          <span v-show="modalType === 'mail'">
            Mail Tool
          </span>

        </template>

        <template slot="content">

          <span v-for="(text, textKey) in textFiles[pointing].content" v-show="modalType === 'text'" :key="textKey">

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

    name: "Desktop",

    components: {

      targetComp: ''

    },

    data(){
      return {

        clock: '',
        date: '',

        // The icon that opened the current window; focus returns here on close.
        opener: null,

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

            }
          }

        },

      }

    },

    computed: {

    },

    watch: {

      show: function(){

        return store.dispatchState();

      }

    },

    mounted(){

      this.time(setInterval(this.time.bind(this), 1000));

    },

    methods: {

      time(){

        let cd =  new Date;

        let month = [];
        month[0] = "Jan";
        month[1] = "Feb";
        month[2] = "Mar";
        month[3] = "Apr";
        month[4] = "May";
        month[5] = "Jun";
        month[6] = "Jul";
        month[7] = "Aug";
        month[8] = "Sep";
        month[9] = "Oct";
        month[10] = "Nov";
        month[11] = "Dec";

        this.date = ('0' + cd.getDate()).slice(-2) + '/'
          + month[cd.getMonth()] + '/' + cd.getFullYear();

        this.clock = ('0' + cd.getHours()).slice(-2) + ':' + ('0' + cd.getMinutes()).slice(-2)
          + ':' + ('0' + cd.getSeconds()).slice(-2);
      },

      toggleText(event, target, domEvent){

        this.modalType = 'text';

        // Clear and Add State of Modal

        store.clearState();
        store.changeState(event);
        this.show = store.dispatchState();

        this.pointing = target;

        // Add TextFile Component
        this.targetComp = file;

        this.rememberOpener(domEvent);

      },

      toggleMail(event, domEvent){

        this.modalType = 'mail';

        // Clear and Add State of Modal

        store.clearState();
        store.changeState(event);
        this.show = store.dispatchState();

        // Add mail Component
        this.targetComp = mail;

        this.rememberOpener(domEvent);

      },

      /**
       * Note which icon opened the window, so closing it can put focus back
       * where it was. Without this a keyboard visitor is returned to the top
       * of the document and has to tab through the desktop again.
       */
      rememberOpener(domEvent){

        this.opener = domEvent ? domEvent.currentTarget : null;

      },

      restoreFocus(){

        if(this.opener){

          this.opener.focus();
          this.opener = null;
        }

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
        background-image: url('../../assets/wallpaper.png');
        background-size: cover;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        /*
            Exactly the viewport, not at least it. The taskbar is the last row
            of a flex column, so a desktop allowed to grow past the screen
            takes the taskbar with it — and since html/body set
            overflow: hidden, nothing could scroll it back into view.
        */
        height: 100vh;
        /*
            A dark shadow, not a light one: the wallpaper runs from bright sky
            at the top to dark grass at the bottom, and the near-white icon
            labels would otherwise disappear against the clouds. This is what
            the desktop it borrows from did for the same reason.
        */
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
    }

    .d-content {
        padding: 2rem 2rem 0 2rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        /*
            Take the space the taskbar does not, and be allowed to shrink:
            min-height on a flex item defaults to auto, which would refuse to
            go below the icons' own height and push the taskbar off screen.
        */
        flex: 1 1 auto;
        min-height: 0;
        /*
            Four icons stacked in one column need 667px of height, more than a
            1366x768 laptop has once browser chrome is subtracted. Wrapping
            starts a second column instead — which is what the desktop this
            borrows from did when it ran out of room, so the fix costs nothing
            to the period feel.
        */
        flex-wrap: wrap;
        align-content: flex-start;
        /* Last resort, for a viewport too short even for wrapped columns. */
        overflow: auto;
    }

    .d-file {
        width: 150px;
    }

    /*
        Three of these are <button> and one is <a>, so everything below selects
        the shared class rather than the element. The buttons also need their
        native chrome removed to look like the anchors they replaced — they are
        buttons for what they do, not for how they look.
    */
    .d-icon {
        padding: 1rem;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        text-align: center;
        text-shadow: inherit;
        width: 100%;
    }

    .d-icon img {
        margin: 0 auto;
        width: 65%;
        padding: 0.5rem;
    }

    .d-icon p {
        color: #e4e4e4;
    }

    /*
        The hover treatment doubles as the focus ring. A dotted outline offset
        from the icon is exactly how the original marked a selected item, so
        keyboard visibility and the retro look are the same thing here.
    */
    .d-icon:hover,
    .d-icon:focus-visible {
        outline: 3px dotted #0a0a0a;
        outline-offset: 0.75rem;
        cursor: default;
    }

    .d-footer {
        /* Never the row that gets squeezed off the bottom of the screen. */
        flex: 0 0 auto;
        background-color: #333333;
    }

    .task-item:focus-visible {
        outline: 2px dotted #e4e4e4;
        outline-offset: 2px;
    }

    .task-left{
        height: 100%;
        display: flex;
    }

    .task-right {
        display: flex;
        flex-direction: row-reverse;
    }

    .task-item-a{
        padding: 0.25em 0.75em;
        border-right: 4px solid rgba(165, 165, 165, 0.25);
    }

    .task-item-b{
        padding: 0 0.75em;
        border-left: 4px solid rgba(165, 165, 165, 0.25);
    }

    .date {
        color: #d6d6d6;
        font-size: 1.25em;
    }

</style>