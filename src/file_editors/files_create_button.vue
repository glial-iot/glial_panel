<template>
   <div>
      <v-layout row >
         <v-flex xs-6 ml-3>
            <v-text-field light
               id="testing"
               name="input-1"
               label="file name"
               v-model= "filenameinput"
            ></v-text-field>
         </v-flex>
         <v-flex xs-6 mt-2>
               <v-btn color="success" left :path="path" :filetype="filetype" @click="create_file(path,filetype)">
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
  data: () => ({
    filenameinput: ""
  }),
  props: ["path", "filetype"],

  methods: {
    create_file(path, filetype) {
      Vue.axios
        .get("http://localhost:8080/system_webedit_data", {
          params: {
            item: "new",
            address: path + "/" + this.filenameinput + "." + filetype
          }
        })
        .then(response => {})
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>
