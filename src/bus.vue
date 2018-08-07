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
            <div class="pr-2">
               <v-btn-toggle v-model="bus_type">
                  <v-btn flat :value="BUS_TYPE_TREE">Tree View</v-btn>
                  <v-btn flat :value="BUS_TYPE_LINEAR">Linear View</v-btn>
               </v-btn-toggle>
            </div>
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
         <v-data-table v-if="bus_type === BUS_TYPE_LINEAR" :headers="headers" :items="bus_values" hide-actions class="no-scroll">
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
                     <button-trash @click.native="topic_delete(props.item)"></button-trash>
                     <button-download v-show="props.item.tsdb" @click.native="tsdb_set(props.item)"></button-download>
                     <button-download-disabled v-show="!props.item.tsdb" @click.native="tsdb_set(props.item)"></button-download-disabled>
                  </td>
               </tr>
            </template>
         </v-data-table>
         <treeviewer v-if="bus_type === BUS_TYPE_TREE" :json="bus_values" :topicDelete="topic_delete"></treeviewer>
         <v-divider></v-divider>
         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span v-if="bus_type === BUS_TYPE_LINEAR" class="body-2 mx-4 grey--text"> Bus records: {{bus_values.length}} </span>
         </v-card-title>
      </v-card>
      <snackbar ref="snackbar"></snackbar>
   </div>
</template>

<script>
import Vue from "vue";
import VueTimers from "vue-timers";
Vue.use(VueTimers);

import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import { BUS_TYPE_LINEAR, BUS_TYPE_TREE } from "./utils/constants.js";

import snackbar from "./components/snackbar.vue";
import buttonTrash from "./components/buttons/button-trash.vue";
import buttonDownload from "./components/buttons/button-download.vue";
import buttonDownloadDisabled from "./components/buttons/button-download-disabled.vue";
import treeviewer from "./components/treeviewer.vue";

export default {
  components: {
    snackbar,
    buttonTrash,
    buttonDownload,
    buttonDownloadDisabled,
    treeviewer
  },
  data: () => ({
    BUS_TYPE_LINEAR,
    BUS_TYPE_TREE,
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
        width: "5%"
      },
      {
        text: "Update time",
        value: "text_time",
        align: "center",
        width: "28%"
      },
      {
        text: "Actions",
        sortable: false,
        width: "10%"
      }
    ]
  }),

  computed: {
    bus_type: {
      get() { 
        return this.$store.state.bus_type; 
      },
      set(value) { 
        this.$store.commit('bus_type', value); 
      },
    },
  },

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
    },
    bus_type() {
      this.bus_values = []
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
      let action = "get_bus"

      if (this.bus_type === BUS_TYPE_TREE) {
        action = "get_bus_serialized"
      }

      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus", {
          params: {action}
        })
        .then(response => {
          if (this.bus_type === BUS_TYPE_TREE) {
            this.bus_values = response.data
          } else {
            this.bus_values = this.set_update_attr(response.data);
          }
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
    },
  }
};
</script>

<style>
</style>

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
</style>

