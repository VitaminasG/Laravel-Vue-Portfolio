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

      <div class="column">

        <div v-for="(decod, key) in scrambText.scrambTxt" v-if="subStep >= 5" class="inline">

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
  import { TweenMax, TimelineMax, TextPlugin } from "gsap/all";

  const plugins = [TextPlugin];

  export default {

    name: "LoadingOne",

    data(){

      return {

        debug: false,
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

        TweenMax.fromTo('.tbar', 1.5, {opacity: 0}, {opacity: 1, delay: 1}, 1 )
      },

      imHereMid(el, done){

        let tl = new TimelineMax({
          onComplete: done
        });

        tl.staggerFromTo('.mbarSub', 1, {opacity: 0},{opacity: 1, delay: 3}, 1)
          .fromTo('.mbarSub1', 0.5, {opacity: 0}, {opacity: 1 })
          .to(this.$data, 1, { n: 131072}, '+=0.5')
          .fromTo('.mbarSub2', 0.5, {opacity: 0}, {opacity: 1}, '+=0.5')
          .fromTo('.mbarSub3', 0.5, {opacity: 0}, {opacity: 1}, '+=0.5')
          .fromTo('.mbarSub4', 0.5, {opacity: 0}, {opacity: 1}, '+=0.5');

      },

      beforeTyping(el, done){

        TweenMax.set(el, {autoAlpha: 0, onComplete: done});
      },

      typing(key, el, done){

        let letter = this.scrambText.text1[key];
        let tl2 = new TimelineMax({
          onComplete: done
        });

        tl2.staggerTo('.scramb', 0.2, {autoAlpha: 1, delay: 3}, 0.1)
          .staggerTo('.scramb', 0.2, {autoAlpha: 0}, '+=0.2')
          .to('.letter-' + key, 0.5, {text: letter, autoAlpha: 1}, '+=0.1');
      },

      doneTyping:

        _.throttle(function(){this.step();},8000)
      ,

      step(){

        this.subStep++;

        if(this.debug){
          console.log('Now we in Sub Step: ' + this.subStep);
        }
      }
    }
  }
</script>

<style scoped>

    .inline {
        display: inline;
    }

</style>