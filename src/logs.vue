<template>
<div>
   <v-card>
      <v-card-title class="py-1 px-1">
         <v-btn :loading="button_delete_logs.loading" :disabled="button_delete_logs.disabled" :color="button_delete_logs.color" @click.native="delete_logs()" >
            <v-icon left small>fa-edit</v-icon>Delete logs
         </v-btn>

         <v-btn-toggle v-model="time_pormat_selector" >
            <v-btn flat @click="time_format = false">Absolute time</v-btn>
            <v-btn flat @click="time_format = true">Relatively time</v-btn>
         </v-btn-toggle>

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

      <v-data-table :headers="headers" :search="search" :items="table_values" :loading="loading_status" hide-actions must-sort class="elevation-1" >

      <v-progress-linear slot="progress" :color="loading_color" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="props">
         <td class="text-xs-center table-sm">{{ props.item.key }}</td>
         <td class="text-xs-center table-sm">{{ props.item.level }}</td>
         <td class="text-xs-center table-sm">{{ props.item.source }}</td>
         <td class="text-xs-center table-sm">{{ time_format ? props.item.date_ago : props.item.date_abs }}</td>
         <td class="text-xs-left table-sm">{{ props.item.entry }}</td>
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
    time_format: true,
    button_delete_logs: {
      disabled: false,
      loading: false,
      color: "secondary"
    },
    headers: [
      {
        text: "Key",
        value: "key",
        align: "center",
        sortable: false,
        width: "1%"
      },
      {
        text: "Level",
        value: "level",
        align: "center",
        sortable: false,
        width: "4%"
      },
      {
        text: "Source",
        value: "source",
        align: "center",
        sortable: false,
        width: "19%"
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
        width: "57%"
      },
      {
        text: "Trace",
        align: "center",
        sortable: false,
        width: "2%"
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
          let old_color = this[l].color;
          setTimeout(() => (this[l].loading = false), 800);
          setTimeout(() => (this[l].disabled = false), 800);
          this[l].color = "success";
          setTimeout(() => (this[l].color = old_color), 1500);
          this.snackbar = false;
        })
        .catch(error => {
          let old_color = this[l].color;
          setTimeout(() => (this[l].loading = false), 800);
          setTimeout(() => (this[l].disabled = false), 800);
          this[l].color = "error";
          setTimeout(() => (this[l].color = old_color), 2000);
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
        .get("http://localhost:8080/system_logger_data_v2", {
          params: {
            item: "ALL",
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
    }
  }
};
</script>


<style scoped>
.table-sm {
  height: 25px;
}

.button-sm {
  margin: -11px!important;
}
</style>
