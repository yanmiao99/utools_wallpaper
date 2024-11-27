import { createRouter, createWebHashHistory } from 'vue-router';
// 引入路由

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: '首页',
      path: '/',
      redirect: '/home',
    },
    {
      name: '主页',
      path: '/home',
      component: () => import('@/pages/home/index.vue'),
    },
    {
      name: '关于',
      path: '/about',
      component: () => import('@/pages/about/index.vue'),
    },
    {
      name: '分类',
      path: '/classify',
      component: () => import('@/pages/classify/index.vue'),
    },
    {
      name: '历史记录',
      path: '/history',
      component: () => import('@/pages/history/index.vue'),
    },
    {
      name: '分类详情',
      path: '/classifyDetails',
      component: () => import('@/pages/classifyDetails/index.vue'),
    },
    {
      name: '设置',
      path: '/setting',
      component: () => import('@/pages/setting/index.vue'),
    },
  ],
});

export default router;
