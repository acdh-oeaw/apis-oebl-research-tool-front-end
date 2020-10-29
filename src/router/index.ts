import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import ResearchTool from '../components/ResearchTool.vue'
import Result from '../components/Result.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: ResearchTool
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: Result,
    props: (route) => ({ ...route.params })
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
