<template>
  <div>
    <v-card class="elevation-3">
      <v-card-title class="py-1 px-1">

        <div class="pl-2">
          <v-btn-toggle mandatory v-model="search">
            <v-btn flat value="ALL" title="All logs">ALL</v-btn>
            <v-btn flat value="INFO" title="Only logs with 'info' level">INFO</v-btn>
            <v-btn flat value="WARNING" title="Only logs with 'warning' level">WARNING</v-btn>
            <v-btn flat value="ERROR" title="Only logs with 'error' level">ERROR</v-btn>
            <v-btn flat value="USER" title="Only logs with 'user' level">USER</v-btn>
            <v-btn flat value="!USER" style="text-decoration: overline"
                   title="All logs, except entries with the level 'user'">USER
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-spacer></v-spacer>

        <v-btn color="error" flat @click.native="delete_logs()">
          <v-icon left small>fa-trash-alt</v-icon>
          Delete logs
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table v-if="loaded" :headers="headers" :items="table_values" hide-actions must-sort class="no-scroll"
                    no-data-text="No log entries">

        <template slot="headers" slot-scope="props">
          <tr>
            <th v-for="header in props.headers" :key="header.text" @click="time_format_change"
                :style="'width:'+ header.width">
              {{ header.text }}
            </th>
          </tr>
        </template>

        <template slot="items" slot-scope="props">
          <tr>
            <td class="text-xs-center">
              <div class="ellipsis">{{ props.item.level }}</div>
            </td>
            <td class="text-xs-center">
              <div class="ellipsis" :title="props.item.uuid_source">{{ props.item.source }}</div>
            </td>
            <td class="text-xs-center">
              <div class="ellipsis"
                   :title="time_format_rel ? $options.filters.moment(props.item.time_ms, 'YYYY-MM-DD, HH:MM:SS') : $options.filters.toRelativeTime(props.item.time_ms)">
                {{ time_format_rel ? $options.filters.toRelativeTime(props.item.time_ms) : props.item.time_ms |
                moment("YYYY-MM-DD, HH:MM:SS") }}
              </div>
            </td>
            <td class="text-xs-left">
              <div class="ellipsis" :title="props.item.entry">{{ props.item.entry }}</div>
            </td>
            <td class="justify-center text-xs-center cell-flex">
              <button-info :item="props" @click.native="$refs.logdetailsmodal.show(props.item)"></button-info>
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
    <logdetailsmodal ref="logdetailsmodal"></logdetailsmodal>
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
  import logdetailsmodal from "./components/modals/show-log-details-modal.vue";
  import buttonInfo from "./components/buttons/button-info.vue";

  export default {
    components: {
      snackbar,
      logdetailsmodal,
      buttonInfo
    },
    data: () => ({
      search: "!USER",
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
        },
        {
          text: "Info",
          value: "info",
          align: "center",
          sortable: false,
          width: "100px"
        }
      ],
      table_values: [],
      loaded: false,
      update_time: 1000
    }),
    timers: {
      table_update: {
        autostart: true,
        repeat: true,
        time: 1000
      }
    },

    mounted: function () {
      this.table_update();
    },

    beforeRouteLeave(to, from, next) {
      this.$timer.stop("table_update");
      next();
    },

    methods: {
      delete_logs() {
        Vue.axios
          .get(this.$store.getters.server_url + "/logger", {
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
          .get(this.$store.getters.server_url + "/logger", {
            params: {
              action: "get_logs",
              limit: 100,
              level: this.search
            }
          })
          .then(response => {
            this.table_values = response.data;
            this.loaded = true;
            this.$refs.snackbar_error.update("");
          })
          .catch(error => {
            this.table_values = [];
            this.loaded = false;
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
      }
    }
  };
</script>
