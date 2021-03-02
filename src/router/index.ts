import store from '@/store'
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import IssueManager from '../views/IssueManager/IssueManager.vue'
import LemmaManager from '../views/LemmaManager/LemmaManager.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/lemmas'
  },
  {
    path: '/issue/:issueId',
    name: 'Issue',
    component: IssueManager,
    props: (route) => ({ ...route.params, ...route.query }),
  },
  {
    path: '/lemmas',
    name: 'Lemmas',
    component: LemmaManager
  },
  {
    path: '/lemmas/list/:lemmaListId',
    component: LemmaManager,
    props: (route) => {
      return {
        lemmaListId: Number(route.params.lemmaListId) || null,
        highlightId: Number(route.query.focus)
      }
    }
  },
  {
    path: '/lemmas/filter/:lemmaFilterId',
    component: LemmaManager
  }
  // route level code-splitting
  // this generates a separate chunk (about.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
