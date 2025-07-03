import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      {
         path: '/:pathMatch(.*)*',
         name: 'not-found',
         component: () => import('../views/ErrorCodeView.vue'),
         props: (route) => ({
            errorCode: 404,
            message: 'The page you are looking for does not exist.'
         }),
      },
      {
         path: '/',
         name: 'home',
         component: HomeView,
      },
      {
         path: '/about',
         name: 'about',
         component: () => import('../views/AboutView.vue'),
      },
      {
         path: '/editor/:id',
         name: 'editor',
         component: () => import('../components/CodeEditor.vue'),
      }
   ],

});

export default router;
