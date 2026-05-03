import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import GameDetail from '../views/GameDetail.vue'

// 配置路由规则（URL地址对应哪个页面）
const routes = [
    {
        path: '/',
        redirect: '/login' // 默认打开网站就重定向到登录页
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/home',
        name: 'Home',
        component: Home
    },
    {
        // ⭐ 新增：动态路由，:id 代表这是一个可变的参数
        path: '/game/detail/:id',
        name: 'GameDetail',
        component: () => import('../views/GameDetail.vue') // 采用企业级懒加载写法
    },
    // ⭐️ 新增：后台管理的嵌套路由
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/layout/DashboardLayout.vue'),
        redirect: '/dashboard/profile',
        children: [
            // ⭐️ 新增：超级管理员的平台数据大屏
            {
                path: 'overview',
                name: 'PlatformOverview',
                component: () => import('../views/PlatformOverview.vue')
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('../views/Profile.vue')
            },
            // ⭐️ 新增：用户管理页面的子路由
            {
                path: 'users',
                name: 'UserManage',
                component: () => import('../views/UserManage.vue')
            },
            // ⭐️ 新增：开发者发布游戏页面
            {
                path: 'publish',
                name: 'PublishGame',
                component: () => import('../views/PublishGame.vue')
            },
            // ⭐️ 新增：我的收藏子路由
            {
                path: 'favorites',
                name: 'MyFavorites',
                component: () => import('../views/MyFavorites.vue')
            },
            // ⭐️ 新增：我的发帖管理
            {
                path: 'my-posts',
                name: 'MyPosts',
                component: () => import('../views/MyPosts.vue')
            },
            // ⭐️ 新增：超级管理员的游戏审核中心
            {
                path: 'audit',
                name: 'GameAudit',
                component: () => import('../views/GameAudit.vue')
            },
            // ⭐️ 开发者：我的游戏库
            {
                path: 'my-games',
                name: 'MyGames',
                component: () => import('../views/MyGames.vue')
            },
            // ⭐️ 超级管理员：全站游戏管理
            {
                path: 'admin-games',
                name: 'AdminGameManage',
                component: () => import('../views/AdminGameManage.vue')
            },
            // ⭐️ 超级管理员：论坛与评论治理
            {
                path: 'admin-forum',
                name: 'AdminForumManage',
                component: () => import('../views/AdminForumManage.vue')
            },
        ]
    },    // ⭐️ 新增：玩家交流论坛页面
    {
        path: '/forum',
        name: 'Forum',
        component: () => import('../views/Forum.vue')
    },
    // ⭐️ 帖子详情页 (动态路由)
    {
        path: '/forum/detail/:id',
        name: 'PostDetail',
        component: () => import('../views/PostDetail.vue')
    },

]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router