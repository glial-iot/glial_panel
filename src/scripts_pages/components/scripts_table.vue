<template lang="html">
  <div>
    <v-card class="elevation-3">
      <v-card-title class="py-0 px-0">
        <v-select v-show="loaded" class="tags_selector ml-4 mt-4" return-object dense v-model="tag_selected"
                  :items="tags" flat label="Select a tag to filter the scripts"></v-select>
        <v-spacer></v-spacer>
        <create-script-modal class="mr-3" @create_error="$refs.snackbar.update('Create script: error')"
                             @data_updated="table_update()" :type="type"></create-script-modal>
        <load-script-modal @load_script_error="$refs.snackbar.update('Load script: error')"
                           @script_loaded="table_update()" :type="type"></load-script-modal>
      </v-card-title>
      <v-divider></v-divider>

      <v-data-table class="no-scroll" v-if="loaded" :headers="headers" :items="scripts_table" hide-actions
                    no-data-text="No scripts">

        <template slot="items" slot-scope="props">
          <tr :key="props.item.uuid">
            <td class="text-xs-center">
              <div :title="props.item.status_msg">
                <icon-normal v-show="props.item.status == 'NORMAL'">fa-check-circle</icon-normal>
              </div>
              <div :title="props.item.status_msg">
                <icon-warning v-show="props.item.status == 'WARNING'">fa-exclamation-circle</icon-warning>
              </div>
              <div :title="props.item.status_msg">
                <icon-error v-show="props.item.status == 'ERROR'">fa-times-circle</icon-error>
              </div>
              <div :title="props.item.status_msg">
                <icon-stopped v-show="props.item.status == 'STOPPED'">fa-dot-circle</icon-stopped>
              </div>
            </td>

            <td class="text-xs-left ellipsis" :title="props.item.name">
              {{ props.item.name }}
            </td>

            <td class="text-xs-left script_object_cell"
                @click="$refs.change_object.show(props.item.uuid, props.item.object, props.item.type)">
              <div v-if="type === 'WEB_EVENT'" class="ellipsis">
                        <span>
                           <a :href="$store.getters.server_url+'/we/'+props.item.object" target="_blank"
                              style="text-decoration: none">
                              <span class="grey--text">/we/</span><span class="black--text">{{props.item.object}}</span>
                           </a>
                        </span>
              </div>
              <div v-if="type !== 'WEB_EVENT' && type !== 'TIMER_EVENT'" class="ellipsis">
                {{ props.item.object }}
              </div>

              <div v-if="type == 'TIMER_EVENT'" class="ellipsis">
                {{ props.item.object }} seconds
              </div>

            </td>

            <td class="text-xs-left ellipsis script_tag_cell" :title="props.item.tag"
                @click="$refs.change_tag.show(props.item.uuid, props.item.tag, props.item.type)">
              {{ props.item.tag}}
            </td>

            <td class="justify-center text-xs-center button-sm">
              <button-info title="Show scripts info" @click.native="$refs.scriptdetails.show(props.item)"></button-info>
            </td>

            <td class="justify-center text-xs-center button-sm">
              <button-copy title="Copy script" @click.native="$refs.copyscript.show(props.item)"></button-copy>
            </td>

            <td class="justify-center text-xs-center button-sm">
              <button-save title="Save script" @click.native="save_script(props.item)"></button-save>
            </td>

            <td v-if="type === 'BUS_EVENT'" class="justify-center text-xs-center button-sm">
              <button-rocket title="Run script once" @click.native="run_script(props.item)"></button-rocket>
            </td>

            <td class="justify-center text-xs-center button-sm">
              <button-activate :flag="props.item.active_flag"
                               @click.native="script_active_change(props.item, props.item.active_flag)"></button-activate>
            </td>

            <td class="justify-center text-xs-center button-sm">
              <button-edit title="Edit script" @click.native="script_edit(props.item)"></button-edit>
            </td>

            <td class="justify-center text-xs-center button-sm">
              <button-trash title="Delete script" @click.native="$refs.remove_modal.show(props.item)"></button-trash>
            </td>
          </tr>
        </template>

      </v-data-table>

      <v-divider></v-divider>

      <v-card-title class="py-0 px-0 small_title">
        <v-spacer></v-spacer>
        <span class="body-2 mx-4 grey--text"> Scripts: {{scripts_table.length}} </span>
      </v-card-title>

    </v-card>
    <snackbar ref="snackbar"></snackbar>
    <script-details-modal ref="scriptdetails"></script-details-modal>
    <copy-script-modal @copy_error="$refs.snackbar.update('Copy script: error')" @copy_successful="table_update()"
                       ref="copyscript"></copy-script-modal>
    <confirm-remove-script-modal ref="remove_modal" :update="table_update"></confirm-remove-script-modal>
    <change-object-modal ref="change_object"></change-object-modal>
    <change-tag-modal ref="change_tag" @tags_error="$refs.snackbar.update('Tags update: error')"
                      @tags_updated="$refs.snackbar.update('Tags updated', 'success', 2000); table_update()"></change-tag-modal>
  </div>
