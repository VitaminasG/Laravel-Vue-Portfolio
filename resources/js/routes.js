import VueRouter from 'vue-router';
import vueStore from './store/vueStore'

function loadView(view) {
    return () => import('./views/' + view);
}

const boxingDay = vueStore;

let router = new VueRouter({

    mode: 'history',
    routes: [

        {
            path: '*',
            name: 'Error',
            component: loadView('Error')
        },

        {
            path: '/',
            name: 'Home',
            component: loadView('Home'),
            meta: { freshLogin: true },
        },

        {
            path:'/Login',
            name: 'apiLogin',
            component: loadView('ApiLogin'),
            meta: { freshLogin: true }
        },

        {
            path: '/OS',
            name: 'OS',
            component: loadView('OS')
        },

        {
            path:'/Register',
            name: 'apiRegister',
            component: loadView('ApiRegister'),
        },

        {
            path: '/Dashboard',
            name: 'Dashboard',
            component: loadView('Dashboard'),
            meta: { requiresAuth: true }
        },
    ]

});

router.beforeEach((to, from, next) =>{

    if(to.matched.some(record => record.meta.freshLogin)){

        let verify = false;

        if(verify !== true){

            next({
                path: '/Register',
                query: { redirect: to.fullPath }
            })
        } else {
            next();
        }
    } else {
        next();
    }

    if(to.matched.some(record => record.meta.requiresAuth)){

        let confirm = false;

        if(confirm){
            next({
                path: '/Login',
                query: { redirect: to.fullPath }
            })
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;