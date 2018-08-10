<template>
   <div>
      <v-dialog :value="visible" persistent max-width="290">
         <v-card>
            <v-card-title class="headline">Change script object</v-card-title>
            <v-card-text>
               <v-text-field v-model="object" label="Enter new object" required></v-text-field>
            </v-card-text>
            <v-card-actions>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" flat @click="hide()">Cancel</v-btn>
               <v-btn color="green darken-1" flat @click="submit()">Change object</v-btn>
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
  props: ['updateObject'],
  data: () => ({
    object: "",
    uuid: "",
    visible: false
  }),
  methods: {
    show(uuid, object) {
      this.uuid = uuid;
      this.object = object;
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    submit() {
      Vue.axios
        .get(this.$store.getters.server_url + "/scripts", {
          params: {
            action: "update",
            uuid: this.uuid,
            object: this.object
          }
        })
        .then(response => {
          if (this.updateObject && response.data.object) {
            this.updateObject(response.data.object);
          }
          this.hide();
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>
