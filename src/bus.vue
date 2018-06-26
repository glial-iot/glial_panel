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
               <v-btn value="selected" @click="topic_delete(all_tsdb)">
                  <v-icon color="pink" left>fa-trash-alt</v-icon> Delete all from Bus
               </v-btn>
               <v-btn value="selected" @click="tsdb_set(all_tsdb)">
                  <v-icon color="green" left>fa-download</v-icon> All TSDB
               </v-btn>
               <v-btn value="selected" @click="tsdb_set(none_tsdb)">
                  <v-icon color="grey" left>fa-download</v-icon> None TSDB
               </v-btn>
            </div>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table :headers="headers" :items="bus_values" :loading="progressbar_visible" hide-actions class="no-scroll">
            <v-progress-linear slot="progress" color="primary" height="1"></v-progress-linear>

            <template slot="items" slot-scope="props">
               <tr :class="props.item.new_attr ? 'row-new' : ''">
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.topic">{{ props.item.topic }}</div>
                  </td>
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.value">{{ props.item.value }}</div>
                  </td>
                  <td class="text-xs-left">
                     <div class="ellipsis" :title="props.item.timestamp">{{ props.item.timestamp }}</div>
                  </td>
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
         <v-divider></v-divider>

         <v-card-title class="py-0 px-0 small_title">
            <v-spacer></v-spacer>
            <span class="body-2 mx-4 grey--text"> Bus records: {{bus_values.length}} </span>
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
import snackbar from "./components/snackbar.vue";
Vue.component("snackbar", snackbar);

export default {
  data: () => ({
    update_interval: "2000",
    progressbar_visible: true,
    bus_values: [],
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
      var endpoint_url = 'http://' + this.$store.state.server_url+'/system_bus_action';
      this.progressbar_visible = true;
      Vue.axios
        .get(endpoint_url, {
          params: {
            action: "update_tsdb_attribute",
            topic: item.topic,
            value: !item.tsdb_save
          }
        })
        .then(response => {
          if (item.topic !== "*") item.tsdb_save = !item.tsdb_save;
          this.progressbar_visible = false;
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.progressbar_visible = false;
          this.$refs.snackbar.update("Set TSDB attribute: network error");
        });
    },
    topic_delete(item) {
      var endpoint_url = 'http://' + this.$store.state.server_url+'/system_bus_action';
      this.progressbar_visible = true;

      Vue.axios
        .get(endpoint_url, {
          params: {
            action: "delete_topics",
            topic: item.topic
          }
        })
        .then(response => {
          Vue.delete(this.bus_values, this.bus_values.indexOf(item));
          this.progressbar_visible = false;
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.progressbar_visible = false;
          this.$refs.snackbar.update("Delete topic: network error");
        });
    },
    table_update() {
      var endpoint_url = 'http://' + this.$store.state.server_url+'/system_bus_data';
      this.progressbar_visible = true;
      Vue.axios
        .get(endpoint_url)
        .then(response => {
          this.bus_values = this.set_update_attr(response.data);
          //console.log(this.bus_values)
          this.$timer.stop("table_update");
          if (+this.update_interval > 0) {
            this.timers.table_update.time = +this.update_interval;
            this.$timer.start("table_update");
          }
          this.progressbar_visible = false;
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$timer.stop("table_update");

          if (+this.update_interval > 0) {
            this.timers.table_update.time = +this.update_interval;
            this.$timer.start("table_update");
          }
          this.progressbar_visible = false;
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

<style>
</style>

<style scoped>
.row-new {
  background-color: rgb(155, 204, 255);
}

.row-new:hover {
  background-color: rgb(155, 204, 255);
}
</style>

