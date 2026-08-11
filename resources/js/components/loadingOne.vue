<template>
  <div class="container is-fluid h-100 section">

    <transition-group appear tag="div" class="columns py-3 h-50" :css="false" @appear="imHereTop" @after-appear="step">

      <div :key="i.t1" class="column is-four-fifths tbar">

        <p>Fierce Monkey BIOS v0.1 Realease 1.0</p>
        <p>Copyright {{ new Date().getFullYear() }} Gediminas Palsys Technologies Ltd.</p>
        <p>All Rights Reserved</p>

      </div>

      <div :key="i.t2" class="column tbar">

        <img src="../../assets/SmallLogo.png" alt="smallLogo">

      </div>

    </transition-group>

    <div v-if="subStep >= 3" class="columns flex-block h-50">

      <div class="column">
        <div>

          <transition-group appear tag="div" :css="false" @appear="imHereMid" @after-appear="step">

            <p :key="i.t3">
              <span class="mbarSub">Main Processor : </span>
              <span class="mbarSub">Intel Pentium II Processor 300 MHz, 512K Cache, 66 MHz FSB</span>
            </p>

            <p :key="i.t4">

              <span class="mbarSub">Memory Testing : </span>
              <span class="mbarSub1">{{ ChangedN }}</span> <span class="mbarSub2"> OK </span>
              <span class="mbarSub3">+</span><span class="mbarSub4"> 1024 Shared Memory</span>


            </p>

          </transition-group>

        </div>
      </div>

      <div v-if="subStep >= 5" class="column">

        <div v-for="(decod, key) in scrambText.scrambTxt" :key="key" class="inline">

          <transition-group appear @before-appear="beforeTyping" @appear="typing(key)" @after-appear="doneTyping">

            <span :key="key" :data-index="key" class="scramb" :class="'letter-'+key">{{ decod }}</span>

          </transition-group>

        </div>

      </div>

    </div>

  </div>
</template>

<script>

  import { materials } from '../textMaterial';
  import { TIMING } from '../helpers/bootSequence';
  import { TweenMax, TimelineMax, TextPlugin } from "gsap/all";

  // Referencing the plugin keeps the bundler from tree-shaking it away; the
  // timeline below animates {text: ...}, which only works with TextPlugin
  // registered.
  // eslint-disable-next-line no-unused-vars
  const plugins = [TextPlugin];

  export default {

    name: "LoadingOne",

    data(){

      return {

        i: {
          t1: 't1', t2: 't2', t3: 't3', t4: 't4'
        },
        n: 0,
        subStep: 1
      }

    },

    computed: {

      ChangedN(){
        return this.n.toFixed(0);
      },

      scrambText(){
        return materials.ScramObj('Two', 'third', 'text1');
      }

    },

    watch: {

      subStep(){

        if(this.subStep === 7){
          this.$emit('firstDone', true);
        }
      }
    },

    methods: {

      imHereTop(){

        // No delay: this is the first paint of the whole site, and a header
        // that waits is indistinguishable from a page that failed to load.
        TweenMax.fromTo('.tbar', TIMING.bios.fadeIn, {opacity: 0}, {opacity: 1}, TIMING.bios.stagger )
      },

      imHereMid(el, done){

        let tl = new TimelineMax({
          onComplete: done
        });

        tl.staggerFromTo('.mbarSub', TIMING.memory.fadeIn, {opacity: 0},{opacity: 1}, TIMING.memory.stagger)
          .fromTo('.mbarSub1', TIMING.memory.fadeIn, {opacity: 0}, {opacity: 1 })
          .to(this.$data, TIMING.memory.counter, { n: TIMING.memory.target}, TIMING.memory.gap)
          .fromTo('.mbarSub2', TIMING.memory.fadeIn, {opacity: 0}, {opacity: 1}, TIMING.memory.gap)
          .fromTo('.mbarSub3', TIMING.memory.fadeIn, {opacity: 0}, {opacity: 1}, TIMING.memory.gap)
          .fromTo('.mbarSub4', TIMING.memory.fadeIn, {opacity: 0}, {opacity: 1}, TIMING.memory.gap);

      },

      beforeTyping(el, done){

        TweenMax.set(el, {autoAlpha: 0, onComplete: done});
      },

      typing(key, el, done){

        let letter = this.scrambText.text1[key];
        let tl2 = new TimelineMax({
          onComplete: done
        });

        tl2.staggerTo('.scramb', TIMING.scramble.reveal, {autoAlpha: 1}, TIMING.scramble.stagger)
          .staggerTo('.scramb', TIMING.scramble.reveal, {autoAlpha: 0}, '+=0.1')
          .to('.letter-' + key, TIMING.scramble.settle, {text: letter, autoAlpha: 1}, '+=0.1');
      },

      // One after-appear fires per letter; the throttle collapses them into a
      // single step, and its window doubles as how long the finished BIOS
      // screen is held.
      doneTyping:

        _.throttle(function(){this.step();}, TIMING.biosHoldMs)
      ,

      step(){

        this.subStep++;

      }
    }
  }
</script>

<style scoped>

    .inline {
        display: inline;
    }

</style>