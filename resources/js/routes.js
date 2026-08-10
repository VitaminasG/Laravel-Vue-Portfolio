import VueRouter from 'vue-router';
import store from './store/vueStore';

function loadView(view) {

  return () => import('./views/' + view + '.vue');
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
      meta: { freshLogin: true },
    },

    {
      path:'/Login',
      name: 'apiLogin',
      component: loadView('ApiLogin'),
      meta: { freshLogin: true },
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

router.beforeEach(async (to, from, next) => {

  try {

    if (to.matched.some(record => record.meta.freshLogin)) {

      await store.dispatch('setTarget', {
        list: store.getters.list,
        method: 'get',
        route: 'verify'
      });

      await store.dispatch('freshB', store.getters.target);

      if (!store.getters.verified) {
        return next({ path: '/Register' });
      }
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {

      await store.dispatch('checkStorage');

      if (!store.getters.confirmed) {
        return next({ path: '/Login' });
      }
    }

    next();

  } catch (error) {

    // Fail open: this guard is a UX affordance, not the security boundary
    // (the server's auth:api middleware is). On first load there is no
    // previous route to fall back to, so next(false) would strand the
    // user on a blank screen. Log the failure and let navigation through
    // instead of hanging forever on a rejected dispatch.
    console.error('Router guard: failed to resolve auth state, allowing navigation through', error);
    next();
  }
});

export default router;