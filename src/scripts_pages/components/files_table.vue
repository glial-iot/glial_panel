<template>
   <div>
      <v-card class="elevation-3">

         <v-card-title class="py-0 px-0">
            <v-spacer></v-spacer>

            <create-script-modal @create_error="$refs.snackbar.update('Create file: error')" @data_updated="table_update()" :type="type"></create-script-modal>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table v-if="loaded" :headers="headers" :items="files_table" hide-actions class="no-scroll" no-data-text="No scripts">

            <template slot="items" slot-scope="props">
               <tr :key="props.item.uuid">

                  <td class="text-xs-center">
                     <div :title="props.item.status_msg">
                        <icon-normal v-show="props.item.status == 'NORMAL'">fa-check-circle</icon-normal>
                     </div>
                     <div :title="props.item.status_msg">
                        <icon-warning v-show="props.item.status == 'WARNING'">fa-exclamation-circle</icon-warning>
                     </div>
                     <div :title="props.item.status_msg">
                        <icon-error v-show="props.item.status == 'ERROR'">fa-times-circle</icon-error>
                     </div>
                     <div :title="props.item.status_msg">
                        <icon-stopped v-show="props.item.status == 'STOPPED'">fa-dot-circle</icon-stopped>
                     </div>
                  </td>

                  <td class="text-xs-left">
                     {{ props.item.name }}
                  </td>

                  <td class="text-xs-left">
                     <div v-if="type === 'WEB_EVENT'">
                        <span>
                           <a :href="$store.getters.server_url+'/we/'+props.item.object" target="_blank" style="text-decoration: none">
                              <span class="grey--text">/we/</span>
                              <span class="black--text">{{props.item.object}}</span>
                           </a>
                        </span>
                     </div>
                     <div v-if="type !== 'WEB_EVENT'">
                        {{ props.item.object }}

                     </div>

                  </td>

                  <td class="justify-center text-xs-center cell-flex">
                     <button-info :item="props" title="Show scripts info" @click.native="$refs.scriptdetails.show(props.item)"></button-info>
                  </td>

                  <td class="justify-center text-xs-center px-0 button-sm">
                     <v-btn icon class="ml-0 mr-0 btn-icon" v-show="props.item.active_flag == 'ACTIVE'" title="Active" @click="script_active_change(props.item, 'NON_ACTIVE')">
                        <v-icon color="green" small>fa-play-circle</v-icon>
                     </v-btn>
                     <v-btn icon class="ml-0 mr-0 btn-icon" v-show="props.item.active_flag == 'NON_ACTIVE'" title="Non-active" @click="script_active_change(props.item, 'ACTIVE')">
                        <v-icon color="red" small>fa-stop-circle</v-icon>
                     </v-btn>
                  </td>

                  <td class="justify-center text-xs-center button-sm">
                     <v-btn icon class="ml-0 mr-0 btn-icon" title="Edit script" @click="file_edit(props.item)">
                        <v-icon color="green" small>fa-pencil-alt</v-icon>
                     </v-btn>
                  </td>

                  <td class="justify-center text-xs-center button-sm">
                     <v-btn icon class="ml-0 mr-0 btn-icon" title="Delete script" @click="$refs.remove_modal.show(props.item)">
                        <v-icon color="pink" small>fa-trash-alt</v-icon>
                     </v-btn>
                  </td>

                  <td class="justify-center text-xs-center button-sm">
                     <v-btn icon class="ml-0 mr-0 btn-icon" title="Restart" @click="script_restart(props.item)">
                        <v-icon color="pink" small>fa-sync</v-icon>
                     </v-btn>
                  </td>
               </tr>
            </template>

         </v-data-table>

         <v-divider></v-divider>

         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span class="body-2 mx-4 grey--text"> Scripts: {{files_table.length}} </span>
         </v-card-title>

      </v-card>
      <snackbar ref="snackbar"></snackbar>
      <script-details-modal ref="scriptdetails"></script-details-modal>
      <confirm-remove-script-modal ref="remove_modal" :update="table_update"></confirm-remove-script-modal>
   </div>
