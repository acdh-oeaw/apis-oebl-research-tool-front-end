import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import IssueManager from '../views/IssueManager/IssueManager.vue'
import LemmaManager from '../views/LemmaManager/LemmaManager.vue'
import Article from '../views/ArticleManager/Article.vue'
import store from '@/store'
import ArticleStore from '@/store/article'

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
    component: LemmaManager,
    props: (route) => {
      return {
        highlightId: Number(route.query.focus) || null
      }
    }
  },
  {
    path: '/lemmas/list/:lemmaListId',
    component: LemmaManager,
    props: (route) => {
      return {
        lemmaListId: Number(route.params.lemmaListId) || null,
        highlightId: Number(route.query.focus) || null
      }
    }
  },
  {
    path: '/lemmas/filter/:lemmaFilterId',
    component: LemmaManager
  },
  {
    path: '/article/:issueLemmaId',
    component: Article,
    props: (route) => {
      store.article = new ArticleStore(Number(route.params.issueLemmaId))
      return {
        issueLemmaId: Number(route.params.issueLemmaId) || null
      }
    }
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
