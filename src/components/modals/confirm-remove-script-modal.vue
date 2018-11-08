<template>
   <div>
      <v-dialog v-on:keydown.esc="hide()" :value="visible" persistent max-width="290">
         <v-card>
            <v-card-title class="headline">Confirm remove script</v-card-title>
            <v-card-text>Do you really want to remove script "{{item.name}}"?</v-card-text>
            <v-card-actions>
               <v-btn color="error" flat @click="script_delete()">Delete</v-btn>
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
    visible: false,
    item: {}
  }),
  props: ["update"],
  methods: {
    show(item) {
      this.visible = true;
      this.item = item;
    },
    hide() {
      this.visible = false;
      this.item = {};
    },
    script_delete() {
      Vue.axios
        .get(
          this.$store.getters.server_url +
            this.$store.state.endpoints[this.item.type],
          {
            params: {
              action: "delete",
              uuid: this.item.uuid
            }
          }
        )
        .then(response => {
          this.$refs.snackbar.update(
            `Script "${this.item.name}" successfuly removed`,
            "success",
            5000
          );
          this.update();
          this.hide();
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Delete script error");
        });
    }
  }
};
</script>
