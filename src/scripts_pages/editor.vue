<template>
   <div>
      <v-card class="elevation-3">
         <v-card-title id="editor-card-title" class="py-1 px-1">
            <div class="text-xs-left">
               <v-btn :small="true" @click.native="$router.go(-1)" title="Go to script list">
                  <v-icon left small>fa-arrow-left</v-icon> Back
               </v-btn>
            </div>

            <v-spacer></v-spacer>
            <span class=".display-1 pointer" title="Click to edit name" @click="$refs.rename.show(uuid, type, name)"> {{type2string(type)}} "{{name}}" </span>
            <v-spacer></v-spacer>
            <span class=".display-1 pointer" title="Click to edit object" v-show="object !== undefined" @click="$refs.change_object.show(uuid, object)"> Object "{{object}}" </span>
            <v-spacer></v-spacer>

            <div class="text-xs-left buttons">

               <v-btn :small="true" @click.native="save_file" title="Save script">
                  <v-icon left small>fa-cloud-upload-alt</v-icon> Save
               </v-btn>
               <v-btn :small="true" @click.native="save_and_restart" title="Save script and restart">
                  <v-icon left small>fa-sync</v-icon> Save and restart
               </v-btn>
               <v-btn :small="true" @click.native="toggle_logs_visible" title="Show/hide logs window">
                  <v-icon left small>fa-file-alt</v-icon>{{logs_visible ? "Hide Logs" : "Show Logs"}}
               </v-btn>
               <div class="logs-size-block">
                  <v-btn :small="true" class="logs-buttons" @click="change_logs_size('+')" v-if="logs_visible" title="Increase logs windows size">
                     <v-icon :size="11">fa-arrow-up</v-icon>
                  </v-btn>
                  <v-btn :small="true" class="logs-buttons" @click="change_logs_size('-')" v-if="logs_visible" title="Decrease logs windows size">
                     <v-icon :size="11">fa-arrow-down</v-icon>
                  </v-btn>
               </div>

               <v-btn :small="true" @click.native="$refs.help.show()" title="Show glue scripts help">
                  <v-icon left small>fa-question-circle</v-icon> Help
               </v-btn>
            </div>

         </v-card-title>
         <v-divider></v-divider>

         <div id="app">
            <v-flex xs12>
               <editor :content="content" v-on:content-update="update_content" :lang="lang" theme="crimson_editor" :height="editor_height()"></editor>
            </v-flex>
         </div>
      </v-card>

      <v-card id="logs-card" class="logs-card">
         <v-card-text class="logs-text" v-if="logs_visible">
            <v-data-table v-if="logs.length > 0" :headers="headers" :items="logs" hide-actions must-sort class="no-scroll" :pagination.sync="pagination">
               <template slot="items" slot-scope="props">
                  <tr>
                     <td class="text-xs-center">
                        <div class="ellipsis">{{ props.item.level }}</div>
                     </td>
                     <td class="text-xs-center">
                        <div class="ellipsis" :title="props.item.date_abs">{{props.item.date_rel }}</div>
                     </td>
                     <td class="text-xs-left">
                        <div class="ellipsis" :title="props.item.entry">{{ props.item.entry }}</div>
                     </td>
                  </tr>
               </template>
            </v-data-table>
            <v-flex v-if="pagination.totalItems > pagination.rowsPerPage" d-block>
               <v-pagination class="custom-pagination custom-pagination-hide-inactive" v-model="pagination.page" :length="pages()"></v-pagination>
            </v-flex>
         </v-card-text>
      </v-card>

      <snackbar ref="snackbar"></snackbar>
      <editor-help-modal ref="help"></editor-help-modal>
      <rename-script-modal ref="rename" :updateName="update_name"></rename-script-modal>
      <change-object-modal ref="change_object" :updateObject="update_object"></change-object-modal>
   </div>
</template>


