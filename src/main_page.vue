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

            <v-flex xs2>
               <v-menu offset-y>
                  <v-btn slot="activator" color="primary" depressed dark>
                     {{$store.getters.server_ip}}
                  </v-btn>
                  <v-list>
                     <v-list-tile v-for="(item, index) in server_items" :key="index" @click="set_ip(item.address)">
                        <v-list-tile-title>{{ item.address }}</v-list-tile-title>
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
    menuitems: menu,
    server_items: [{ address: "127.0.0.1" }, { address: "192.168.1.45" }]
  }),

  methods: {
    set_ip(address) {
      this.$store.commit("server_address", address);
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
</style>
