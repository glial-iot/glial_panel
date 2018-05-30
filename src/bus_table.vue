<template>
  <div>
      <v-data-table :headers="headers" :items="bus_values" :loading="loading_status" hide-actions class="elevation-1" >

         <v-progress-linear slot="progress" :color="loading_color" indeterminate></v-progress-linear>
         <template slot="items" slot-scope="props">
            <td class="text-xs-left ">{{ props.item.topic }}</td>
            <td class="text-xs-left ">{{ props.item.value }}</td>
            <td class="text-xs-left ">{{ props.item.timestamp }}</td>
            <td class="justify-center layout px-0">
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
         </template>

      </v-data-table>

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
    ],
    bus_values: [],
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
          item.tsdb_save = !item.tsdb_save;
          this.loading_color = "blue";
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";
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
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";
        });
    },

    table_update() {
      this.loading_status = true;
      Vue.axios
        .get("http://localhost:8080/system_bus_data")
        .then(response => {
          this.bus_values = response.data;
          //this.loading_status = false;
          this.timers.table_update.time = this.update_time;
          this.loading_color = "blue";
          this.$timer.start("table_update");
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";

          this.timers.table_update.time = this.update_time;
          this.$timer.start("table_update");
        });
    }
  }
};
</script>
