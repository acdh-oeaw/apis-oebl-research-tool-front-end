import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import IssueManager from '../views/IssueManager/IssueManager.vue'
import IssueNavigation from '../views/IssueManager/IssueNavigation.vue'

import LemmaManager from '../views/LemmaManager/LemmaManager.vue'
import LemmaNavigation from '../views/LemmaManager/LemmaNavigation.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/lemmas'
  },
  {
    path: '/issue/:issueId',
    name: 'Issue',
    components: {
      default: IssueManager,
      sidebar: IssueNavigation
    },
    props: (route) => ({ ...route.params, ...route.query }),
  },
  {
    path: '/lemmas',
    name: 'Lemmas',
    components: {
      default: LemmaManager,
      sidebar: LemmaNavigation
    },
    props: (route) => ({ ...route.params, ...route.query }),
    children: [
      {
        path: '/lemmas/:lemmaListId',
        name: 'LemmaList',
        components: {
          default: LemmaManager,
          sidebar: LemmaNavigation
        },
        props: (route) => ({ ...route.params, ...route.query })
      },
      {
        path: '/lemmas/filter/:lemmaFilterId',
        name: 'LemmaFilter',
        components: {
          default: LemmaManager,
          sidebar: LemmaNavigation
        },
        props: (route) => ({ ...route.params, ...route.query })
      }
    ]
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
