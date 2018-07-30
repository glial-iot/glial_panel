<template>
   <div>
      <v-card class="elevation-3">
         <v-card-title id="editor-card-title" class="py-1 px-1">
            <div class="text-xs-left">
               <v-btn @click.native="$router.go(-1)">
                  <v-icon left small>fa-arrow-left</v-icon> Back
               </v-btn>
            </div>

            <v-spacer></v-spacer>
            <span class=".display-1"> {{this.type}} {{this.name}} </span>
            <v-spacer></v-spacer>

            <div class="text-xs-left">
               <v-btn @click.native="save_file">
                  <v-icon left small>fa-cloud-upload-alt</v-icon> Save
               </v-btn>
               <v-btn @click.native="logs_visible = !logs_visible">
                  <v-icon left small>fa-file-alt</v-icon> Show Logs
               </v-btn>
               <v-btn @click.native="load_file">
                  <v-icon left small>fa-sync-alt</v-icon> Reload file
               </v-btn>
               <v-btn @click.native="restart_script">
                  <v-icon left small>fa-sync</v-icon> Restart script
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
            <v-data-table v-if="logs.length > 0" :headers="headers" :items="logs" hide-actions must-sort class="no-scroll">
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
         </v-card-text>
      </v-card>

      <snackbar ref="snackbar"></snackbar>
   </div>
</template>


<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import VueTimers from "vue-timers";
Vue.use(VueTimers);

import snackbar from "../components/snackbar.vue";
import editor from "../brace/index.js";
import "brace/mode/lua";
import "brace/mode/html";
import "brace/theme/crimson_editor";

export default {
  data: () => ({
    lang: "lua",
    content: "",
    uuid: "",
    saved: true,
    loaded: false,
    name: "",
    type: "",
    logs_visible: false,
    logs: [],
    headers: [
      {
        text: "Level",
        value: "level",
        align: "center",
        sortable: false,
        width: "15%"
      },
      {
        text: "Date",
        value: "date",
        align: "center",
        sortable: false,
        width: "30%"
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
    snackbar
  },
  timers: {
    get_logs: {
      autostart: false,
      time: 1000,
      immediate: true,
      repeat: true
    }
  },
  mounted: function () {
    window.addEventListener('resize', this.force_update)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.force_update)
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
          .get(this.$store.getters.server_url + "/scripts", {
            params: {
              action: "update",
              uuid: this.uuid,
              body: reader.result
            },
            headers: {
              "content-type": "multipart/form-data"
            }
          })
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
          this.name = response.data.name;
          this.type = response.data.type;
          this.$refs.snackbar.update("File loaded", "success", 2000);
          this.saved = true;
          this.loaded = true;
        })
        .catch(error => {
          this.content = "";
          this.$refs.snackbar.update("Load file: network error");
        });
    },
    restart_script: function() {
      this.logs_visible = true;

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
            limit: 10
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
      const header_height = document.querySelector('nav.v-toolbar') ? document.querySelector('nav.v-toolbar').offsetHeight : 64
      const editor_title_height = document.querySelector('#editor-card-title') ? document.querySelector('#editor-card-title').offsetHeight : 56
      const logs_height = document.querySelector('#logs-card') ? document.querySelector('#logs-card').offsetHeight + 16 : 250
      const content_padding = 48
      let height = window.innerHeight - (header_height + editor_title_height + content_padding)

      if (this.logs_visible) {
        height = height - logs_height
      }

      return `${height}px`
    }
  },
  watch: {
    uuid: function(uuid) {
      this.uuid = uuid;
      this.load_file();
    },
    content: function(value, oldValue) {
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
    }
  }
};
</script>

<style scoped>
.logs-card {
  margin-top: 16px;
}

.logs-text {
  padding: 0;
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
</style>
