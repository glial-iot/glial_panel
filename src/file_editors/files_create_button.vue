<template>
   <div>
      <v-layout row >
         <v-flex xs-6 ml-3>
            <v-text-field light
               name="input-1"
               label="filename"
               v-model= "filenameinput"
            ></v-text-field>
         </v-flex>
         <v-flex xs-6 mt-2>
               <v-btn :loading="button_create.loading" :disabled="button_create.disabled" :color="button_create.color" left :path="path" :filetype="filetype" @click="create_file(path,filetype)">
                  <v-icon left small>fa-file</v-icon> Create new file
               </v-btn>
         </v-flex>
      </v-layout>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

export default {
  data() {
    return {
      button_create: {
        disabled: false,
        loading: false,
        color: "primary"
      },
      filenameinput: ""
    };
  },
  props: ["path", "filetype"],

  methods: {
    create_file(path, filetype) {
      Vue.axios
        .get("http://localhost:8080/system_webedit_data_v2", {
          params: {
            item: "new",
            address: path + "/" + this.filenameinput + "." + filetype
          }
        })
        .then(response => {
          setTimeout(() => (this.button_create.loading = false), 800);
          setTimeout(() => (this.button_create.disabled = false), 800);
          this.button_create.color = "success";
          this.button_create.loading = true;
          this.button_create.disabled = true;
          setTimeout(() => (this.button_create.color = "primary"), 1500);
          this.$emit("data_updated", path);
          this.filenameinput = "";
        })
        .catch(error => {
          console.log(error);
          setTimeout(() => (this.button_create.loading = false), 800);
          setTimeout(() => (this.button_create.disabled = false), 800);
          this.button_create.color = "error";
          this.button_create.loading = true;
          this.button_create.disabled = true;
          setTimeout(() => (this.button_create.color = "primary"), 2000);
          this.$emit("create_error");
        });
    }
  }
};
</script>
