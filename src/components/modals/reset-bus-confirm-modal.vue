<template>
  <div>
    <v-dialog v-on:keydown.esc="hide()" :value="visible" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Confirm delete all from bus</v-card-title>
        <v-card-text>Do you want to delete all from bus?</v-card-text>
        <v-card-actions>
          <v-btn color="error" flat @click="delete_all()">Delete</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" dark @click="hide()">No</v-btn>
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
    data: () => ({
      visible: false
    }),
    methods: {
      show() {
        this.visible = true;
      },
      hide() {
        this.visible = false;
      },
      delete_all() {
        Vue.axios
          .get(this.$store.getters.server_url + "/system_bus", {
            params: {
              action: "delete_topics",
              topic: "*"
            }
          })
          .then(response => {
            this.$refs.snackbar.update("");
            if (response.data.result) {
              this.visible = false;
            }
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Delete topic: network error");
          });
      }
    }
  };
</script>
