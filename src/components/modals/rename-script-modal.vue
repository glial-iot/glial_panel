<template>
   <div>
      <v-dialog :value="visible" persistent max-width="290">
         <v-card>
            <v-card-title class="headline">Rename script</v-card-title>
            <v-card-text>
               <v-text-field v-model="name" label="Edit name" required></v-text-field>
            </v-card-text>
            <v-card-actions>
               <v-btn color="error" flat @click="hide()">Cancel</v-btn>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" flat @click="submit()">Rename</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
      <snackbar ref="snackbar"></snackbar>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import snackbar from "../snackbar.vue";

export default {
  props: ["hideDetails", "updateName"],
  data: () => ({
    name: "",
    uuid: "",
    type: "",
    visible: false
  }),
  methods: {
    show(uuid, type, name) {
      this.uuid = uuid;
      this.name = name;
      this.type = type;
      this.visible = true;
    },
    hide() {
      this.name = "";
      this.uuid = "";
      this.type = "";
      this.visible = false;
    },
    submit() {
      Vue.axios
        .get(this.$store.getters.server_url + "/scripts", {
          params: {
            action: "update",
            uuid: this.uuid,
            name: this.name
          }
        })
        .then(response => {
          this.hide();
          if (this.hideDetails) {
            this.hideDetails();
          }
          if (this.updateName && response.data.name) {
            this.updateName(response.data.name);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>
