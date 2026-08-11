// Imported for its side effects: bootstrap.js registers Vue, axios, lodash and
// GSAP on window, and wires the CSRF header. It was a CommonJS require() under
// webpack; Vite produces an ES module, where require() does not exist.
import './bootstrap';

import vueStore from './store/vueStore';
import router from './routes';
import { TimelineMax} from "gsap/TweenMax";

new Vue({

  el: '#app',

  store : vueStore,
  router : router,

  mounted(){

    let tl = new TimelineMax({
      repeat: -1,
      delay: 1
    });

    tl.to("#boxLine", 3, {top:"50%", opacity: 0.1, ease: Power1.easeIn})
      .to("#boxLine", 3, {top:"100%", opacity: 0, ease: Power1.easeOut})

  }

});