<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import VueTimers from "vue-timers";
Vue.use(VueTimers);
import { mapState } from "vuex";

import { script_type2string } from "../utils/index.js";
import snackbar from "../components/snackbar.vue";
import editorHelpModal from "../components/modals/editor-help-modal.vue";
import renameScriptModal from "../components/modals/rename-script-modal.vue";
import changeObjectModal from "../components/modals/change-object-modal.vue";
import editor from "../brace/index.js";
import "brace/mode/lua";
import "brace/mode/html";
import "brace/theme/crimson_editor";

export default {
  data: () => ({
    pagination: { rowsPerPage: 6 },
    lang: "lua",
    content: "",
    uuid: "",
    saved: true,
    loaded: false,
    name: "",
    object: "",
    type: "",
    logs: [],
    headers: [
      {
        text: "Level",
        value: "level",
        align: "center",
        sortable: false,
        width: "10%"
      },
      {
        text: "Date",
        value: "date",
        align: "center",
        sortable: false,
        width: "15%"
      },
      {
        text: "Entry",
        value: "entry",
        align: "left",
        sortable: false
      }
    ],
    prev_content: ""
  }),
  components: {
    editor,
    snackbar,
    editorHelpModal,
    renameScriptModal,
    changeObjectModal
  },
  timers: {
    get_logs: {
      autostart: false,
      time: 1000,
      immediate: true,
      repeat: true
    }
  },
  computed: mapState({
    logs_visible: state => state.logs_visible,
    editor_log_size: state => state.editor_log_size
  }),
  mounted: function() {
    window.addEventListener("resize", this.force_update);
    this.pagination.rowsPerPage = this.editor_log_size;
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.force_update);
  },
  beforeRouteEnter(to, from, next) {
    if (Object.keys(to.query).length !== 0 && to.query.uuid !== undefined) {
      next(vm => {
        vm.uuid = to.query.uuid;
      });
    }
    next();
  },
  beforeRouteLeave(to, from, next) {
    if (!this.saved) {
      const result = window.confirm(
        "Do you really want to leave? You have unsaved changes!"
      );
      if (!result) {
        next(false);
        return;
      }
    }
    next();
  },
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
    type2string(type) {
      return script_type2string(type);
    },
    toggle_logs_visible: function() {
      this.$store.commit("logs_visible", !this.logs_visible);
    },
    force_update: function() {
      this.$forceUpdate();
    },
    update_content: function(content) {
      if (this.prev_content !== content) {
        this.prev_content = content;
      }
    },
    save_file: function(event) {
      let data = new Blob([this.prev_content], {
        type: "text/plain"
      });
      let reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onload = () => {
        Vue.axios
          .post(
            this.$store.getters.server_url + "/scripts_body?uuid=" + this.uuid,
            reader.result
          )
          .then(response => {
            this.$refs.snackbar.update("File saved", "success", 3000);
            this.saved = true;
          })
          .catch(error => {
            this.$refs.snackbar.update("File not saved");
            console.log(error);
          });
      };
    },
    load_file: function() {
      Vue.axios
        .get(this.$store.getters.server_url + "/scripts", {
          params: {
            action: "get",
            uuid: this.uuid
          }
        })
        .then(response => {
          this.content = response.data.body;
          this.prev_content = response.data.body;
          this.name = response.data.name;
          this.object = response.data.object;
          this.type = response.data.type;
          this.saved = true;
          this.loaded = true;
        })
        .catch(error => {
          this.content = "";
          this.$refs.snackbar.update("Load file: network error");
        });
    },
    save_and_restart: function() {
      let data = new Blob([this.prev_content], {
        type: "text/plain"
      });
      let reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onload = () => {
        Vue.axios
          .post(
            this.$store.getters.server_url + "/scripts_body?uuid=" + this.uuid,
            reader.result
          )
          .then(response => {
            this.$refs.snackbar.update("File saved", "success", 3000);
            this.saved = true;
            this.restart_script();
          })
          .catch(error => {
            this.$refs.snackbar.update("File not saved");
            console.log(error);
          });
      };
    },
    restart_script: function() {
      this.$store.commit("logs_visible", true);

      Vue.axios
        .get(
          this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
          {
            params: {
              action: "reload",
              uuid: this.uuid
            }
          }
        )
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Reload script error");
        });
    },
    get_logs: function() {
      Vue.axios
        .get(this.$store.getters.server_url + "/logger", {
          params: {
            action: "get_logs",
            uuid: this.uuid,
            limit: 60
          }
        })
        .then(response => {
          this.logs = response.data;
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    },
    editor_height: function() {
      const header_height = document.querySelector("nav.v-toolbar")
        ? document.querySelector("nav.v-toolbar").offsetHeight
        : 48;
      const editor_title_height = document.querySelector("#editor-card-title")
        ? document.querySelector("#editor-card-title").offsetHeight
        : 56;
      const logs_height =
        document.querySelector("#logs-card") &&
        document.querySelector("#logs-card").offsetHeight > 51
          ? document.querySelector("#logs-card").offsetHeight + 12
          : 217;
      const content_padding = 24;
      let height =
        window.innerHeight -
        (header_height + editor_title_height + content_padding);

      if (this.logs_visible) {
        height = height - logs_height;
      }

      return `${height}px`;
    },
    change_logs_size(dir) {
      let action = "increase_editor_log_size";
      if (dir === "-") {
        action = "decrease_editor_log_size";
      }
      this.$store.dispatch(action);
    },
    update_name(value) {
      this.name = value;
    },
    update_object(value) {
      this.object = value;
    }
  },
  watch: {
    uuid: function(uuid) {
      this.uuid = uuid;
      this.load_file();

      if (this.logs_visible) {
        this.$timer.start("get_logs");
      }
    },
    prev_content: function(value, oldValue) {
      if (value !== oldValue) {
        this.saved = false;
      }
    },
    saved: function(value) {
      if (value) {
        window.onbeforeunload = null;
      } else {
        window.onbeforeunload = function(e) {
          var dialogText =
            "Do you really want to leave? You have unsaved changes!";
          e.returnValue = dialogText;
          return dialogText;
        };
      }
    },
    logs_visible: function(value) {
      if (value) {
        this.$timer.start("get_logs");
      } else {
        this.$timer.stop("get_logs");
        this.logs = [];
      }
    },
    loaded: function(value, oldValue) {
      if (!oldValue && value) {
        this.saved = true;
      }
    },
    editor_log_size: function(value) {
      this.pagination.rowsPerPage = value;
    }
  }
};
</script>

<style>
.custom-pagination .v-pagination__navigation {
  height: 18px;
  width: 18px;
  margin-right: 4px;
  margin-left: 4px;
}

.custom-pagination .v-pagination__navigation .v-icon {
  font-size: 18px;
}

.custom-pagination .v-pagination__item {
  height: 20px;
  width: 20px;
  font-size: 12px;
  margin: 2px;
}

.custom-pagination-hide-inactive
  .v-pagination__item:not(.v-pagination__item--active) {
  display: none;
}

.custom-pagination-hide-inactive .v-pagination__item--active.primary {
  color: #000;
  background-color: #fff !important;
  border-color: initial !important;
}
</style>

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

.logs-title h3 {
  font-weight: normal;
}

table.v-table tbody td {
  font-size: 11px;
}

table.v-table tbody td,
table.v-table tbody th {
  height: 20px !important;
}

.pagination-block {
  display: flex;
  justify-content: space-around;
  padding: 4px;
}

.logs-size-block {
  display: inline-flex;
  flex-direction: column;
}

.logs-buttons {
  min-width: auto;
  height: auto;
  margin: 2px;
}

.buttons {
  display: flex;
  align-items: center;
}

.pointer {
  cursor: pointer;
}
</style>
