<template>
   <div>
      <v-card class="elevation-3">
         <v-card-title class="py-1 px-1">

            <div class="pl-2">
               <v-btn-toggle v-model="search">
                  <v-btn flat value="INFO">INFO</v-btn>
                  <v-btn flat value="WARNING">WARNING</v-btn>
                  <v-btn flat value="ERROR">ERROR</v-btn>
                  <v-btn flat value="">ALL</v-btn>
               </v-btn-toggle>
            </div>

            <v-spacer></v-spacer>

            <v-btn color="primary" @click.native="delete_logs()">
               <v-icon left small>fa-trash-alt</v-icon>Delete logs
            </v-btn>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table :headers="headers" :items="table_values" :search="search" :custom-filter="customFilter" hide-actions must-sort class="no-scroll">

            <template slot="headers" slot-scope="props">
               <tr>
                  <th v-for="header in props.headers" :key="header.text" @click="time_format_change" :style="'width:'+ header.width">
                     {{ header.text }}
                  </th>
               </tr>
            </template>

            <template slot="items" slot-scope="props">
               <tr @click="$refs.logrowdetails.show(props.item)">
                  <td class="text-xs-center">
                     <div class="ellipsis">{{ props.item.level }}</div>
                  </td>
                  <td class="text-xs-center">
                     <div class="ellipsis" :title="props.item.uuid_source">{{ props.item.source }}</div>
                  </td>
                  <td class="text-xs-center">
                     <div class="ellipsis" :title="time_format_rel ? props.item.date_abs : props.item.date_rel">{{ time_format_rel ? props.item.date_rel : props.item.date_abs }}</div>
                  </td>
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.entry">{{ props.item.entry }}</div>
                  </td>
               </tr>
            </template>

         </v-data-table>

         <v-divider></v-divider>

         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span class="body-2 mx-4 grey--text"> Log records: {{table_values.length}} </span>
         </v-card-title>
      </v-card>

      <snackbar ref="snackbar_error"></snackbar>
      <snackbar ref="snackbar_msg"></snackbar>
      <logrowdetails ref="logrowdetails"></logrowdetails>

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

import logrowdetails from "./components/logrowdetails.vue";
Vue.component("logrowdetails", logrowdetails);

export default {
  data: () => ({
    search: "",
    time_format_rel: true,
    headers: [
      {
        text: "Level",
        value: "level",
        align: "center",
        sortable: false,
        width: "10%"
      },
      {
        text: "Source",
        value: "source",
        align: "center",
        sortable: false,
        width: "20%"
      },
      {
        text: "Date",
        value: "date",
        align: "center",
        sortable: false,
        width: "18%"
      },
      {
        text: "Entry",
        value: "entry",
        align: "left",
        sortable: false
      }
    ],
    table_values: [],
    update_time: 1000
  }),
  timers: {
    table_update: {
      autostart: true,
      time: 1000
    }
  },

  mounted: function() {
    this.table_update();
  },

  beforeRouteLeave(to, from, next) {
    this.$timer.stop("table_update");
    next();
  },

  methods: {
    delete_logs() {
      Vue.axios
        .get(this.$store.getters.full_server_http_url + "/logger", {
          params: {
            action: "delete_logs"
          }
        })
        .then(response => {
          this.$refs.snackbar_msg.update("Logs deleted", "success", 2000);
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar_error.update("Delete logs: network error");
        });

      this.table_update();
    },

    table_update() {
      Vue.axios
        .get(this.$store.getters.full_server_http_url + "/logger", {
          params: {
            action: "get_logs",
            limit: 100
          }
        })
        .then(response => {
          this.table_values = response.data;
          this.timers.table_update.time = this.update_time;
          this.$timer.stop("table_update");
          this.$timer.start("table_update");
          this.$refs.snackbar_error.update("");
        })
        .catch(error => {
          this.timers.table_update.time = this.update_time;
          this.$timer.stop("table_update");
          this.$timer.start("table_update");
          console.log(error);
          this.$refs.snackbar_error.update("Table update: network error");
        });
    },

    time_format_change() {
      if (this.time_format_rel) {
        this.time_format_rel = false;
        this.$refs.snackbar_msg.update(
          "Set time format to absolute",
          "success",
          3000
        );
      } else {
        this.time_format_rel = true;
        this.$refs.snackbar_msg.update(
          "Set time format to relative",
          "success",
          3000
        );
      }
    },

    customFilter(items, search, filter) {
      if (search.length === 0) {
        return items;
      }
      return items.filter(item => item.level === search);
    }
  }
};
</script>

<style>
</style>


<style scoped>
</style>

