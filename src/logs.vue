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

            <v-btn :loading="button_delete_logs.loading" :disabled="button_delete_logs.disabled" :color="button_delete_logs.color" @click.native="delete_logs()">
               <v-icon left small>fa-trash-alt</v-icon>Delete logs
            </v-btn>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table :headers="headers" :search="search" :items="table_values" hide-actions must-sort class="no-scroll">

            <template slot="headers" slot-scope="props">
               <tr>
                  <th v-for="header in props.headers" :key="header.text" @click="time_format_change" :style="'width:'+ header.width">
                     {{ header.text }}
                  </th>
               </tr>
            </template>

            <template slot="items" slot-scope="props">
               <tr @click="show_details(props.item)">
                  <td class="text-xs-center table-sm">
                     <div class="ellipsis">{{ props.item.level }}</div>
                  </td>
                  <td class="text-xs-center table-sm">
                     <div class="ellipsis">{{ props.item.source }}</div>
                  </td>
                  <td class="text-xs-center table-sm">
                     <div class="ellipsis" :title="time_format_rel ? props.item.date_abs : props.item.date_rel">{{ time_format_rel ? props.item.date_rel : props.item.date_abs }}</div>
                  </td>
                  <td class="text-xs-left table-sm">
                     <div class="ellipsis" :title="props.item.entry">{{ props.item.entry }}</div>
                  </td>
               </tr>
            </template>

         </v-data-table>
      </v-card>

      <snackbar ref="snackbar"></snackbar>

      <v-dialog v-model="dialog_details_visible" max-width="500px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Details log entry #{{dialog_details_props.log_key}}({{dialog_details_props.log_source}})</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Date and time:</div>
               {{dialog_details_props.log_date}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Log entry:</div>
               {{dialog_details_props.log_entry}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Trace:</div>
               {{dialog_details_props.log_trace}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="primary" flat @click.stop="dialog_details_visible=false">Close</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

   </div>
</template>

<script>
import Vue from "vue";
import VueTimers from "vue-timers";
Vue.use(VueTimers);
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import snackbar from "./snackbar.vue";
Vue.component("snackbar", snackbar);

export default {
  data: () => ({
    search: "",
    dialog_details_visible: false,
    dialog_details_props: {
      log_entry: "",
      log_trace: "",
      visible: false
    },
    time_format_rel: true,
    button_delete_logs: {
      disabled: false,
      loading: false,
      color: "secondary"
    },
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
    update_time: 1000,
    loading_color: "blue"
  }),

  timers: {
    table_update: {
      autostart: true,
      time: 1000
    }
  },

  methods: {
    delete_logs() {
      Vue.axios
        .get("http://localhost:8080/system_logger_action", {
          params: {
            action: "delete_logs"
          }
        })
        .then(response => {
          let old_color = this.button_delete_logs.color;
          setTimeout(() => (this.button_delete_logs.loading = false), 800);
          setTimeout(() => (this.button_delete_logs.disabled = false), 800);
          this.button_delete_logs.color = "success";
          setTimeout(() => (this.button_delete_logs.color = old_color), 1500);
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          let old_color = this.button_delete_logs.color;
          setTimeout(() => (this.button_delete_logs.loading = false), 800);
          setTimeout(() => (this.button_delete_logs.disabled = false), 800);
          this.button_delete_logs.color = "error";
          setTimeout(() => (this.button_delete_logs.color = old_color), 2000);
          console.log(error);
          this.$refs.snackbar.update("Delete logs: network error");
        });

      this.table_update();
    },

    table_update() {
      Vue.axios
        .get("http://localhost:8080/system_logger_action", {
          params: {
            action: "get_logs",
            limit: 100
          }
        })
        .then(response => {
          this.table_values = response.data;
          this.timers.table_update.time = this.update_time;
          this.loading_color = "blue";
          this.$timer.start("table_update");
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          this.loading_color = "red";
          this.timers.table_update.time = this.update_time;
          this.$timer.start("table_update");
          console.log(error);
          this.$refs.snackbar.update("Table update: network error");
        });
    },

    time_format_change() {
      if (this.time_format_rel) {
        this.time_format_rel = false;
      } else {
        this.time_format_rel = true;
      }
    },

    show_details(item) {
      this.dialog_details_props.log_trace = item.trace;
      this.dialog_details_props.log_entry = item.entry;
      this.dialog_details_props.log_key = item.key;
      this.dialog_details_props.log_date = item.date_abs + ", " + item.date_rel;
      this.dialog_details_props.log_source = item.source;
      this.dialog_details_visible = true;
    }
  }
};
</script>

<style>
</style>


<style scoped>
</style>

