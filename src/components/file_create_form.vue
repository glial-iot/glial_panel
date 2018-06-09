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
               <v-text-field autofocus label="Name of file" v-model="filename"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="primary" flat @click.stop="dialog_visible=false">Close</v-btn>
               <v-spacer></v-spacer>
               <v-btn :loading="button_create.loading" :disabled="button_create.disabled" :color="button_create.color" right flat @click="create_file()">
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
      button_create: {
        disabled: false,
        loading: false,
        color: "primary"
      },
      filename: ""
    };
  },
  props: ["item", "filetype"],

  methods: {
    create_file() {
      Vue.axios
        .get("http://localhost:8080/system_webedit_data_v3", {
          params: {
            action: "new",
            item: this.item,
            name: this.filename
          }
        })
        .then(response => {
          setTimeout(() => (this.button_create.loading = false), 500);
          setTimeout(() => (this.button_create.disabled = false), 500);
          this.button_create.color = "success";
          this.button_create.loading = true;
          this.button_create.disabled = true;
          setTimeout(() => (this.button_create.color = "primary"), 800);
          setTimeout(() => (this.dialog_visible = false), 800);
          setTimeout(() => this.$emit("data_updated", this.item), 800);
          this.filename = "";
        })
        .catch(error => {
          console.log(error);
          setTimeout(() => (this.button_create.loading = false), 500);
          setTimeout(() => (this.button_create.disabled = false), 500);
          this.button_create.color = "error";
          this.button_create.loading = true;
          this.button_create.disabled = true;
          setTimeout(() => (this.button_create.color = "primary"), 800);
          this.$emit("create_error");
        });
    }
  }
};
</script>
