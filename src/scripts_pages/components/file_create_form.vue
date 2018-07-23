<template>
   <div>
      <v-btn right color="secondary" class="my-2" @click="dialog_visible = true">
         <v-icon left small>fa-file</v-icon> Create
      </v-btn>

      <v-dialog v-model="dialog_visible" max-width="500px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Create new file</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <v-text-field autofocus label="Name" v-model="name"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="primary" flat @click.stop="close">Close</v-btn>
               <v-spacer></v-spacer>
               <v-btn color="primary" right flat @click="create_file()">
                  <v-icon left small>fa-file</v-icon> Create </v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
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
      dialog_visible: false,
      name: ""
    };
  },
  props: ["type"],

  methods: {
    close() {
      this.name = "";
      this.dialog_visible = false;
    },
    create_file() {
      Vue.axios
        .get(this.$store.getters.server_url + "/scripts", {
          params: {
            action: "create",
            name: this.name,
            type: this.type
          }
        })
        .then(response => {
          this.$emit("data_updated", this.item);
          this.dialog_visible = false;
          this.name = "";
        })
        .catch(error => {
          console.log(error);
          this.$emit("create_error");
        });
    }
  }
};
</script>
