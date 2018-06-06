<template>
<div>
   <v-card>
      <v-card-title class="py-1 px-1">
         <v-btn :loading="button_delete_logs.loading" :disabled="button_delete_logs.disabled" :color="button_delete_logs.color" @click.native="delete_logs()" >
            <v-icon left small>fa-edit</v-icon>Delete logs
         </v-btn>

         <v-spacer></v-spacer>

         <v-text-field
         v-model="search"
         append-icon="search"
         label="Filter"
         single-line
         hide-details
         class="pb-3 pr-2"
         ></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :search="search" :items="table_values" :loading="loading_status" hide-actions must-sort class="elevation-1 no-scroll" >

      <template slot="headers" slot-scope="props">
      <tr>
         <th v-for="header in props.headers" :key="header.text" @click="time_format_change" :style="'width:'+ header.width" >
            {{ header.text }}
         </th>
      </tr>
      </template>

      <v-progress-linear slot="progress" :color="loading_color" height="1" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="props">
         <td class="text-xs-center table-sm"><div class="ellipsis" :title="props.item.level">{{ props.item.level }}</div></td>
         <td class="text-xs-center table-sm"><div class="ellipsis" :title="props.item.source">{{ props.item.source }}</div></td>
         <td class="text-xs-center table-sm"><div class="ellipsis" :title="time_format_rel ? props.item.date_rel : props.item.date_abs">{{ time_format_rel ? props.item.date_rel : props.item.date_abs }}</div></td>
         <td class="text-xs-left table-sm"><div class="ellipsis" :title="props.item.entry">{{ props.item.entry }}</div></td>
         <td class="justify-center layout px-0 table-sm button-sm">
            <v-btn icon class="mx-0 " @click="show_trace(props.item)">
               <v-icon color="pink" small :trace="props.item.entry">fa-project-diagram</v-icon>
            </v-btn>
         </td>
      </template>

      </v-data-table>
   </v-card>

   <v-snackbar :timeout="10000" :top="true" :right="true" v-model="snackbar" :color="'error'" >
      {{ snackbartext }}
      <v-btn flat  @click.native="snackbar = false">Close</v-btn>
   </v-snackbar>

   <v-dialog v-model="dialog_detals_visible" max-width="500px">
      <v-card>
         <v-card-title>
            <div class="title text-xs-center">Details log entry #{{dialog_detals_props.log_key}}({{dialog_detals_props.log_source}})</div>
         </v-card-title>
         <v-divider></v-divider>
         <v-card-text>
         <div class="subheading">Date and time:</div>
            {{dialog_detals_props.log_date}}
         </v-card-text>
         <v-divider></v-divider>
         <v-card-text>
            <div class="subheading">Log entry:</div>
            {{dialog_detals_props.log_entry}}
         </v-card-text>
         <v-divider></v-divider>
         <v-card-text>
            <div class="subheading">Trace:</div>
            {{dialog_detals_props.log_trace}}
         </v-card-text>
         <v-divider></v-divider>
         <v-card-actions>
            <v-btn color="primary" flat @click.stop="dialog_detals_visible=false">Close</v-btn>
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

export default {
  data: () => ({
    snackbar: false,
    snackbartext: "",
    search: "",
    dialog_detals_visible: false,
    dialog_detals_props: {
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
        width: "20%"
      },
      {
        text: "Entry",
        value: "entry",
        align: "left",
        sortable: false,
        width: "40%"
      },
      {
        text: "Details",
        align: "center",
        sortable: false,
        width: "10%"
      }
    ],
    table_values: [],
    loading_status: false,
    update_time: 1000,
    loading_color: "blue"
  }),

  timers: {
    table_update: {
      autostart: true,
      time: this.update_time
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
          this.snackbar = false;
        })
        .catch(error => {
          let old_color = this.button_delete_logs.color;
          setTimeout(() => (this.button_delete_logs.loading = false), 800);
          setTimeout(() => (this.button_delete_logs.disabled = false), 800);
          this.button_delete_logs.color = "error";
          setTimeout(() => (this.button_delete_logs.color = old_color), 2000);
          console.log(error);
          this.snackbar = false;
          this.snackbartext = "Delete logs: network error";
          this.snackbar = true;
        });

      this.table_update();
    },

    table_update() {
      this.loading_status = true;
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
          this.snackbar = false;
        })
        .catch(error => {
          this.loading_color = "red";
          this.timers.table_update.time = this.update_time;
          this.$timer.start("table_update");
          console.log(error);
          this.snackbar = false;
          this.snackbartext = "Table update: network error";
          this.snackbar = true;
        });
    },

    time_format_change() {
      if (this.time_format_rel) {
        this.time_format_rel = false;
      } else {
        this.time_format_rel = true;
      }
    },

    show_trace(item) {
      this.dialog_detals_props.log_trace = item.trace;
      this.dialog_detals_props.log_entry = item.entry;
      this.dialog_detals_props.log_key = item.key;
      this.dialog_detals_props.log_date = item.date_abs + ", " + item.date_rel;
      this.dialog_detals_props.log_source = item.source;
      this.dialog_detals_visible = true;
    }
  }
};
</script>


<style scoped>
.table-sm {
  height: 25px;
}

.button-sm {
  margin: -11px !important;
}
</style>

<style>
.no-scroll table {
  table-layout: fixed;
}
</style>