</template>


<script>
  import Vue from "vue";

  import Axios from "axios";
  import VueAxios from "vue-axios";

  Vue.use(VueAxios, Axios);

  import VueTimers from "vue-timers";

  Vue.use(VueTimers);

  import createScriptModal from "../../components/modals/create_script_modal.vue";
  import copyScriptModal from "../../components/modals/copy_script_modal.vue";
  import loadScriptModal from "../../components/modals/load_script_modal.vue";
  import scriptDetailsModal from "../../components/modals/script-details-modal.vue";
  import snackbar from "../../components/snackbar.vue";
  import buttonInfo from "../../components/buttons/button-info.vue";
  import buttonSave from "../../components/buttons/button-save.vue";
  import buttonCopy from "../../components/buttons/button-copy.vue";
  import buttonEdit from "../../components/buttons/button-edit.vue";
  import buttonActivate from "../../components/buttons/button-activate.vue";
  import buttonRocket from "../../components/buttons/button-rocket.vue";
  import buttonTrash from "../../components/buttons/button-trash.vue";
  import buttonSync from "../../components/buttons/button-sync.vue";
  import iconError from "../../components/icons/icon-status-error.vue";
  import iconNormal from "../../components/icons/icon-status-normal.vue";
  import iconStopped from "../../components/icons/icon-status-stopped.vue";
  import iconWarning from "../../components/icons/icon-status-warning.vue";
  import confirmRemoveScriptModal from "../../components/modals/confirm-remove-script-modal.vue";
  import changeObjectModal from "../../components/modals/change-object-modal";
  import changeTagModal from "../../components/modals/change-tag-modal";

  export default {
    components: {
      createScriptModal,
      copyScriptModal,
      loadScriptModal,
      scriptDetailsModal,
      snackbar,
      buttonInfo,
      buttonSave,
      buttonCopy,
      buttonRocket,
      buttonActivate,
      buttonEdit,
      buttonTrash,
      buttonSync,
      iconError,
      iconNormal,
      iconStopped,
      iconWarning,
      confirmRemoveScriptModal,
      changeObjectModal,
      changeTagModal
    },
    data: () => ({
      headers: [],
      scripts_table: [],
      tags: [],
      tag_selected: localStorage.tag_selected ?
        {text: localStorage.tag_selected, value: localStorage.tag_selected} :
        {text: "All scripts", value: ""},
      loaded: false
    }),
    props: ["type"],

    timers: {
      table_update: {
        autostart: true,
        repeat: true,
        time: 1000
      }
    },

    beforeRouteLeave(to, from, next) {
      this.$timer.stop("table_update");
      next();
    },
    watch: {
      tag_selected(new_tag) {
        localStorage.tag_selected = new_tag.value;
        this.table_update();
      }
    },
    mounted: function () {
      this.table_update();
      this.headers = [
        {
          text: "Status",
          align: "center",
          sortable: false,
          width: "7%"
        },
        {
          text: "Name",
          value: "name",
          align: "left"
        },
        {
          text: this.$options.filters.object_label(this.type),
          value: "object",
          align: "left",
          width: "15%"
        },
        {
          text: "Tag",
          value: "tag",
          align: "left",
          width: "20%"
        },
        {
          text: "Info",
          align: "center",
          sortable: false,
          width: "5%"
        },
        {
          text: "Copy",
          align: "center",
          sortable: false,
          width: "5%"
        },
        {
          text: "Save",
          align: "center",
          sortable: false,
          width: "5%"
        },
        {
          text: "Run",
          sortable: false,
          align: "center",
          width: "5%"
        },
        {
          text: "Activate",
          sortable: false,
          align: "center",
          width: "5%"
        },
        {
          text: "Edit",
          sortable: false,
          align: "center",
          width: "5%"
        },
        {
          text: "Delete",
          sortable: false,
          align: "center",
          width: "5%"
        }
      ];

      if (this.type !== "BUS_EVENT") {
        this.headers = this.headers.filter(item => item.text !== "Run");
      }
    },

    methods: {
      script_edit(table_item) {
        this.$router.push({
          path: this.$route.path+"/editor",
          query: {uuid: table_item.uuid, type: table_item.type}
        });
      },
      script_active_change(table_item, current_flag) {
        let to_set_flag = "";
        current_flag === "ACTIVE"
          ? (to_set_flag = "NON_ACTIVE")
          : (to_set_flag = "ACTIVE");
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: {
                action: "update",
                uuid: table_item.uuid,
                active_flag: to_set_flag
              }
            }
          )
          .then(response => {
            this.table_update();
            this.$refs.snackbar.update("");
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Active change error");
          });
      },
      tags_update() {
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: {
                action: "get_tags"
              }
            }
          )
          .then(response => {
            this.tags = [];
            response.data.forEach((tag, i) => {
              this.tags[i] = {
                text: tag,
                value: tag
              };
            });
            this.tags.unshift({
              text: "All scripts",
              value: ""
            });
          })
          .catch(error => {
            console.log(error);
          });
      },
      table_update() {
        let request_params = {
          action: "get_list"
        };
        if (this.tag_selected.value && this.tag_selected.value !== "") {
          request_params.tag = this.$base64.encode(this.tag_selected.value)
        }
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: request_params
            }
          )
          .then(response => {
            Vue.set(this, "scripts_table", response.data);
            this.loaded = true;
            this.$refs.snackbar.update("");
          })
          .catch(error => {
            console.log(error);
            this.scripts_table = [];
            this.$refs.snackbar.update("Get script list error");
            this.loaded = false;
          });
        this.tags_update()
      },
      run_script(table_item) {
        Vue.axios
          .get(this.$store.getters.server_url + "/busevents", {
            params: {
              action: "run_once",
              uuid: table_item.uuid
            }
          })
          .then(response => {
            if (response.data.error_msg) {
              throw new Error(response.data.error_msg);
            }

            this.$refs.snackbar.update("");
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Run script error");
          });
      },
      save_script(table_item) {
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: {
                action: "get",
                uuid: table_item.uuid
              }
            }
          )
          .then(response => {
            let scriptJSON = {
              name: response.data.name,
              type: response.data.type,
              object: response.data.object,
              body: response.data.body,
              tag: response.data.tag,
              comment: response.data.comment
            };
            let scriptStr =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(JSON.stringify(scriptJSON));
            let downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", scriptStr);
            downloadAnchorNode.setAttribute(
              "download",
              response.data.type + "_" + response.data.name + ".gs.json"
            );
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Error: Can't save script");
          });
      }
    }
  };
</script>
