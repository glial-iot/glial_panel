<template>
  <div>
    <v-card>
      <v-card-title>
        <v-icon>fa-wrench</v-icon>
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="secondary" class="ma-0" @click="create_setting">
          <v-icon left small>fa-plus</v-icon>
          Create setting
        </v-btn>

      </v-card-title>
      <v-divider></v-divider>
      <v-data-table class="no-scroll" v-if="loaded" :headers="headers" :items="settings" hide-actions
                    no-data-text="Loading settings ...">

        <template slot="items" slot-scope="props">
          <tr>
            <td class="text-xs-left ellipsis" :title="props.item.setting_name">
              {{ props.item.setting_name }}
            </td>

            <td class="text-xs-left ellipsis" :title="props.item.setting_value">
              {{ props.item.setting_value }}
            </td>

            <td class="text-xs-left ellipsis" :title="props.item.setting_description">
              {{ props.item.setting_description }}
            </td>

            <td class="text-xs-center button-sm">
              <button-edit title="Edit setting" @click.native="edit_setting(props.item)"></button-edit>
            </td>

            <td class="text-xs-center button-sm">
              <button-trash title="Delete setting" @click.native="delete_setting(props.item)"></button-trash>
            </td>

          </tr>
        </template>

      </v-data-table>
    </v-card>

    <snackbar ref="snackbar"></snackbar>
    <set-setting-modal ref="settingmodal"></set-setting-modal>
    <delete-setting-modal ref="deletesettingmodal"></delete-setting-modal>
  </div>
</template>
<script>
  import Vue from "vue";
  import Axios from "axios";
  import VueAxios from "vue-axios";

  Vue.use(VueAxios, Axios);
  import setSettingModal from "./components/modals/set-setting-modal.vue"
  import deleteSettingModal from "./components/modals/confirm-delete-setting-modal.vue"
  import buttonEdit from "./components/buttons/button-edit.vue";
  import buttonTrash from "./components/buttons/button-trash.vue";
  import snackbar from "./components/snackbar.vue";

  export default {
    components: {
      snackbar,
      buttonEdit,
      buttonTrash,
      setSettingModal,
      deleteSettingModal
    },
    data: () => ({
      loaded: false,
      settings: [],
      headers: [
        {
          text: "Name",
          value: "name",
          align: "left",
          width: "10%"
        },
        {
          text: "Value",
          value: "tag",
          align: "left",
          width: "10%"
        },
        {
          text: "Descrption",
          align: "left",
          sortable: false,
          width: "15%"
        },
        {
          text: "Edit",
          align: "center",
          sortable: false,
          width: "5%"
        },
        {
          text: "Delete",
          align: "center",
          sortable: false,
          width: "5%"
        }]
    }),
    mounted: function () {
      this.get_settings_list()
    },
    methods: {
      get_settings_list() {
        Vue.axios
          .get(this.$store.getters.server_url + "/settings", {
            params: {
              action: "get_list"
            }
          })
          .then(response => {
            this.loaded = true;
            this.settings = response.data[0];
            console.log(this.settings)
          })
          .catch(error => {
            this.$refs.snackbar.update("Error: "+error, "error", 5000);
          });
      },
      edit_setting(item) {
        this.$refs.settingmodal.open(item)
      },
      create_setting() {
        this.$refs.settingmodal.open()
      },
      delete_setting(item) {
        this.$refs.deletesettingmodal.show(item)
      }
    }
  };
</script>

