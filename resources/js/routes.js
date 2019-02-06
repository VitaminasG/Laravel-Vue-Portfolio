import VueRouter from 'vue-router'

function loadView(view) {
    return () => import('./views/'+ view);
}

let routes =  [
    {
        path: '/',
        name: 'Home',
        component: loadView('Home')
    },
    {

        path: '/OS',
        name: 'OS',
        component: loadView('OS')

    }
];

export default new VueRouter({

    mode: 'history',
    routes

});