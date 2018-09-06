<template>
   <v-app id="inspire">

      <v-navigation-drawer fixed app clipped disable-resize-watcher permanent touchless width=150>
         <v-list dense>
            <template v-for="item in menuitems">
               <v-list-tile :to="{path: item.path}" :key="item.path">
                  <v-list-tile-action>
                     <v-icon :color="item.color">{{ item.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                     <v-list-tile-title>{{item.name}}</v-list-tile-title>
                  </v-list-tile-content>
               </v-list-tile>
               <v-divider v-if="item.divider" :key="`${item.path}-divider`"></v-divider>
            </template>
         </v-list>
         <div class="version-block">
            <div class="version-row">
               Glue: {{server_online ? backend_version : 'Disconnected'}}
            </div>
            <div class="version-row">
               Panel: {{frontend_version}}
            </div>
            <div class="version-row">
               2018 © Nokia IoT Laboratory
            </div>
         </div>
      </v-navigation-drawer>

      <v-toolbar color="primary" dark app fixed clipped-left height=48>
         <v-layout row wrap>
            <v-flex class="header-left">
               <v-menu>
                  <v-toolbar-title slot="activator">
                     <img class="mr-3 logo" src="./assets/logo_nokia.svg" height="25px" alt="Nokia Logo">
                     <p>IMPACT GLUE</p>
                  </v-toolbar-title>
               </v-menu>
            </v-flex>
            <v-spacer></v-spacer>

            <v-flex xs2 class="flex-end">
               <v-menu offset-y>
                  <v-btn slot="activator" color="primary" depressed dark class="select-server">
                     <p>{{ `${server_scheme}://${server_address}:${server_port}` }}</p>
                     <div class="icon-wrapper" v-show="server_online">
                        <v-icon title="Server online" color="green" small>fa-link</v-icon>
                     </div>
                     <div class="icon-wrapper" v-show="!server_online">
                        <v-icon title="Server offline" color="red" small>fa-link</v-icon>
                     </div>
                  </v-btn>
                  <v-list>
                     <v-list-tile v-for="(server, index) in server_history" :key="index" @click="change_server(server)">
                        <v-list-tile-title>{{ `${server.scheme}://${server.address}:${server.port}` }}</v-list-tile-title>
                     </v-list-tile>
                  </v-list>
               </v-menu>

            </v-flex>
         </v-layout>
      </v-toolbar>

      <v-content>
         <v-container fill-height fluid>
            <v-layout row wrap>
               <v-flex xs12>
                  <router-view></router-view>
               </v-flex>
            </v-layout>
         </v-container>
      </v-content>
   </v-app>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import VueTimers from "vue-timers";
Vue.use(VueTimers);

import { mapState } from "vuex";

let menu = [
  {
    path: "/bus",
    name: "Bus storage",
    icon: "fa-database",
    color: "blue"
  },
  {
    path: "/logs",
    name: "Logs",
    icon: "fa-stream",
    color: "blue",
    divider: true
  },
  {
    path: "/scripts/drivers",
    name: "Drivers",
    icon: "fa-sign-in-alt",
    color: "green darken-2"
  },
  {
    path: "/scripts/busevent",
    name: "Event scripts",
    icon: "fa-rocket",
    color: "green darken-2"
  },
  {
    path: "/scripts/timerevent",
    name: "Timer scripts",
    icon: "fa-clock",
    color: "green darken-2"
  },
  {
    path: "/scripts/sheduleevent",
    name: "Shedule scripts",
    icon: "fa-calendar-alt",
    color: "green darken-2"
  },
  {
    path: "/scripts/webevent",
    name: "Web scripts",
    icon: "fa-link",
    color: "green darken-2",
    divider: true
  },
  {
    path: "/manage",
    name: "Manage",
    icon: "fa-sliders-h",
    color: "brown"
  }
];

export default {
  data: () => ({
    menuitems: menu,
    frontend_version: VERSION,
    backend_version: "",
    server_online: false
  }),
  computed: mapState({
    server_scheme: state => state.server_scheme,
    server_address: state => state.server_address,
    server_port: state => state.server_port,
    server_history: state => state.server_history
  }),
  timers: {
    get_backend_version: {
      autostart: true,
      time: 1000,
      immediate: true,
      repeat: true
    }
  },
  methods: {
    change_server(server) {
      this.$store.dispatch("change_server", server);
    },
    get_backend_version() {
      Vue.axios
        .get(this.$store.getters.server_url + "/system_event", {
          params: {
            action: "get_git_version"
          }
        })
        .then(response => {
          if (response.data && response.data.version) {
            this.backend_version = response.data.version;
            this.server_online = true;
          } else {
            throw new Error("Cant find version");
            this.server_online = false;
          }
        })
        .catch(error => {
          console.log("error while getting backend version", error);
          this.server_online = false;
        });
    }
  }
};
</script>


<style>
table.v-table tbody td,
table.v-table tbody th {
  height: 25px !important;
}

table.v-table thead tr {
  height: 30px;
}

.small_title {
  height: 30px;
}

.no-scroll table {
  table-layout: fixed;
}

.button-sm {
  margin: -11px !important;
}

.flex-end {
  display: flex;
  justify-content: flex-end;
}

.btn-icon {
  margin: 0;
}

.btn-icon + .btn-icon {
  margin-left: 8px;
}

.btn-icon:before {
  height: 25px !important;
  width: 25px !important;
  left: -4px !important;
  top: -4px !important;
  border-radius: 0;
}

.v-navigation-drawer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.v-navigation-drawer .v-list__tile {
  padding: 0 12px;
}

.v-navigation-drawer .v-list__tile__action {
  min-width: 36px;
}

.container {
  padding: 12px;
}

.version-block {
  display: flex;
  flex-direction: column;
  padding: 8px;
  font-size: 10px;
}

.version-row {
  white-space: nowrap;
}

.header-left {
  display: flex;
  align-items: center;
}

.v-toolbar__title {
  display: flex;
  align-items: center;
}

.v-toolbar__title p {
  margin: 0;
  margin-bottom: 2px;
}

.select-server p {
  margin: 0;
  margin-right: 8px;
  line-height: 14px;
}

.select-server {
  display: flex;
  align-items: center;
  text-transform: lowercase;
}

.icon-wrapper {
  display: flex;
}

.v-card__text,
.v-card__title,
.v-card__title .title {
  word-wrap: break-word;
  max-width: 100%;
}

.v-list__tile--active {
  background-color: #e6f0ff !important;
  color: #e6f0ff !important;
}
</style>