</template>


<script>
import Vue from "vue";

import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import VueTimers from "vue-timers";
Vue.use(VueTimers);

import createScriptModal from "../../components/modals/create_script_modal.vue";
import scriptDetailsModal from "../../components/modals/script-details-modal.vue";
import snackbar from "../../components/snackbar.vue";
import buttonInfo from "../../components/buttons/button-info.vue";
import iconError from "../../components/icons/icon-status-error.vue";
import iconNormal from "../../components/icons/icon-status-normal.vue";
import iconStopped from "../../components/icons/icon-status-stopped.vue";
import iconWarning from "../../components/icons/icon-status-warning.vue";
import confirmRemoveScriptModal from "../../components/modals/confirm-remove-script-modal.vue";

export default {
  components: {
    createScriptModal,
    scriptDetailsModal,
    snackbar,
    buttonInfo,
    iconError,
    iconNormal,
    iconStopped,
    iconWarning,
    confirmRemoveScriptModal
  },
  data: () => ({
    headers: [],
    files_table: [],
    loaded: false
  }),
  props: ["type"],

  timers: {
    table_update: {
      autostart: true,
      time: 1000
    }
  },

  beforeRouteLeave(to, from, next) {
    this.$timer.stop("table_update");
    next();
  },

  mounted: function() {
    this.table_update();
    this.headers = [
      {
        text: "Status",
        align: "center",
        sortable: false,
        width: "6%"
      },
      {
        text: "Name",
        value: "name",
        align: "left"
      },
      {
        text: this.$options.filters.object_label(this.type),
        value: "object",
        align: "left"
      },
      {
        text: "Info",
        value: "info",
        align: "center",
        sortable: false,
        width: "6%"
      },
      {
        text: "Active",
        sortable: false,
        align: "center",
        width: "6%"
      },
      {
        text: "Edit",
        sortable: false,
        align: "center",
        width: "6%"
      },
      {
        text: "Delete",
        sortable: false,
        align: "center",
        width: "6%"
      },
      {
        text: "Restart",
        sortable: false,
        align: "center",
        width: "6%"
      }
    ];
  },

  methods: {
    file_edit(table_item) {
      this.$router.push({
        path: "/editor",
        query: { uuid: table_item.uuid }
      });
    },
    script_restart(table_item) {
      Vue.axios
        .get(
          this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
          {
            params: {
              action: "reload",
              uuid: table_item.uuid
            }
          }
        )
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Reload script error");
        });
    },
    script_active_change(table_item, flag) {
      Vue.axios
        .get(this.$store.getters.server_url + "/scripts", {
          params: {
            action: "update",
            uuid: table_item.uuid,
            active_flag: flag
          }
        })
        .then(response => {
          this.table_update();
          this.$refs.snackbar.update("");
          this.script_restart(table_item);
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Active change error");
        });
    },

    table_update() {
      Vue.axios
        .get(this.$store.getters.server_url + "/scripts", {
          params: {
            action: "get_list",
            type: this.type
          }
        })
        .then(response => {
          console.log(response.data);
          Vue.set(this, "files_table", response.data);
          this.loaded = true;
          this.$refs.snackbar.update("");
          this.$timer.stop("table_update");
          this.$timer.start("table_update");
        })
        .catch(error => {
          console.log(error);
          this.files_table = [];
          this.$refs.snackbar.update("Get script list error");
          this.$timer.stop("table_update");
          this.$timer.start("table_update");
          this.loaded = false;
        });
    }
  }
};
</script>

<style>
.no-scroll table {
  table-layout: fixed;
}
</style>


<style scoped>
.btn-icon {
  height: 18px;
  width: 18px;
  position: relative;
}
</style>
