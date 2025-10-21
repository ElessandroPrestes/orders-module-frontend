const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'index', 
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'app/login',
        name: 'login',
        component: () => import('@auth/pages/LoginPage.vue'),
        meta: { requiresAuth: false}
      }
    ]
  },


  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes