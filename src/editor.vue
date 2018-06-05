<template>
    <div>
           <div class="text-xs-left">
            <v-btn @click.native="back" >
               <v-icon left small>fa-arrow-left</v-icon> Back
            </v-btn>
            <v-btn :color="button_save_color" @click.native="save_file" >
               <v-icon left small>fa-cloud-upload-alt</v-icon> Save
            </v-btn>
            <v-btn :color="button_reload_color" @click.native="load_file" >
               <v-icon left small>fa-sync-alt</v-icon> Reload
            </v-btn>

      </div>

      <div id="app">
         <v-flex xs12>
            <editor :content="content" :lang="lang" v-on:content-update="update_last_editor_content" theme='crimson_editor' :height="'630px'" ></editor>
         </v-flex>
      </div>

    </div>
   <v-snackbar :timeout="10000" :top="true" :right="true" v-model="snackbar" :color="'error'" >
      {{ snackbartext }}
      <v-btn flat  @click.native="snackbar = false">Close</v-btn>
   </v-snackbar>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import editor from "vue-brace";
import "brace/mode/lua";
import "brace/mode/html";
import "brace/theme/crimson_editor";

export default {
  data: () => ({
    snackbar: false,
    snackbartext: "",
    lang: "lua",
    content: "",
    last_content: "",
    current_file_name: "",
    save_flag: true,
    button_save_color: "",
    button_reload_color: ""
  }),
  components: {
    editor
  },
  beforeRouteEnter(to, from, next) {
    if (Object.keys(to.query).length !== 0 && to.query.file !== undefined) {
      next(vm => {
        vm.current_file_name = to.query.file;
      });
    }
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
          .get("http://localhost:8080/system_webedit_data_v2", {
            params: {
              item: "save",
              address: this.current_file_name,
              value: reader.result
            },
            headers: {
              "content-type": "multipart/form-data"
            }
          })
          .then(response => {
            let old_color = this.button_save_color;
            this.button_save_color = "success";
            setTimeout(() => (this.button_save_color = old_color), 1500);
          })
          .catch(error => {
            let old_color = this.button_save_color;
            this.button_save_color = "error";
            setTimeout(() => (this.button_save_color = old_color), 1500);
            console.log(error);
            this.snackbar = false;
            this.snackbartext = "Save file: network error";
            this.snackbar = true;
          });
      };
    },
    update_last_editor_content: function(content) {
      this.last_content = content;
    },
    back: function() {
      this.$router.go(-1);
    },
    load_file: function() {
      this.content = this.last_content;
      Vue.axios
        .get("http://localhost:8080/system_webedit_data_v2", {
          params: {
            item: "get",
            address: this.current_file_name
          }
        })
        .then(response => {
          this.content = response.data;
          let old_color = this.button_reload_color;
          this.button_reload_color = "success";
          setTimeout(() => (this.button_reload_color = old_color), 1500);
          //console.log(this.content);
        })
        .catch(error => {
          let old_color = this.button_reload_color;
          this.button_reload_color = "error";
          setTimeout(() => (this.button_reload_color = old_color), 1500);
          console.log(error);
          this.snackbar = false;
          this.snackbartext = "Load file: network error";
          this.snackbar = true;
        });

      if (this.current_file_name.search(/lua/) > 0) this.lang = "lua";

      if (this.current_file_name.search(/html/) > 0) this.lang = "html";
    }
  },
  watch: {
    current_file_name: function(file) {
      this.current_file_name = file;
      this.load_file();
    }
  }
};
</script>
