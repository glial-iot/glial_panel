<template>
   <div>
      <v-card class="elevation-3">

         <v-card-title class="py-0 px-0">
            <v-spacer></v-spacer>

            <file-create-form @create_error="$refs.snackbar.update('Create file: error')" @data_updated="table_update()" :type="type"></file-create-form>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table :headers="headers" :items="files_table" hide-actions class="no-scroll">

            <template slot="items" slot-scope="props">
               <td class="text-xs-left" @click="$refs.scriptdetails.show(props.item)">
                  <v-icon color="primary" small right class="mr-1">fa-file-code</v-icon> {{ props.item.name }}
               </td>

               <td class="text-xs-left" @click="$refs.scriptdetails.show(props.item)">
                  {{ props.item.uuid }}
               </td>

               <td class="justify-center text-xs-center px-0 button-sm">
                  <v-btn icon class="ml-0 mr-0" v-show="props.item.status == 'NORMAL'" :title="props.item.status_msg">
                     <v-icon color="green" small>fa-check-circle</v-icon>
                  </v-btn>
                  <v-btn icon class="ml-0 mr-0" v-show="props.item.status == 'WARNING'" :title="props.item.status_msg">
                     <v-icon color="yellow darken-1" small>fa-exclamation-circle</v-icon>
                  </v-btn>
                  <v-btn icon class="ml-0 mr-0" v-show="props.item.status == 'ERROR'" :title="props.item.status_msg">
                     <v-icon color="red" small>fa-times-circle</v-icon>
                  </v-btn>
                  <v-btn icon class="ml-0 mr-0" v-show="props.item.status == 'STOPPED'" :title="props.item.status_msg">
                     <v-icon color="grey" small>fa-dot-circle</v-icon>
                  </v-btn>
               </td>

               <td class="justify-center text-xs-center px-0 button-sm">
                  <v-btn icon class="ml-0 mr-0" v-show="props.item.active_flag == 'ACTIVE'" title="Active" @click="script_active_change(props.item, 'NON_ACTIVE')">
                     <v-icon color="green" small>fa-play-circle</v-icon>
                  </v-btn>
                  <v-btn icon class="ml-0 mr-0" v-show="props.item.active_flag == 'NON_ACTIVE'" title="Non-active" @click="script_active_change(props.item, 'ACTIVE')">
                     <v-icon color="red" small>fa-stop-circle</v-icon>
                  </v-btn>
               </td>

               <td class="justify-center text-xs-center button-sm">
                  <v-btn icon class="ml-0 mr-0" title="Edit script" @click="file_edit(props.item)">
                     <v-icon color="green" small>fa-pencil-alt</v-icon>
                  </v-btn>
               </td>

               <td class="justify-center text-xs-center button-sm">
                  <v-btn icon class="ml-0 mr-0" title="Delete script" @click="script_delete(props.item)">
                     <v-icon color="pink" small>fa-trash-alt</v-icon>
                  </v-btn>
               </td>

               <td class="justify-center text-xs-center button-sm">
                  <v-btn icon class="ml-0 mr-0" title="Restart" @click="script_restart(props.item)">
                     <v-icon color="pink" small>fa-sync</v-icon>
                  </v-btn>
               </td>
            </template>

         </v-data-table>

         <v-divider></v-divider>

         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span class="body-2 mx-4 grey--text"> Scripts: {{files_table.length}} </span>
         </v-card-title>

      </v-card>
      <snackbar ref="snackbar"></snackbar>
      <script-details ref="scriptdetails"></script-details>
   </div>
</template>

<script>
import Vue from "vue";

import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import VueTimers from "vue-timers";
Vue.use(VueTimers);

import file_create_form from "./file_create_form.vue";
Vue.component("file-create-form", file_create_form);

import script_details from "./script_details.vue";
Vue.component("script-details", script_details);

import snackbar from "../../components/snackbar.vue";
Vue.component("snackbar", snackbar);

export default {
  data: () => ({
    headers: [
      {
        text: "Name",
        value: "name",
        align: "left",
        width: "30%"
      },
      {
        text: "UUID",
        value: "uuid",
        align: "left",
        width: "30%"
      },
      {
        text: "Status",
        sortable: false,
        align: "center",
        width: "7%"
      },
      {
        text: "Active",
        sortable: false,
        align: "center",
        width: "7%"
      },
      {
        text: "Edit",
        sortable: false,
        align: "center",
        width: "7%"
      },
      {
        text: "Delete",
        sortable: false,
        align: "center",
        width: "7%"
      },
      {
        text: "Restart",
        sortable: false,
        align: "center",
        width: "7%"
      }
    ],
    files_table: []
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
  },

  methods: {
    file_edit(table_item) {
      this.$router.push({
        path: "/editor",
        query: { uuid: table_item.uuid }
      });
    },
    script_delete(table_item) {
      Vue.axios
        .get(this.$store.getters.full_server_http_url + "/scripts", {
          params: {
            action: "delete",
            uuid: table_item.uuid
          }
        })
        .then(response => {
          this.table_update();
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Delete script: error");
        });
    },
    script_restart(table_item) {
      let endpoint;
      if (this.type === "WEB_EVENT") endpoint = "/webevents";
      if (this.type === "DRIVER") endpoint = "/drivers";
      if (this.type === "BUS_EVENT") endpoint = "/busevents";
      if (this.type === "TIMER_EVENT") endpoint = "/timerevents";

      Vue.axios
        .get(this.$store.getters.full_server_http_url + endpoint, {
          params: {
            action: "restart",
            uuid: table_item.uuid
          }
        })
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    },
    script_active_change(table_item, flag) {
      Vue.axios
        .get(this.$store.getters.full_server_http_url + "/scripts", {
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
          this.$refs.snackbar.update("Active change: error");
        });
    },

    table_update() {
      Vue.axios
        .get(this.$store.getters.full_server_http_url + "/scripts", {
          params: {
            action: "get_list",
            type: this.type
          }
        })
        .then(response => {
          console.log(response.data);
          Vue.set(this, "files_table", response.data);
          this.$refs.snackbar.update("");
          this.$timer.stop("table_update");
          this.$timer.start("table_update");
        })
        .catch(error => {
          console.log(error);
          this.files_table = [];
          this.$refs.snackbar.update("Get script list: error");
          this.$timer.stop("table_update");
          this.$timer.start("table_update");
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
</style>
