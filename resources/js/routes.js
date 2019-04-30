import VueRouter from 'vue-router';

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
            component: loadView('Home'),
            beforeEnter: (to, from, next) => {
                if(!auth.verified){
                    console.log('Fresh Login!');
                    next({
                        path: '/Register',
                        redirect: to.fullPath,
                    })
                } else {
                    console.log('Good, go ahead!');
                    next();
                }

                next();
            }
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
        auth.verify();
        if(!auth.verified){
            next({
                path: '/Register',
                redirect: to.fullPath,
            })
        } else {
            next();
        }
    } else {
        next();
    }
});

router.beforeEach((to, from, next) =>{
   if(to.matched.some(record => record.meta.requiresAuth)){
       if(!auth.confirm()){
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