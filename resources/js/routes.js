import VueRouter from 'vue-router'

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
            patch:'/Login',
            name: 'apiLogin',
            component: loadView('ApiLogin'),
            meta: {
                freshLogin: true
            }

        },

        {
            path: '/Dashboard',
            name: 'Dashboard',
            component: loadView('Dashboard'),
            meta: {
                requiresAuth: true
            }
        },
    ]

});

router.beforeEach((to, from, next) =>{
    next();
});

export default router;