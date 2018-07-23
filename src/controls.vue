<template>
   <div>
      <div class="title text-xs-center py-1">Controls</div>

      <div class="text-xs-center">
         <v-btn color="secondary" @click.native="send('wipe_storage')">
            <v-icon left small>fa-exclamation-triangle</v-icon> Wipe storage and stop
         </v-btn>
         <v-btn color="secondary" @click.native="send('tarantool_stop')">
            <v-icon left small>fa-stop-circle</v-icon> Tarantool stop
         </v-btn>
         <v-btn color="secondary" @click.native="send('update')">
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
    return {};
  },

  methods: {
    send(action) {
      console.log(action);
      Vue.axios
        .get(this.$store.getters.server_url + "/system_event", {
          params: {
            action: action
          }
        })
        .then(response => {
          console.log(response.data.msg);
          this.$refs.snackbar.update(response.data.msg, "success", 5000);
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Network error");
        });
    }
  }
};
</script>
