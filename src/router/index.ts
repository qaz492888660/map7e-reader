import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'BookShelf',
      component: () => import('../views/BookShelf.vue')
    },
    {
      path: '/read/:bookId',
      name: 'Reader',
      component: () => import('../views/Reader.vue')
    },
    {
      path: '/ai-find',
      name: 'AIFind',
      component: () => import('../views/AIFind.vue')
    }
  ]
})

export default router
