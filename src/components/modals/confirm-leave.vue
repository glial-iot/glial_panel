<template>
   <div>
      <v-dialog v-on:keydown.esc="hide()" v-model="visible" max-width="420">
         <v-card>
            <v-card-title class="headline">Are you sure?</v-card-title>
            <v-card-text>
               You have unsaved changes! Do you really want to leave?<br>
            </v-card-text>
            <v-card-actions class="pa-3" d-flex>
               <v-layout align-center justify-space-around>
               <v-btn color="error" @click="discard()">Discard changes</v-btn>
               <v-btn color="success" @click="save()">Save & exit</v-btn>
               </v-layout>
            </v-card-actions>
         </v-card>
      </v-dialog>
      <snackbar ref="snackbar"></snackbar>
   </div>
</template>


<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import snackbar from "../snackbar.vue";

export default {
  data: () => ({
    visible: false,
    resolve: null
  }),
  methods: {
    dialog() {
      if (this.resolve) {this.resolve('show_again')}
      this.show();
      return new Promise((resolve, reject) =>{
           this.resolve = resolve;
      })
    },
    show () {
      this.visible = true;
    },
    save () {
      this.resolve('save');
    },
    hide() {
      this.visible = false;
    },
    discard() {
      this.resolve('discard');
    }
  }
};
</script>
