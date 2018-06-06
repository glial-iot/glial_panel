<template>
<div>
   <v-card>
      <v-card-title class="py-1 px-1">
         <div class="pl-2">
            <v-btn-toggle v-model="update_interval" >
               <v-btn flat @click="new_update_interval(500)">0.5s </v-btn>
               <v-btn flat value="1s" @click="new_update_interval(1000)">1s</v-btn>
               <v-btn flat @click="new_update_interval(5000)">5s</v-btn>
               <v-btn flat @click="new_update_interval('none')">None</v-btn>
            </v-btn-toggle>
         </div>
         <v-spacer></v-spacer>

         <div class="">
            <v-btn class="" value="selected" @click="topic_delete(all_tsdb)">
               <v-icon color="pink" left>fa-trash-alt</v-icon> Delete all from Bus
            </v-btn>
            <v-btn class="" value="selected" @click="tsdb_set(all_tsdb)">
               <v-icon color="green" left>fa-download</v-icon> All TSDB
            </v-btn>
            <v-btn class="" value="selected" @click="tsdb_set(none_tsdb)">
               <v-icon color="grey" left>fa-download</v-icon> None TSDB
            </v-btn>
         </div>
      </v-card-title>


      <v-data-table :headers="headers" :items="bus_values" :loading="loading_status" hide-actions class="elevation-1 no-scroll" >
         <v-progress-linear slot="progress" :color="loading_color" indeterminate></v-progress-linear>
         <template slot="items" slot-scope="props" >
            <tr :class="props.item.new_attr ? 'row-new' : ''" >
               <td class="text-xs-left"><div class="ellipsis" :title="props.item.topic">{{ props.item.topic }}</div></td>
               <td class="text-xs-left"><div class="ellipsis" :title="props.item.value">{{ props.item.value }}</div></td>
               <td class="text-xs-left"><div class="ellipsis" :title="props.item.timestamp">{{ props.item.timestamp }}</div></td>
               <td class="justify-center layout px-0 button-sm">
                  <v-btn icon class="mx-0 " @click="topic_delete(props.item)">
                     <v-icon color="pink" small>fa-trash-alt</v-icon>
                  </v-btn>
                  <v-btn v-show="props.item.tsdb_save" icon class="ml-0 mr-2 " @click="tsdb_set(props.item)">
                     <v-icon color="green" small>fa-download</v-icon>
                  </v-btn>
                  <v-btn v-show="!props.item.tsdb_save" icon class="ml-0 mr-2 " @click="tsdb_set(props.item)">
                     <v-icon color="grey" small>fa-download</v-icon>
                  </v-btn>
               </td>
            </tr>
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
    update_interval: "1s",
    group_action: "selected",
    snackbar: false,
    snackbartext: "",
    bus_values: [],
    loading_status: true,
    update_time: 1000,
    loading_color: "blue",
    all_tsdb: { topic: "*", tsdb_save: false },
    none_tsdb: { topic: "*", tsdb_save: true },
    headers: [
      {
        text: "Topic",
        value: "topic",
        align: "left",
        width: "50%"
      },
      {
        text: "Value",
        value: "value",
        sortable: false,
        width: "10%"
      },
      {
        text: "Update time",
        value: "timestamp",
        align: "center",
        width: "30%"
      },
      {
        text: "Actions",
        sortable: false,
        width: "10%"
      }
    ]
  }),

  timers: {
    table_update: {
      autostart: true,
      time: this.update_time
    }
  },

  methods: {
    tsdb_set(item) {
      Vue.axios
        .get("http://localhost:8080/system_bus_action", {
          params: {
            action: "update_tsdb_attribute",
            topic: item.topic,
            value: !item.tsdb_save
          }
        })
        .then(response => {
          if (item.topic !== "*") item.tsdb_save = !item.tsdb_save;
          this.loading_color = "blue";
          console.log(response);
          this.snackbar = false;
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";
          this.snackbar = false;
          this.snackbartext = "Set TSDB attribute: network error";
          this.snackbar = true;
        });
    },
    topic_delete(item) {
      Vue.axios
        .get("http://localhost:8080/system_bus_action", {
          params: {
            action: "delete_topics",
            topic: item.topic
          }
        })
        .then(response => {
          Vue.delete(this.bus_values, this.bus_values.indexOf(item));
          this.loading_color = "blue";
          console.log(response);
          this.snackbar = false;
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";
          this.snackbar = false;
          this.snackbartext = "Delete topic: network error";
          this.snackbar = true;
        });
    },
    new_update_interval: function(new_interval) {
      this.update_time = new_interval;
      this.timers.table_update.time = this.update_time;
      this.$timer.stop("table_update");
      //this.table_update();
    },
    set_update_attr: function(values) {
      for (let index = 0; index < values.length; index++) {
        let result = this.bus_values.find(
          table => table.topic === values[index].topic
        );

        if (result !== undefined) {
          //console.log(result.topic, result.value, values[index].topic, values[index].value)
          if (result.value !== values[index].value) {
            values[index].new_attr = true;
            //console.log(result.value, values[index].value, values[index]);
          }
        }
      }
      return values;
    },
    table_update() {
      Vue.axios
        .get("http://localhost:8080/system_bus_data")
        .then(response => {
          this.bus_values = this.set_update_attr(response.data);
          //console.log(this.bus_values)
          this.loading_color = "blue";
          if (this.update_time !== "none") {
            this.timers.table_update.time = this.update_time;
            this.$timer.stop("table_update");
            this.$timer.start("table_update");
            this.loading_status = true;
          } else {
            this.loading_status = false;
          }
          this.snackbar = false;
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";
          if (this.update_time !== "none") {
            this.timers.table_update.time = this.update_time;
            this.$timer.stop("table_update");
            this.$timer.start("table_update");
            this.loading_status = true;
          } else {
            this.loading_status = false;
          }
          this.snackbar = false;
          this.snackbartext = "Update table: network error";
          this.snackbar = true;
        });
    }
  }
};
</script>

<style>
table.table tbody td,
table.table tbody th {
  height: 25px !important;
}

.no-scroll table {
  table-layout: fixed;
}
</style>

<style scoped>
.row-new {
  background-color: rgb(155, 204, 255);
}

.row-new:hover {
  background-color: rgb(155, 204, 255);
}

.button-sm {
  margin: -11px !important;
}
</style>

