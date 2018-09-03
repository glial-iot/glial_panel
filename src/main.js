import Vue from 'vue'
import main_page from './main_page.vue'
import manage from './manage.vue'
import bus from './bus.vue'
import logs from './logs.vue'
import backups from './backups.vue'

import editor from './scripts_pages/editor.vue'
import drivers from './scripts_pages/drivers.vue'
import event_scripts from './scripts_pages/event_scripts.vue'
import timer_scripts from './scripts_pages/timer_scripts.vue'
import shedule_scripts from './scripts_pages/shedule_scripts.vue'
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
      success: "#4caf50",
      lightblue: "#E6F0FF"
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

Vue.use(require("vue-moment"));

import { BUS_TYPE_TREE } from './utils/constants'

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
   }, {
      path: '/scripts/timerevent',
      component: timer_scripts
   }, {
      path: '/scripts/sheduleevent',
      component: shedule_scripts
   }, {
      path: '/manage',
      component: manage,
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
      server_history: Vue.localStorage.get("server_history") ? JSON.parse(Vue.localStorage.get("server_history")) : [],
      logs_visible: Vue.localStorage.get("logs_visible") !== null ? Vue.localStorage.get("logs_visible") === 'true' : true,
      editor_log_size: parseInt(Vue.localStorage.get("editor_log_size", 6)),
      bus_type: Vue.localStorage.get("bus_type", BUS_TYPE_TREE),
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
      },
      logs_visible(state, value) {
         state.logs_visible = value
         Vue.localStorage.set("logs_visible", value);
      },
      add_server_to_history(state, server) {
         let servers = [...state.server_history]
         let serverFound = servers.some((item) => item.scheme === server.scheme && item.address === server.address && item.port === server.port)

         if (!serverFound) {
            servers = [server, ...servers]
         }

         servers = servers.slice(0, 5)
         state.server_history = servers
         Vue.localStorage.set("server_history", JSON.stringify(servers));
      },
      sort_server_history(state, server) {
         const newServer = Object.assign({}, server)
         const servers = [...state.server_history]
         const filteredServers = servers.filter((item) => JSON.stringify(item) !== JSON.stringify(server))
         const newServers = [newServer, ...filteredServers]

         state.server_history = newServers
         Vue.localStorage.set("server_history", JSON.stringify(newServers));
      },
      editor_log_size(state, size) {
         state.editor_log_size = size
         Vue.localStorage.set("editor_log_size", size);
      },
      bus_type(state, type) {
         state.bus_type = type
         Vue.localStorage.set("bus_type", type);
      }
   },
   getters: {
      server_url: state => {
         return `${state.server_scheme}://${state.server_address}:${state.server_port}`;
      },
      server_ip: state => {
         return `${state.server_address}`;
      }
   },
   actions: {
      update_server_address: ({ commit }, server) => {
         commit("server_scheme", server.scheme)
         commit("server_address", server.address)
         commit("server_port", server.port)
         commit("add_server_to_history", server)
      },
      change_server: ({ commit }, server) => {
         commit("server_scheme", server.scheme)
         commit("server_address", server.address)
         commit("server_port", server.port)
         commit("sort_server_history", server)
      },
      increase_editor_log_size: ({ commit, state }) => {
         const size = state.editor_log_size + 1
         commit("editor_log_size", size)
      },
      decrease_editor_log_size: ({ commit, state }) => {
         if (state.editor_log_size > 3) {
            const size = state.editor_log_size - 1
            commit("editor_log_size", size)
         }
      }
   }
})

Vue.filter("toRelativeTime", function (time) {
   let difference, weeks, days, hours, minutes, seconds, weeksTxt, daysTxt, hoursTxt, minutesTxt, secondsTxt;

   difference = Date.now() / 1000 - time;
   weeks = Math.floor(difference / 604800);
   difference = difference % 604800;
   days = Math.floor(difference / 86400);
   difference = difference % 86400;
   hours = Math.floor(difference / 3600);
   difference = difference % 3600;
   minutes = Math.floor(difference / 60);
   seconds = Math.floor(difference % 60);

   if (weeks === 1) { weeksTxt = 'week' } else { weeksTxt = 'weeks' }
   if (days === 1) { daysTxt = 'day' } else { daysTxt = 'days' }
   if (hours === 1) { hoursTxt = 'hour' } else { hoursTxt = 'hours' }
   if (minutes === 1) { minutesTxt = 'minute' } else { minutesTxt = 'minutes' }
   if (seconds === 1) { secondsTxt = 'second' } else { secondsTxt = 'seconds' }

   if (difference >= 604800) {
      return weeks + ' ' + weeksTxt + ' ago';
   }
   else if (difference >= 86400) {
      return days + ' ' + daysTxt + ', ' + hours + ' ' + hoursTxt + ' ago';
   }
   else if (difference >= 3600) {
      return hours + ' ' + hoursTxt + ', ' + minutes + ' ' + minutesTxt + ' ago';
   }
   else if (difference >= 60) {
      return minutes + ' ' + minutesTxt + ' ago';
   }
   else {
      return seconds + ' ' + secondsTxt + ' ago';
   }
})

Vue.filter("nl2br", function (str, is_xhtml) {
   if (typeof str === "undefined" || str === null) {
      return "";
   }

   var breakTag = is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
   return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + breakTag + "$2");
})

Vue.filter("type2string", function (type) {
   if (type === "WEB_EVENT") {
      return "Web-event script";
   }
   if (type === "BUS_EVENT") {
      return "Bus-event script";
   }
   if (type === "DRIVER") {
      return "Driver script";
   }
   if (type === "TIMER_EVENT") {
      return "Timer-event script";
   }
   if (type === "SHEDULE_EVENT") {
      return "Shedule-event script";
   }
})

Vue.filter("object_label", function (type) {
   switch (type) {
      case "WEB_EVENT":
         return "Endpoint"
      case "BUS_EVENT":
         return "Mask"
      case "TIMER_EVENT":
         return "Period"
      case "SHEDULE_EVENT":
         return "Shedule"
      default:
         return ''
   }
})

var vm = new Vue({
   el: '#app',
   router,
   store,
   render: h => h(main_page)
})
