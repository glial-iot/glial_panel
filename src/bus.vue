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

         <v-data-table :headers="headers" :items="bus_values" hide-actions class="no-scroll">

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
                     <button type="button" class="mx-0 v-btn v-btn--icon" @click="topic_delete(props.item)">
                       <div class="v-btn__content">
                         <svg aria-hidden="true" class="svg-inline--fa fa-trash-alt fa-w-14 v-icon pink--text" style="font-size: 16px;" data-prefix="fa" data-icon="trash-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
                          <path fill="currentColor" d="M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm416 56v324c0 26.5-21.5 48-48 48H80c-26.5 0-48-21.5-48-48V140c0-6.6 5.4-12 12-12h360c6.6 0 12 5.4 12 12zm-272 68c0-8.8-7.2-16-16-16s-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208z"></path>
                         </svg>
                       </div>
                     </button>
                     <button type="button" class="ml-0 mr-2 v-btn v-btn--icon" v-show="props.item.tsdb_save" @click="tsdb_set(props.item)">
                       <div class="v-btn__content">
                         <svg aria-hidden="true" class="svg-inline--fa fa-download fa-w-16 v-icon green--text" style="font-size: 16px;" data-prefix="fa" data-icon="download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                           <path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                         </svg>
                       </div>
                     </button>
                     <button type="button" class="ml-0 mr-2 v-btn v-btn--icon" v-show="!props.item.tsdb_save" @click="tsdb_set(props.item)">
                       <div class="v-btn__content">
                         <svg aria-hidden="true" class="svg-inline--fa fa-download fa-w-16 v-icon grey--text" style="font-size: 16px;" data-prefix="fa" data-icon="download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                           <path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                         </svg>
                       </div>
                     </button>
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
      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus_action", {
          params: {
            action: "update_tsdb_attribute",
            topic: item.topic,
            value: !item.tsdb_save
          }
        })
        .then(response => {
          if (item.topic !== "*") item.tsdb_save = !item.tsdb_save;
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Set TSDB attribute: network error");
        });
    },
    topic_delete(item) {
      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus_action", {
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
        .get(this.$store.getters.server_url + "/system_bus_data")
        .then(response => {
          this.bus_values = this.set_update_attr(response.data);
          //console.log(this.bus_values)
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

