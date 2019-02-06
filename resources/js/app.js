import './bootstrap';
import router from './routes';

import { TimelineMax} from "gsap/TweenMax";

new Vue({

    el: '#app',

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