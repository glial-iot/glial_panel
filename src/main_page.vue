<template lang=html>
  <v-app id="inspire">

   <v-navigation-drawer fixed app clipped disable-resize-watcher permanent touchless width=200>
      <v-list dense>
         <v-list-tile v-for="item in menuitems" :to="{path: item.path}" :key = "item.path">
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
         <v-menu :nudge-width="-100">
            <v-toolbar-title slot="activator">
               <div>
                  <img style="height: 25px" class="mr-3 mt-2" src="./logo_nokia.svg" alt="Nokia Logo"></img>
                  IMPACT GLUE
               </div>
            </v-toolbar-title>
         </v-menu>
   </v-toolbar>


    <v-content>
         <v-container grid-list-md text-xs-center>
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
    path: "/files/drivers",
    name: "Drivers",
    icon: "fa-screwdriver",
    color: "green darken-2"
  },
  {
    path: "/files/event_scripts",
    name: "Event scripts",
    icon: "fa-rocket",
    color: "green darken-2"
  },
  {
    path: "/files/web_scripts",
    name: "Web scripts",
    icon: "fa-link",
    color: "green darken-2"
  },
  {
    path: "/files/timer_scripts",
    name: "Timer scripts",
    icon: "fa-clock",
    color: "green darken-2"
  },
  {
    path: "/files/user_html",
    name: "User HTML",
    icon: "fa-laptop",
    color: "green darken-2"
  }
];

export default {
  data: () => ({
    menuitems: menu
  })
};
</script>
