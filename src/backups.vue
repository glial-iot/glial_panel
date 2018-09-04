<template>
   <div>
      <v-card class="elevation-3">

         <v-data-table v-if="loaded" :headers="headers" :items="table_values" must-sort class="no-scroll" no-data-text="No backups">

            <template slot="items" slot-scope="props">
               <td class="text-xs-left">
                  <div class="ellipsis">{{ props.item.time_text }}</div>
               </td>
               <td class="text-xs-left">
                  <div class="ellipsis">{{ props.item.comment }}</div>
               </td>
               <td class="text-xs-center">
                  <div class="ellipsis">{{ props.item.size }} kB</div>
               </td>
               <td class="justify-center layout px-0 button-sm">
                  <v-btn icon class="mx-0 " @click="restore(props.item)">
                     <v-icon color="pink" small>fa-upload</v-icon>
                  </v-btn>
               </td>
            </template>

         </v-data-table>

         <v-divider></v-divider>

         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span class="body-2 mx-4 grey--text"> Backups: {{table_values.length}} </span>
         </v-card-title>
      </v-card>

      <snackbar ref="snackbar_error"></snackbar>
      <snackbar ref="snackbar_msg"></snackbar>

   </div>
</template>

<script>
import Vue from "vue";
import VueTimers from "vue-timers";
Vue.use(VueTimers);

import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import snackbar from "./components/snackbar.vue";
Vue.component("snackbar", snackbar);

export default {
  data: () => ({
    search: "",
    time_format_rel: true,
    headers: [
      {
        text: "Backup time",
        value: "time_text",
        align: "left",
        sortable: false
      },
      {
        text: "Сomment",
        value: "comment",
        align: "left",
        sortable: false
      },
      {
        text: "Size",
        value: "size",
        align: "center",
        sortable: false,
        width: "20%"
      },
      {
        text: "Restore",
        align: "center",
        sortable: false,
        width: "10%"
      }
    ],
    table_values: [],
    loaded: false
  }),
  
  timers: {
    table_update: {
      autostart: true,
      time: 1000,
      repeat: true,
      immediate: true
    }
  },

  methods: {
    restore(item) {
      Vue.axios
        .get(this.$store.getters.server_url + "/backups", {
          params: {
            action: "restore",
            filename: item.filename
          }
        })
        .then(response => {
          if (response.data.result == true)
            this.$refs.snackbar_msg.update("Backup restored", "success", 2000);
          else
            this.$refs.snackbar_error.update(
              "Backup restore error: " + response.data.error_msg
            );
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar_error.update("Backup restore: network error");
        });

      this.table_update();
    },

    table_update() {
      Vue.axios
        .get(this.$store.getters.server_url + "/backups", {
          params: {
            action: "get_list",
            limit: 100
          }
        })
        .then(response => {
          this.table_values = response.data;
          this.loaded = true;
        })
        .catch(error => {
          console.log(error);
          this.table_values = [];
          this.loaded = false;
        });
    }
  }
};
</script>

<style>
table.v-table tbody td:first-child,
table.v-table tbody td:not(:first-child),
table.v-table tbody th:first-child,
table.v-table tbody th:not(:first-child),
table.v-table thead td:first-child,
table.v-table thead td:not(:first-child),
table.v-table thead th:first-child,
table.v-table thead th:not(:first-child) {
  padding: 0 10px;
}
</style>


<style scoped>
</style>

