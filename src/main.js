import Vue from 'vue'
import main_page from './main_page.vue'
import controls from './controls.vue'
import bus from './bus.vue'
import editor from './editor.vue'

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

let router = new VueRouter({
    routes: [{
        path: '/bus',
        component: bus
    }, {
        path: '/logs',
        component: {
            template: `<div class="title">Page 2</div>`
        },
    }, {
        path: '/files',
        component: {
            template: `<div class="title">Page 3</div>`
        },
    }, {
        path: '/controls',
        component: controls,
    }, {
        path: '/editor',
        component: editor
    }, {
        path: '*',
        redirect: '/bus'
    }]
})



new Vue({
    el: '#app',
    router,
    render: h => h(main_page)
})