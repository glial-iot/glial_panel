<template>
   <div>
      <v-card>
         <v-card-title>
            <v-icon>fa-sliders-h</v-icon>
            <v-toolbar-title>Panel settings</v-toolbar-title>
         </v-card-title>
         <v-divider> </v-divider>
         <v-form>
            <v-layout row wrap pl-3 pt-2>
               <v-flex md2 pt-4>
                  <v-icon>fa-globe</v-icon>
                  <span>Server address</span>
               </v-flex>
               <v-spacer></v-spacer>
               <v-flex md2 pt-1>
                  <v-select label="server scheme" v-model="server_scheme" :items="scheme_items">
                  </v-select>
               </v-flex>
               <v-spacer></v-spacer>
               <v-flex md2 pt-1>
                  <v-text-field label="server address" v-model="server_address">
                  </v-text-field>
               </v-flex>
               <v-spacer></v-spacer>
               <v-flex md2 pt-1 ml-1>
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
      <export-block></export-block>
      <v-card class="mt-3">
         <v-card-title>
            <v-icon>fa-cogs</v-icon>
            <v-toolbar-title>Glue controls</v-toolbar-title>
         </v-card-title>
         <v-divider> </v-divider>
         <v-form>
            <v-layout row wrap pl-3 pt-3 pr-3 pb-3>
               <v-flex md3 justify-center>
                  <v-btn color="secondary" @click.native="send('tarantool_stop')">
                     <v-icon left small>fa-stop-circle</v-icon> Glue restart
                  </v-btn>
               </v-flex>
               <v-flex md3 justify-center>
                  <v-btn color="secondary" @click.native="send('update')">
                     <v-icon left small>fa-cloud-download-alt</v-icon> GLUE update and restart
                  </v-btn>
               </v-flex>
               <v-flex md3 justify-center>
                  <v-btn color="warning" @click="$refs.reset_bus.show()">
                     <v-icon left small>fa-trash-alt</v-icon> Delete all from Bus
                  </v-btn>
               </v-flex>
               <v-flex md3 justify-center>
                  <v-btn color="error" @click="$refs.confirm_modal.show()">
                     <v-icon left small>fa-exclamation-triangle</v-icon> Wipe storage and stop
                  </v-btn>
               </v-flex>
            </v-layout>
            <backups ref="backups"></backups>
         </v-form>
      </v-card>

      <snackbar ref="snackbar"></snackbar>
      <server-response-modal ref="server_response_modal"></server-response-modal>
      <confirm-modal ref="confirm_modal"></confirm-modal>
      <reset-bus-modal ref="reset_bus"></reset-bus-modal>
   </div>
</template>
<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import snackbar from "./components/snackbar.vue";
import serverResponseModal from "./components/modals/server-response-modal.vue";
import confirmModal from "./components/modals/confirm-modal.vue";
import resetBusModal from "./components/modals/reset-bus-confirm-modal.vue";
import backups from "./backups.vue";
import exportBlock from "./components/blocks/manage/export.vue";

export default {
  components: {
    snackbar,
    serverResponseModal,
    confirmModal,
    resetBusModal,
    backups,
    exportBlock
  },
  data() {
    return {
      server_address: "",
      server_port: "",
      server_scheme: "",
      scheme_items: ["http", "https"]
    };
  },
  created: function() {
    this.server_address = this.$store.state.server_address;
    this.server_port = this.$store.state.server_port;
    this.server_scheme = this.$store.state.server_scheme;
  },
  methods: {
    update() {
      this.$store.dispatch("update_server_address", {
        scheme: this.server_scheme,
        address: this.server_address,
        port: this.server_port
      });
    },
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
          if (action === "update") {
            this.$refs.server_response_modal.show(response.data.msg);
          } else {
            this.$refs.snackbar.update(response.data.msg, "success", 5000);
          }
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Network error");
        });
    },
    topic_delete(item) {
      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus", {
          params: {
            action: "delete_topics",
            topic: "*"
          }
        })
        .then(response => {
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Delete topic: network error");
        });
    }
  }
};
</script>

<style scoped>
.justify-center {
  display: flex;
}
</style>
