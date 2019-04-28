import VueRouter from 'vue-router';
import auth from './auth';

function loadView(view) {
    return () => import('./views/'+ view);
}

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
            component: loadView('Home')
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
            path:'/Login',
            name: 'apiLogin',
            component: loadView('ApiLogin'),
            meta: { freshLogin: true }
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
        if(!auth.verify()){
            next({
                path: '/Register',
                query: { redirect: to.fullPath },
            });

            return;
        }
    }
    next();
});

router.beforeEach((to, from, next) =>{
   if(to.matched.some(record => record.meta.requiresAuth)){
       if(!auth.confirm()){
           next({
               path: '/Login',
               redirect: to.fullPath
           });

           return;
       }
   }
    next();
});

export default router;