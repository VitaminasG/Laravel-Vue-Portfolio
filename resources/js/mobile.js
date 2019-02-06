import Vue from 'vue';
import mHome from './views/mHome'
import { TimelineMax } from "gsap/TweenMax";

Vue.directive('scroll', {
    inserted: function (el, binding) {
        let f = function (evt) {
            if (binding.value(evt, el)) {
                window.removeEventListener('scroll', f)
            }
        };
        window.addEventListener('scroll', f)
    }
});

new Vue({

    el: '#mobApp',
    template: '<mHome/>',
    components: { mHome},

    mounted(){

        let tl = new TimelineMax({
            repeat: -1,
            delay: 2
        });

        tl.to("#boxLine", 5, {top:"100vh", opacity: 0.1, ease: Power1.easeIn})
            .to("#boxLine", 5, {top:"200vh", opacity: 0, ease: Power1.easeOut})


    }

});