
<template>
   <div>
      <v-card>
         <v-card-title>
            <v-icon>fa-sliders-h</v-icon>
            <v-toolbar-title>Settings</v-toolbar-title>
         </v-card-title>
         <v-divider> </v-divider>
         <v-form>
            <v-layout row wrap pl-3 pt-2>
               <v-flex md3 pt-4>
                  <v-icon>fa-globe</v-icon>
                  <span>Server address</span>
               </v-flex>
               <v-spacer></v-spacer>
               <v-flex md3 pt-1>
                  <v-text-field label="server address" v-model="server_address">
                  </v-text-field>
               </v-flex>
               <v-spacer></v-spacer>
               <v-flex md3 pt-1 ml-1>
                  <v-text-field label="port" v-model="server_port">
                  </v-text-field>
               </v-flex>
               <v-spacer></v-spacer>
               <v-flex md2 pt-2 ml-1>
                  <v-btn @click="update">
                     <v-icon left small>fa-arrow-alt-circle-right</v-icon> Save
                  </v-btn>
               </v-flex>
            </v-layout>
         </v-form>
      </v-card>
   </div>
</template>
<script>
import Vue from "vue";

export default {
  data() {
    return {
      server_address: "",
      server_port: ""
    };
  },

  created: function() {
    this.server_address = this.$store.state.server_address;
    this.server_port = this.$store.state.server_port;
  },

  methods: {
    update() {
      this.$store.commit("server_address", this.server_address);
      this.$store.commit("server_port", this.server_port);
    }
  }
};
</script>
