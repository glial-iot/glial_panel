<template>
   <div>
      <v-card class="elevation-3">
         <v-card-title class="py-1 px-1">
            <div class="pl-2">
               <v-btn-toggle v-model="update_interval">
                  <v-btn flat value="500">0.5s</v-btn>
                  <v-btn flat value="1000">1s</v-btn>
                  <v-btn flat value="2000">2s</v-btn>
                  <v-btn flat value="5000">5s</v-btn>
                  <v-btn flat value="0">None</v-btn>
               </v-btn-toggle>
            </div>

            <v-spacer></v-spacer>

            <div>
               <v-btn value="selected" @click="tsdb_set(all_tsdb)">
                  <v-icon color="green" left>fa-download</v-icon> All TSDB
               </v-btn>
               <v-btn value="selected" @click="tsdb_set(none_tsdb)">
                  <v-icon color="grey" left>fa-download</v-icon> None TSDB
               </v-btn>
            </div>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table :headers="headers" :items="bus_values" hide-actions class="no-scroll bus-table">

            <template slot="items" slot-scope="props">
               <tr :class="props.item.new_attr ? 'row-new' : ''">
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.topic">{{ props.item.topic }}</div>
                  </td>
                  <td class="text-xs-right">
                     <div class="ellipsis" :title="props.item.value">{{ props.item.value }}</div>
                  </td>
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.type">{{ props.item.type }}</div>
                  </td>
                  <td class="text-xs-center">
                     <div class="ellipsis" :title="props.item.tags">{{ props.item.tags }}</div>
                  </td>
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.text_time">{{ props.item.text_time }}</div>
                  </td>
                  <td class="justify-center text-xs-center cell-flex">
                     <button-info @click.native="$refs.edit_bus.show(props.item)"></button-info>
                     <button-trash @click.native="topic_delete(props.item)"></button-trash>
                     <button-download v-show="props.item.tsdb" @click.native="tsdb_set(props.item)"></button-download>
                     <button-download-disabled v-show="!props.item.tsdb" @click.native="tsdb_set(props.item)"></button-download-disabled>
                  </td>
               </tr>
            </template>
         </v-data-table>
         <v-divider></v-divider>

         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span class="body-2 mx-4 grey--text"> Bus records: {{bus_values.length}} </span>
         </v-card-title>
      </v-card>
      <snackbar ref="snackbar"></snackbar>
      <edit-bus-modal ref="edit_bus"></edit-bus-modal>
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
import editBusModal from "./components/modals/edit-bus-modal.vue";
import buttonTrash from "./components/buttons/button-trash.vue";
import buttonDownload from "./components/buttons/button-download.vue";
import buttonDownloadDisabled from "./components/buttons/button-download-disabled.vue";
import buttonInfo from "./components/buttons/button-info.vue";

export default {
  components: {
    snackbar,
    buttonTrash,
    buttonDownload,
    buttonDownloadDisabled,
    buttonInfo,
    editBusModal
  },
  data: () => ({
    update_interval: "2000",
    bus_values: [],
    all_tsdb: { topic: "*", tsdb: false },
    none_tsdb: { topic: "*", tsdb: true },
    headers: [
      {
        text: "Topic",
        value: "topic",
        align: "left"
      },
      {
        text: "Value",
        value: "value",
        sortable: false,
        align: "right",
        width: "15%"
      },
      {
        text: "Type",
        value: "type",
        sortable: false,
        align: "left",
        width: "10%"
      },
      {
        text: "Tags",
        value: "value",
        sortable: false,
        align: "center",
        width: "10%"
      },
      {
        text: "Update time",
        value: "text_time",
        align: "center",
        width: "240px"
      },
      {
        text: "Actions",
        sortable: false,
        width: "100px"
      }
    ]
  }),

  beforeRouteLeave(to, from, next) {
    this.$timer.stop("table_update");
    next();
  },

  mounted: function() {},

  watch: {
    update_interval() {
      this.$timer.stop("table_update");

      if (+this.update_interval > 0) {
        this.timers.table_update.time = +this.update_interval;
        this.table_update();
      }
    }
  },

  timers: {
    table_update: {
      autostart: true,
      time: 0
    }
  },

  methods: {
    tsdb_set(item) {
      console.log(item);
      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus", {
          params: {
            action: "update_tsdb_attribute",
            topic: item.topic,
            value: !item.tsdb
          }
        })
        .then(response => {
          if (item.topic !== "*") item.tsdb = !item.tsdb;
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Set TSDB attribute: network error");
        });
    },
    topic_delete(item) {
      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus", {
          params: {
            action: "delete_topics",
            topic: item.topic
          }
        })
        .then(response => {
          Vue.delete(this.bus_values, this.bus_values.indexOf(item));
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Delete topic: network error");
        });
    },
    table_update() {
      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus", {
          params: {
            action: "get_bus"
          }
        })
        .then(response => {
          this.bus_values = this.set_update_attr(response.data);
          //console.log(this.bus_values);
          this.$timer.stop("table_update");
          if (+this.update_interval > 0) {
            this.timers.table_update.time = +this.update_interval;
            this.$timer.start("table_update");
          }
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$timer.stop("table_update");
          this.bus_values = [];
          if (+this.update_interval > 0) {
            this.timers.table_update.time = +this.update_interval;
            this.$timer.start("table_update");
          }
          this.$refs.snackbar.update("Update table: network error");
        });
    },
    set_update_attr: function(values) {
      for (let index = 0; index < values.length; index++) {
        let result = this.bus_values.find(
          table => table.topic === values[index].topic
        );

        if (result !== undefined) {
          if (result.value !== values[index].value)
            values[index].new_attr = true;
        }
      }
      return values;
    }
  }
};
</script>

<style scoped>
.row-new {
  background-color: rgb(155, 204, 255);
}

.row-new:hover {
  background-color: rgb(155, 204, 255);
}

.cell-flex {
  display: flex;
}

.bus-table table.v-table tbody td:not(:first-child), 
.bus-table table.v-table thead th:not(:first-child) {
   padding: 0 4px;
}
</style>

