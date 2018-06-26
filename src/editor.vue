<template>
   <div>
      <div class="text-xs-left">
         <v-btn @click.native="$router.go(-1)">
            <v-icon left small>fa-arrow-left</v-icon> Back
         </v-btn>
         <v-btn @click.native="save_file">
            <v-icon left small>fa-cloud-upload-alt</v-icon> Save
         </v-btn>
         <v-btn @click.native="load_file">
            <v-icon left small>fa-sync-alt</v-icon> Reload
         </v-btn>
      </div>

      <div id="app">
         <v-flex xs12>
            <editor :content="content" :lang="lang" v-on:content-update="update_last_editor_content" theme='crimson_editor' :height="'630px'"></editor>
         </v-flex>
      </div>

      <snackbar ref="snackbar"></snackbar>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import snackbar from "./components/snackbar.vue";
Vue.component("snackbar", snackbar);

import editor from "./brace/index.js";
import "brace/mode/lua";
import "brace/mode/html";
import "brace/theme/crimson_editor";

export default {
  data: () => ({
    lang: "lua",
    content: "",
    last_content: "",
    current_name: "",
    current_item: "",
    save_flag: true
  }),
  components: {
    editor
  },
  beforeRouteEnter(to, from, next) {
    if (
      Object.keys(to.query).length !== 0 &&
      to.query.name !== undefined &&
      to.query.item !== undefined
    ) {
      next(vm => {
        vm.current_name = to.query.name;
        vm.current_item = to.query.item;
      });
    }
    next();
  },
   
  methods: {
    save_file: function(event) {
      var endpoint_url = 'http://' + this.$store.state.server_url+'/system_webedit_data_v3';
      let data = new Blob([this.last_content], {
        type: "text/plain"
      });
      let reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onload = () => {
        Vue.axios
          .get(endpoint_url, {
            params: {
              action: "save",
              item: this.current_item,
              name: this.current_name,
              value: reader.result
            },
            headers: {
              "content-type": "multipart/form-data"
            }
          })
          .then(response => {
            this.$refs.snackbar.update("File saved", "success", 3000);
          })
          .catch(error => {
            this.$refs.snackbar.update("File not saved");
            console.log(error);
          });
      };
    },
    update_last_editor_content: function(content) {
      this.last_content = content;
    },
    load_file: function() {
      var endpoint_url = 'http://' + this.$store.state.server_url+'/system_webedit_data_v3';
      this.content = this.last_content;
      Vue.axios
        .get(endpoint_url, {
          params: {
            action: "get",
            item: this.current_item,
            name: this.current_name
          }
        })
        .then(response => {
          this.content = response.data;
          this.$refs.snackbar.update("File loaded", "success", 2000);
          //console.log(this.content);
        })
        .catch(error => {
          this.$refs.snackbar.update("Load file: network error");
          console.log(error);
        });

      if (this.current_name.search(/lua/) > 0) this.lang = "lua";

      if (this.current_name.search(/html/) > 0) this.lang = "html";
    }
  },
  watch: {
    current_name: function(file) {
      this.current_name = file;
      this.load_file();
    }
  }
};
</script>
