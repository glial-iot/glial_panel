import Vue from 'vue'
import main_page from './main_page.vue'
import controls from './controls.vue'
import settings from './settings.vue'
import bus from './bus.vue'
import logs from './logs.vue'
import editor from './editor.vue'
import drivers from './file_editors/drivers.vue'
import event_scripts from './file_editors/event_scripts.vue'
import timer_scripts from './file_editors/timer_scripts.vue'
import web_scripts from './file_editors/web_scripts.vue'
import user_html from './file_editors/user_html.vue'


import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify, {
   theme: {
      primary: "#124191",
      secondary: "#1976D2",
      accent: "#80D8FF",
      error: "#B71C1C",
      warning: "#FBC02D",
      info: "#2196f3",
      success: "#4caf50"
   }
})

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import faDatabase from '@fortawesome/fontawesome-free-solid/faDatabase'
fontawesome.library.add(solid.faDatabase)

import 'material-design-icons-iconfont/dist/material-design-icons.css'

import VueLocalStorage from 'vue-localstorage';
Vue.use(VueLocalStorage)

import Vuex from 'vuex'
Vue.use(Vuex)

const router = new VueRouter({
   routes: [{
      path: '/bus',
      component: bus
   }, {
      path: '/logs',
      component: logs
   }, {
      path: '/files/drivers',
      component: drivers
   }, {
      path: '/files/event_scripts',
      component: event_scripts
   }, {
      path: '/files/web_scripts',
      component: web_scripts
   }, {
      path: '/files/timer_scripts',
      component: timer_scripts
   }, {
      path: '/files/user_html',
      component: user_html
   }, {
      path: '/controls',
      component: controls,
   }, {
      path: '/settings',
      component: settings,
   }, {
      path: '/editor',
      component: editor
   }, {
      path: '*',
      redirect: '/bus'
   }]
})

const store = new Vuex.Store({
   state: {
      server_url: '',
      port_number: ''
   },
   mutations: {
      server_address(state, address) {
         Vue.localStorage.set("server_address", address);
      },
      server_port(state, port) {
         Vue.localStorage.set("server_port", port);
      }
   },
   getters: {
      full_server_http_url: state => {
         let port = Vue.localStorage.get("server_port", "8080")
         let address = Vue.localStorage.get("server_address", "localhost")
         return "http://" + address + ":" + port;
      },
      server_port: state => {
         return Vue.localStorage.get("server_port", "8080")
      },
      server_address: state => {
         return Vue.localStorage.get("server_address", "localhost")
      }
   }
})

var vm = new Vue({
   el: '#app',
   router,
   store,
   render: h => h(main_page)
})
