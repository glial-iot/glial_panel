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
               <editor :content="content" :lang="lang" v-on:content-update="update_last_editor_content" theme='crimson_editor' :height="'630px'"></editor>
            </v-flex>
         </div>
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
Vue.component("snackbar", snackbar);

import editor from "../brace/index.js";
import "brace/mode/lua";
import "brace/mode/html";
import "brace/theme/crimson_editor";

export default {
  data: () => ({
    lang: "lua",
    content: "",
    last_content: "",
    uuid: "",
    save_flag: true,
    saved: false,
    name: "",
    type: ""
  }),
  components: {
    editor
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
    /*     if (this.saved == false) {
      const answer = window.confirm(
        "Do you really want to leave? You have unsaved changes!"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } */
    next();
  },

  methods: {
    save_file: function(event) {
      let data = new Blob([this.last_content], {
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
    update_last_editor_content: function(content) {
      if (this.last_content !== content) {
        this.last_content = content;
        this.saved = false;
      }
    },

    load_file: function() {
      this.content = this.last_content;
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
    }
  },
  watch: {
    uuid: function(uuid) {
      this.uuid = uuid;
      this.load_file();
    }
  }
};
</script>
