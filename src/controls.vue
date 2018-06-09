<template>
   <div>
      <div class="title text-xs-center py-1">Controls</div>

      <div class="text-xs-center">
         <v-btn :loading="button_wipe.loading" :disabled="button_wipe.disabled" :color="button_wipe.color" @click.native="button = 'button_wipe'">
            <v-icon left small>fa-exclamation-triangle</v-icon> Wipe storage and stop
         </v-btn>
         <v-btn :loading="button_stop.loading" :disabled="button_stop.disabled" :color="button_stop.color" @click.native="button = 'button_stop'">
            <v-icon left small>fa-stop-circle</v-icon> Tarantool stop
         </v-btn>
         <v-btn :loading="button_update.loading" :disabled="button_update.disabled" :color="button_update.color" @click.native="button = 'button_update'">
            <v-icon left small>fa-cloud-download-alt</v-icon> GLUE update and stop
         </v-btn>
         <v-btn :loading="button_edit.loading" :disabled="button_edit.disabled" :color="button_edit.color" @click.native="button = 'button_edit'">
            <v-icon left small>fa-edit</v-icon> Edit user menu
         </v-btn>
      </div>

      <v-snackbar :timeout="10000" :top="true" :right="true" v-model="snackbar" :color="'error'">
         {{ snackbartext }}
         <v-btn flat @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>
   </div>

</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

export default {
  data() {
    return {
      snackbar: false,
      snackbartext: "",
      button: null,
      color: null,
      button_wipe: {
        disabled: false,
        loading: false,
        color: "secondary",
        action: "wipe_storage"
      },
      button_stop: {
        disabled: false,
        loading: false,
        color: "secondary",
        action: "tarantool_stop"
      },
      button_update: {
        disabled: false,
        loading: false,
        color: "secondary",
        action: "update"
      },
      button_edit: {
        disabled: false,
        loading: false,
        color: "secondary",
        action: ""
      }
    };
  },
  watch: {
    button() {
      if (this.button != undefined) {
        const l = this.button;
        this[l].loading = true;
        //this[l].disabled = true;

        Vue.axios
          .get("http://localhost:8080/system_actions", {
            params: {
              action: this[l].action
            }
          })
          .then(response => {
            let old_color = this[l].color;
            setTimeout(() => (this[l].loading = false), 800);
            setTimeout(() => (this[l].disabled = false), 800);
            this[l].color = "success";
            setTimeout(() => (this[l].color = old_color), 1500);
            console.log(response);
          })
          .catch(error => {
            let old_color = this[l].color;
            setTimeout(() => (this[l].loading = false), 800);
            setTimeout(() => (this[l].disabled = false), 800);
            this[l].color = "error";
            setTimeout(() => (this[l].color = old_color), 2000);
            console.log(error);
            this.snackbar = false;
            this.snackbartext = "Network error";
            this.snackbar = true;
          });

        this.button = null;
      }
    }
  }
};
</script>
