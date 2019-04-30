<template>
  <div>
    <v-dialog v-on:keydown.esc="hide()" :value="visible" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Confirm remove script</v-card-title>
        <v-card-text>Do you really want to delete setting "{{item.setting_name}}"?</v-card-text>
        <v-card-actions>
          <v-btn color="error" flat @click="delete_setting()">Delete</v-btn>
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
    methods: {
      show(item) {
        this.visible = true;
        this.item = item;
      },
      hide() {
        this.visible = false;
        this.item = {};
      },
      delete_setting() {
        Vue.axios
          .get(
            this.$store.getters.server_url + "/settings",
            {
              params: {
                action: "delete",
                name: this.item.setting_name
              }
            }
          )
          .then(response => {
            this.$refs.snackbar.update(
              `Setting "${this.item.setting_name}" successfuly removed`,
              "success",
              5000
            );
            this.$parent.get_settings_list();
            this.hide();
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Delete setting error");
          });
      }
    }
  };
</script>
