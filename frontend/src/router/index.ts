import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      {
         path: '/:pathMatch(.*)*',
         name: 'not-found',
         component: () => import('../views/ErrorCodeView.vue'),
         props: () => ({
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
      // {
      //    path: '/test',
      //    name: 'test',
      //    component: () => import('../views/TestView.devtest.vue'),
      // },
      {
         path: '/editor/:id',
         name: 'editor-full',
         redirect: to => {
            const id = to.params.id;
            return { path: `/e/${id}` };
         }
      },
      {
         path: '/e/:id',
         name: 'editor',
         component: () => import('../views/EditorView.vue'),
      }
   ],

});

export default router;
