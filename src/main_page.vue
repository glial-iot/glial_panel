<template>
   <v-app id="inspire">

      <v-navigation-drawer fixed app clipped disable-resize-watcher permanent touchless width=200>
         <v-list dense>
            <v-list-tile v-for="item in menuitems" :to="{path: item.path}" :key="item.path">
               <v-list-tile-action>
                  <v-icon :color="item.color">{{ item.icon }}</v-icon>
               </v-list-tile-action>
               <v-list-tile-content>
                  <v-list-tile-title>{{item.name}}</v-list-tile-title>
               </v-list-tile-content>
            </v-list-tile>
         </v-list>
      </v-navigation-drawer>

      <v-toolbar color="primary" dark app fixed clipped-left>
         <v-layout row wrap>
            <v-flex>
               <v-menu>
                  <v-toolbar-title slot="activator">
                     <div>
                        <img class="mr-3 mt-2" src="./assets/logo_nokia.svg" height="25px" alt="Nokia Logo"> IMPACT GLUE
                     </div>
                  </v-toolbar-title>
               </v-menu>
            </v-flex>
            <v-spacer></v-spacer>

            <v-flex xs2 class="flex-end">
               <v-menu offset-y>
                  <v-btn slot="activator" color="primary" depressed dark>
                     {{ `${server_scheme}://${server_address}:${server_port}` }}
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
import {mapState} from 'vuex'

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
    color: "blue"
  },
  {
    path: "/controls",
    name: "Controls",
    icon: "fa-cogs",
    color: "brown"
  },
  {
    path: "/settings",
    name: "Settings",
    icon: "fa-sliders-h",
    color: "brown"
  },
  {
    path: "/backups",
    name: "Backups",
    icon: "fa-archive",
    color: "brown"
  },
  {
    path: "/scripts/drivers",
    name: "Drivers",
    icon: "fa-screwdriver",
    color: "green darken-2"
  },
  {
    path: "/scripts/busevent",
    name: "Event scripts",
    icon: "fa-rocket",
    color: "green darken-2"
  },
  {
    path: "/scripts/webevent",
    name: "Web scripts",
    icon: "fa-link",
    color: "green darken-2"
  } /* ,
  {
    path: "/scripts/timerevent",
    name: "Timer scripts",
    icon: "fa-clock",
    color: "green darken-2"
  } */
];

export default {
  data: () => ({
    menuitems: menu
  }),
  computed: mapState({
    server_scheme: state => state.server_scheme,
    server_address: state => state.server_address,
    server_port: state => state.server_port,
    server_history: state => state.server_history,
  }),
  methods: {
    change_server(server) {
      this.$store.dispatch("change_server", server);
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
</style>
