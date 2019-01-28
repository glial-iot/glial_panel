<template>
  <v-card id="logs-card" class="logs-card">
    <v-card-text v-bind:class="{ 'logs-text': is_editor, 'logs-text-modal': !is_editor }" v-if="visible">

      <div v-if="!is_editor" class="subheading">Logs:</div>

      <v-data-table v-if="logs.length > 0" :headers="headers" :items="logs" hide-actions must-sort class="no-scroll"
                    :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
          <tr>
            <td class="justify-center text-xs-center cell-flex">
              <button-info :item="props" @click.native="$refs.logdetailsmodal.show(props.item)"></button-info>
            </td>
            <td class="text-xs-left">
              <div class="ellipsis">{{ props.item.level }}</div>
            </td>
            <td class="text-xs-left">
              <div class="ellipsis" :title="$options.filters.moment(props.item.time_ms, 'YYYY-MM-DD, HH:MM:SS')">
                {{$options.filters.toRelativeTime(props.item.time_ms)}}
              </div>
            </td>
            <td class="text-xs-left">
              <div class="ellipsis mw-100" :title="props.item.entry">{{ props.item.entry }}</div>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-flex v-show="pagination.totalItems > pagination.rowsPerPage">
        <v-pagination class="custom-pagination custom-pagination-hide-inactive" v-model="pagination.page"
                      :length="pages_count"></v-pagination>
      </v-flex>
    </v-card-text>
    <logdetailsmodal ref="logdetailsmodal"></logdetailsmodal>
  </v-card>
</template>

<script>
  import Vue from "vue";
  import Axios from "axios";
  import VueAxios from "vue-axios";

  Vue.use(VueAxios, Axios);

  import {mapState} from "vuex";

  import buttonInfo from "./buttons/button-info.vue";
  import logdetailsmodal from "./modals/show-log-details-modal.vue";

  export default {
    components: {
      buttonInfo,
      logdetailsmodal
    },
    data: () => ({
      logs: [],
      default_pagination: {rowsPerPage: 6},
      pagination: {},
    }),
    props: ["uuid", "type"],
    timers: {
      get_logs: {
        autostart: false,
        time: 1000,
        immediate: true,
        repeat: true
      }
    },
    mounted: function () {
      this.pagination.rowsPerPage = this.is_editor ? this.editor_log_size : this.default_pagination.rowsPerPage;
    },
    computed: mapState({
      visible(state) {
        if (this.is_editor) {
          return state.logs_visible
        } else {
          return true;
        }
      },
      editor_log_size(state) {
        return state.editor_log_size;
      },
      pages_count() {
        return this.pages();
      },
      is_editor() {
        return this.type === "editor";
      },
      headers() {
        return [
          {
            text: "Info",
            align: "center",
            sortable: false,
            width: this.is_editor ? "5%" : "10%"
          },
          {
            text: "Level",
            value: "level",
            align: "left",
            sortable: false,
            width: this.is_editor ? "6%" : "15%"
          },
          {
            text: "Date",
            value: "date",
            align: "left",
            sortable: false,
            width: this.is_editor ? "10%" : "25%"
          },
          {
            text: "Entry",
            value: "entry",
            align: "left",
            sortable: false
          }
        ]
      },
    }),
    methods: {
      pages() {
        if (
          this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
        ) {
          return 0;
        }
        return Math.ceil(
          this.pagination.totalItems / this.pagination.rowsPerPage
        );
      },
      get_logs: function () {
        Vue.axios
          .get(this.$store.getters.server_url + "/logger", {
            params: {
              action: "get_logs",
              uuid: this.uuid,
              limit: this.is_editor ? 60 : 5
            }
          })
          .then(response => {
            this.pagination.totalItems = response.data.length;
            this.logs = response.data;
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    watch: {
      uuid: function (uuid) {
        if (this.visible) {
          this.$timer.start("get_logs");
        }
      },
      visible: function (value) {
        if (value) {
          this.$timer.start("get_logs");
        } else {
          this.$timer.stop("get_logs");
          this.logs = [];
        }
      },
      editor_log_size: function (value) {
        this.pagination.rowsPerPage = value;
      },
      'pagination.rowsPerPage': function () {
        if (this.is_editor) {
          let component = this;
          setTimeout(() => {
            component.$parent.$forceUpdate();
          }, 30)
        }
      }
    }
  }
</script>

<style scoped>
  .custom-pagination {
    position: absolute;
    top: 2px;
    right: 2px;
  }

  .logs-card {
    margin-top: 8px;
  }

  .logs-text {
    padding: 0;
    position: relative;
  }

  .logs-text-modal {
    padding: 16px;
  }

  .logs-title h3 {
    font-weight: normal;
  }

  table.v-table tbody td {
    font-size: 11px;
    line-height: 15px;
  }

  .logs-text-modal table.v-table tbody td {
    font-size: 13px;
    line-height: 26px;
  }

  table.v-table tbody td,
  table.v-table tbody th {
    height: 20px !important;
  }

  th:first-child,
  td:first-child {
    padding: 0;
  }

  button.icon-btn,
  button.icon-btn:before {
    height: 20px;
  }

  .ellipsis {
    display: block;
    max-width: 16ch;
  }

  .mw-100 {
    max-width: 100%;
  }
</style>