import Vue from 'vue'
import main_page from './main_page.vue'
import controls from './controls.vue'
import settings from './settings.vue'
import bus from './bus.vue'
import logs from './logs.vue'
import backups from './backups.vue'

import editor from './scripts_pages/editor.vue'
import drivers from './scripts_pages/drivers.vue'
import event_scripts from './scripts_pages/event_scripts.vue'
//import timer_scripts from './scripts_pages/timer_scripts.vue'
import web_scripts from './scripts_pages/web_scripts.vue'

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
      path: '/scripts/drivers',
      component: drivers
   }, {
      path: '/scripts/busevent',
      component: event_scripts
   }, {
      path: '/scripts/webevent',
      component: web_scripts
   }, /* {
      path: '/scripts/timerevent',
      component: timer_scripts
   },  */{
      path: '/controls',
      component: controls,
   }, {
      path: '/settings',
      component: settings,
   }, {
      path: '/backups',
      component: backups,
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
      server_address: Vue.localStorage.get("server_address", "localhost"),
      server_port: Vue.localStorage.get("server_port", "8080"),
      server_scheme: Vue.localStorage.get("server_scheme", "http"),
      endpoints: { "WEB_EVENT": "/webevents", "DRIVER": "/drivers", "BUS_EVENT": "/busevents", "TIMER_EVENT": "/timerevents", "SHEDULE_EVENT": "/sheduleevents", }
   },
   mutations: {
      server_address(state, address) {
         state.server_address = address
         Vue.localStorage.set("server_address", address);
      },
      server_port(state, port) {
         state.server_port = port
         Vue.localStorage.set("server_port", port);
      },
      server_scheme(state, scheme) {
         state.server_scheme = scheme
         Vue.localStorage.set("server_scheme", scheme);
      }
   },
   getters: {
      server_url: state => {
         return `${state.server_scheme}://${state.server_address}:${state.server_port}`;
      },
      server_ip: state => {
         return `${state.server_address}`;
      }

   }
})

var vm = new Vue({
   el: '#app',
   router,
   store,
   render: h => h(main_page)
})
