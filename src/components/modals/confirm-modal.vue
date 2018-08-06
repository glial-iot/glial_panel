<template>
   <div>
      <v-dialog :value="visible" persistent max-width="290">
         <v-card>
            <v-card-title class="headline">Confirm wipe</v-card-title>
            <v-card-text>Do you want to wipe storage and stop the server?</v-card-text>
            <v-card-actions>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" flat @click="hide()">No</v-btn>
               <v-btn color="green darken-1" flat @click="wipe()">Yes</v-btn>
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
