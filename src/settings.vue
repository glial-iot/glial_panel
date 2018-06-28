
<template>
   <div>
      <v-toolbar>
         <v-spacer></v-spacer>
         <v-icon>fa-sliders-h</v-icon>
         <v-toolbar-title center>Settings</v-toolbar-title>
         <v-spacer></v-spacer>
      </v-toolbar>
      <v-card>
         <v-form left>
            <v-layout row wrap mt-3 pt-3>
               <v-flex xs3 pt-4>
                  <v-icon>fa-globe</v-icon>
                  <v-title>Server connection address</v-title>
               </v-flex>
               <v-flex xs3>
                  <v-text-field name="input-3-1" label="server address" v-model="server_address">
                  </v-text-field>
               </v-flex>
               <v-flex xs2>
                  <v-text-field name="input-3-P" label="port number" v-model="server_port">
                  </v-text-field>
               </v-flex>
               <v-flex xs1>
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
