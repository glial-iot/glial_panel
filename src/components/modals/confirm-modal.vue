<template>
   <div>
      <v-dialog v-on:keydown.esc="hide()" :value="visible" persistent max-width="290">
         <v-card>
            <v-card-title class="headline">Confirm wipe</v-card-title>
            <v-card-text>Do you want to delete database and storage? <br> All scripts, logs, data bus will be deleted! <br> Backups will not be deleted</v-card-text>
            <v-card-actions>
               <v-btn color="error" flat @click="wipe()">Wipe</v-btn>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" dark @click="hide()">No</v-btn>
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
    visible: false
  }),
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    wipe() {
      Vue.axios
        .get(this.$store.getters.server_url + "/system_event", {
          params: {
            action: "wipe_storage"
          }
        })
        .then(response => {
          console.log(response.data.msg);
          this.$refs.snackbar.update(response.data.msg, "success", 5000);
          this.hide();
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Network error");
          this.hide();
        });
    }
  }
};
</script>
