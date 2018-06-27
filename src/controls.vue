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
      </div>

      <snackbar ref="snackbar"></snackbar>

   </div>

</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import snackbar from "./components/snackbar.vue";
Vue.component("snackbar", snackbar);

export default {
  data() {
    return {
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
          .get(this.$store.getters.full_url+'/system_actions', {
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
            this.$refs.snackbar.update("Network error");
          });

        this.button = null;
      }
    }
  }
};
</script>
