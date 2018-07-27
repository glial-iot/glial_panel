<template>
   <div>
      <v-card class="elevation-3">
         <v-card-title class="py-1 px-1">
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
               <v-btn @click.native="load_file">
                  <v-icon left small>fa-sync-alt</v-icon> Reload
               </v-btn>
               <v-btn @click.native="restart_script">
                  <v-icon left small>fa-sync</v-icon> Restart script
               </v-btn>
            </div>

         </v-card-title>
         <v-divider></v-divider>

         <div id="app">
            <v-flex xs12>
               <editor :content="content" :lang="lang" theme="crimson_editor" height="630px"></editor>
            </v-flex>
         </div>
      </v-card>

      <v-card class="logs-card">
         <v-card-title class="logs-title" @click="logs_visible = !logs_visible">
            <h3>Logs</h3>
            <v-spacer></v-spacer>
            <v-btn icon class="mt-0 mr-0 mb-0 ml-0">
              <v-icon>{{ logs_visible ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
         </v-card-title>
         <v-divider></v-divider>
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
    ]
  }),
  components: {
    editor,
    snackbar
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
      const result = window.confirm("Do you really want to leave? You have unsaved changes!");
      if (!result) {
        next(false);
        return;
      }
    }
    next();
  },

  methods: {
    save_file: function(event) {
      let data = new Blob([this.content], {
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
        })
        .catch(error => {
          this.content = "";
          this.$refs.snackbar.update("Load file: network error");
        });
    },
    restart_script: function() {
      Vue.axios
        .get(
          this.$store.getters.server_url + this.$store.state.endpoints[this.type],
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
          var dialogText = 'Dialog text here';
          e.returnValue = dialogText;
          return dialogText;
        };
      }
    },
    logs_visible: function(value) {
      if (value) {
        this.get_logs();
      } else {
        this.logs = []
      }
    }
  }
};
</script>

<style scoped>
.logs-card {
  margin-top: 16px;
}

.logs-title {
  cursor: pointer;
}

.logs-text {
  padding: 0;
}

.logs-title h3 {
  font-weight: normal;
}
</style>
