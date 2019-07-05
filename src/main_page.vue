<template>
  <v-app id="inspire">

    <v-navigation-drawer fixed app clipped disable-resize-watcher permanent touchless width=160>
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
          Glial: {{server_online ? backend_version : 'Disconnected'}}
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
              <p>{{company_name}}Glial</p>
            </v-toolbar-title>
          </v-menu>
        </v-flex>
        <v-spacer></v-spacer>

        <v-flex xs2 class="flex-end">
          <v-menu offset-y :disabled="$store.getters.check_if_tarantool === true">
            <v-btn slot="activator" color="primary" depressed dark class="select-server">
              <p v-if="$store.getters.check_if_tarantool !== true">{{
                `${server_scheme}://${server_address}:${server_port}` }}</p>
              <div class="icon-wrapper" v-show="server_online">
                <v-icon title="Server online" color="green" small>fa-link</v-icon>
              </div>
              <div class="icon-wrapper" v-show="!server_online">
                <v-icon title="Server offline" color="red" small>fa-link</v-icon>
              </div>
            </v-btn>
            <v-list>
              <v-list-tile v-for="(server, index) in server_history" :key="index">
                <v-list-tile-title class="cursor-pointer"  @click="change_server(server)">
                  {{ `${server.scheme}://${server.address}:${server.port}` }}
                </v-list-tile-title>
                <span @click.stop="removeServer(index)" class="red--text ml-1 cursor-pointer" >✖</span>
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

  import {mapState} from "vuex";

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
      path: "/scripts/scheduleevent",
      name: "Schedule scripts",
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
    },
    {
      path: "/settings",
      name: "Settings",
      icon: "fa-wrench",
      color: "orange"
    },
    {
      path: "/scripts/upload",
      name: "Upload scripts",
      icon: "fa-upload",
      color: "blue"
    }
  ];

  export default {
    data: () => ({
      menuitems: menu,
      frontend_version: VERSION,
      backend_version: "",
      company_name: "",
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
      removeServer(index) {
        this.$store.dispatch("remove_server", index);
      },
      get_backend_version() {
        if (this.$store.getters.check_if_tarantool === "null") {
          console.log("trying to get Tarantool")
          Vue.axios
            .get("/system_event", {
              params: {
                action: "get_git_version"
              }
            })
            .then(response => {
              if (response.data && response.data.version) {
                this.$store.dispatch("set_tarantool_state", true);
              } else {
                this.$store.dispatch("set_tarantool_state", false);
              }
            })
            .catch(error => {
              this.$store.dispatch("set_tarantool_state", false);
            });
        }
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
              this.server_online = false;
              throw new Error("Cant find version");
            }
            if (response.data && response.data.company_name) {
              this.company_name = response.data.company_name;
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
