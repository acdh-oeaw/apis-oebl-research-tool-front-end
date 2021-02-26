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
    components: {
      default: IssueManager
    },
    props: (route) => ({ ...route.params, ...route.query }),
  },
  {
    path: '/lemmas',
    name: 'Lemmas',
    components: {
      default: LemmaManager
    },
    props: (route) => ({ ...route.params, ...route.query }),
    children: [
      {
        path: '/lemmas/list/:lemmaListId',
        beforeEnter(route) {
          store.lemma.selectedLemmaListId = Number(route.params.lemmaListId) || null
        }
      },
      {
        path: '/lemmas/filter/:lemmaFilterId',
        beforeEnter(route) {
          store.lemma.selectedLemmaFilterId = route.params.lemmaFilterId || null
        }
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
