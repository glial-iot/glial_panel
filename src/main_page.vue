<template lang=html>
  <v-app id="inspire">

   <v-navigation-drawer fixed app clipped disable-resize-watcher permanent touchless width=200>
      <v-list dense>
         <v-list-tile v-for="menuitem in menuitems" :to="{path: menuitem.path}">
               <v-list-tile-action>
                  <v-icon>{{ menuitem.icon }}</v-icon>
               </v-list-tile-action>
               <v-list-tile-content>
                  <v-list-tile-title>{{menuitem.name}}</v-list-tile-title>
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
    icon: "fa-database"
  },
  {
    path: "/logs",
    name: "Logs",
    icon: "fa-stream"
  },
  {
    path: "/files",
    name: "File manager",
    icon: "fa-edit"
  },
  {
    path: "/controls",
    name: "Controls",
    icon: "fa-cogs"
  },
  {
    path: "/editor",
    name: "Editor",
    icon: "fa-cogs"
  }
];

export default {
  data: () => ({
    menuitems: menu
  })
};
</script>
