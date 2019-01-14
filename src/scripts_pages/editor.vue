<template>
  <div>
    <v-card class="elevation-3">
      <v-card-title id="editor-card-title" class="py-1 px-1">
        <div class="text-xs-left">
          <v-btn :small="true" @click.native="$router.go(-1)" title="Go to script list">
            <v-icon left small>fa-arrow-left</v-icon>
            Back
          </v-btn>
        </div>

        <v-spacer></v-spacer>
        <div class=".display-1 pointer" title="Click to edit name" @click="$refs.rename.show(uuid, type, name)">
          {{$options.filters.type2string(type)}} "
          <span class="ellipsis">{{name}}</span>"
        </div>
        <v-spacer></v-spacer>
        <div v-if="type != 'DRIVER'" class=".display-1 pointer"
             :title="`Click to edit ${$options.filters.object_label(type).toLowerCase()}`"
             @click="$refs.change_object.show(uuid, object, type)"> {{$options.filters.object_label(type)}} "
          <span class="ellipsis">{{object}}</span>"
        </div>
        <v-spacer></v-spacer>

        <div class="text-xs-left buttons">
          <v-btn :small="true" v-show="active_flag == 'NON_ACTIVE'" title="Active"
                 @click="script_active_change('ACTIVE')">
            <v-icon color="green" left small>fa-play-circle</v-icon>
            Activate
          </v-btn>
          <v-btn :small="true" v-show="active_flag == 'ACTIVE'" title="Non-active"
                 @click="script_active_change('NON_ACTIVE')">
            <v-icon color="red" left small>fa-stop-circle</v-icon>
            Deactivate
          </v-btn>
          <v-btn v-if="type === 'BUS_EVENT'" :small="true" @click.native="run_script" title="Run once">
            <v-icon left small>fa-rocket</v-icon>
            Run
          </v-btn>
          <v-btn :small="true" @click.native="save_script" title="Save script">
            <v-icon left small>fa-cloud-upload-alt</v-icon>
            Save
          </v-btn>
          <v-btn :small="true" @click.native="toggle_logs_visible" title="Show/hide logs window">
            <v-icon left small>fa-file-alt</v-icon>
            {{logs_visible ? "Hide Logs" : "Show Logs"}}
          </v-btn>
          <div class="logs-size-block">
            <v-btn :small="true" class="logs-buttons" @click="change_logs_size('+')" v-if="logs_visible"
                   title="Increase logs windows size">
              <v-icon :size="11">fa-arrow-up</v-icon>
            </v-btn>
            <v-btn :small="true" class="logs-buttons" @click="change_logs_size('-')" v-if="logs_visible"
                   title="Decrease logs windows size">
              <v-icon :size="11">fa-arrow-down</v-icon>
            </v-btn>
          </div>

          <v-btn :small="true" @click.native="$refs.help.show()" title="Show glue scripts help">
            <v-icon left small>fa-question-circle</v-icon>
            Help
          </v-btn>
        </div>

      </v-card-title>
      <v-divider></v-divider>

      <div id="app">
        <v-flex xs12>
          <editor :content="content" v-on:content-update="update_content" :lang="lang" theme="crimson_editor"
                  :height="editor_height()"></editor>
        </v-flex>
      </div>
    </v-card>

    <small-logs-table :type="'editor'" :uuid="uuid"></small-logs-table>

    <snackbar ref="snackbar"></snackbar>
    <editor-help-modal ref="help"></editor-help-modal>
    <rename-script-modal ref="rename" :updateName="update_name"></rename-script-modal>
    <change-object-modal ref="change_object" :updateObject="update_object"></change-object-modal>
    <confirm-leave-modal ref="confirm_leave"></confirm-leave-modal>

  </div>
</template>

<script>
  import Vue from "vue";
  import Axios from "axios";
  import VueAxios from "vue-axios";

  Vue.use(VueAxios, Axios);
  import VueTimers from "vue-timers";

  Vue.use(VueTimers);
  import {mapState} from "vuex";

  import snackbar from "../components/snackbar.vue";
  import editorHelpModal from "../components/modals/editor-help-modal.vue";
  import confirmLeaveModal from "../components/modals/confirm-leave.vue";
  import renameScriptModal from "../components/modals/rename-script-modal.vue";
  import changeObjectModal from "../components/modals/change-object-modal.vue";
  import smallLogsTable from "../components/small_logs_table";
  import buttonInfo from "../components/buttons/button-info.vue";
  import editor from "../brace/index.js";
  import "brace/mode/lua";
  import "brace/mode/html";
  import "brace/theme/crimson_editor";

  export default {
    data: () => ({
      lang: "lua",
      content: "",
      uuid: "",
      saved: true,
      loaded: false,
      name: "",
      object: "",
      type: "",
      active_flag: "",
      prev_content: ""
    }),
    components: {
      smallLogsTable,
      editor,
      snackbar,
      editorHelpModal,
      renameScriptModal,
      changeObjectModal,
      confirmLeaveModal,
      buttonInfo
    },
    computed: mapState({
      logs_visible: state => state.logs_visible,
      editor_log_size: state => state.editor_log_size
    }),
    mounted: function () {
      window.addEventListener("resize", this.$forceUpdate());
      let self = this;
      document.addEventListener(
        "keydown",
        function (e) {
          if (
            e.keyCode === 83 &&
            (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
          ) {
            e.preventDefault();
            self.save_script();
          }
        },
        false
      );
      document.getElementsByClassName("ace_text-input")[0].focus();
    },
    beforeDestroy: function () {
      window.removeEventListener("resize", this.$forceUpdate());
    },
    beforeRouteEnter(to, from, next) {
      if (
        Object.keys(to.query).length !== 0 &&
        to.query.uuid !== undefined &&
        to.query.type !== undefined
      ) {
        next(vm => {
          vm.uuid = to.query.uuid;
          vm.type = to.query.type;
        });
      }
      next();
    },
    beforeRouteLeave(to, from, next) {
      if (!this.saved) {
        this.$refs.confirm_leave.dialog().then(result => {
          if (result === "save") {
            this.save_script();
            setTimeout(() => {
              next();
            }, 1000);
          } else if (result === "discard") {
            next();
          } else {
            next(false);
          }
        });
      } else {
        next();
      }
    },
    methods: {
      toggle_logs_visible: function () {
        this.$store.commit("logs_visible", !this.logs_visible);
      },
      update_content: function (content) {
        if (this.prev_content !== content) {
          this.prev_content = content;
        }
      },
      save_script: function (mode, reload_type) {
        let reload = "";
        if (reload_type === "none") {
          reload = "reload=none&";
        }
        let data = new Blob([this.prev_content], {
          type: "text/plain"
        });
        let reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = () => {
          Vue.axios
            .post(
              this.$store.getters.server_url +
              this.$store.state.endpoints[this.type] +
              "?" +
              reload +
              "action=update_body&uuid=" +
              this.uuid,
              reader.result
            )
            .then(response => {
              if (mode !== "silent") {
                this.$refs.snackbar.update("Script saved", "success", 3000);
              }
              this.saved = true;
            })
            .catch(error => {
              this.$refs.snackbar.update("Script not saved");
              console.log(error);
            });
        };
      },
      load_script: function () {
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: {
                action: "get",
                uuid: this.uuid
              }
            }
          )
          .then(response => {
            this.active_flag = response.data.active_flag;
            this.content = response.data.body;
            this.prev_content = response.data.body;
            this.name = response.data.name;
            this.object = response.data.object;
            this.type = response.data.type;
            this.saved = true;
            this.loaded = true;
          })
          .catch(error => {
            this.content = "";
            this.$refs.snackbar.update("Load script: network error");
          });
      },
      script_active_change(flag) {
        if (flag === "ACTIVE") {
          this.save_script("silent", "none");
        }
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: {
                action: "update",
                uuid: this.uuid,
                active_flag: flag
              }
            }
          )
          .then(response => {
            this.active_flag = flag;
            if (flag === "ACTIVE") {
              this.$refs.snackbar.update(
                "Script saved and activated",
                "success",
                1500
              );
            } else {
              this.$refs.snackbar.update("Script deactivated", "success", 1500);
            }
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Active change error");
          });
      },
      run_script() {
        let script_saved = false;
        if (this.prev_content !== this.content) {
          this.save_script("silent", "none");
          script_saved = true;
        }
        Vue.axios
          .get(this.$store.getters.server_url + "/busevents", {
            params: {
              action: "run_once",
              uuid: this.uuid
            }
          })
          .then(response => {
            if (response.data.error_msg) {
              throw new Error(response.data.error_msg);
            }
            script_saved
              ? this.$refs.snackbar.update(
              "Script was saved and run once!",
              "success",
              2000
              )
              : this.$refs.snackbar.update(
              "Script was run once!",
              "success",
              2000
              );
          })
          .catch(error => {
            console.log(error);
            this.$refs.snackbar.update("Run script error");
          });
      },
      editor_height: function () {
        const header_height = document.querySelector("nav.v-toolbar")
          ? document.querySelector("nav.v-toolbar").offsetHeight
          : 48;
        const editor_title_height = document.querySelector("#editor-card-title")
          ? document.querySelector("#editor-card-title").offsetHeight
          : 56;
        const logs_height =
          document.querySelector("#logs-card") &&
          document.querySelector("#logs-card").offsetHeight > 51
            ? document.querySelector("#logs-card").offsetHeight + 12
            : 217;
        const content_padding = 24;
        let height =
          window.innerHeight -
          (header_height + editor_title_height + content_padding);

        if (this.logs_visible) {
          height = height - logs_height;
        }

        return `${height}px`;
      },
      change_logs_size(dir) {
        let action = "increase_editor_log_size";
        if (dir === "-") {
          action = "decrease_editor_log_size";
        }
        this.$store.dispatch(action);
      },
      update_name(value) {
        this.name = value;
      },
      update_object(value) {
        this.object = value;
      }
    },
    watch: {
      uuid: function (uuid) {
        this.uuid = uuid;
        this.load_script();
      },
      prev_content: function (value, oldValue) {
        if (value !== oldValue) {
          this.saved = false;
        }
      },
      saved: function (value) {
        if (value) {
          window.onbeforeunload = null;
        } else {
          window.onbeforeunload = function (e) {
            var dialogText =
              "Do you really want to leave? You have unsaved changes!";
            e.returnValue = dialogText;
            return dialogText;
          };
        }
      },
      loaded: function (value, oldValue) {
        if (!oldValue && value) {
          this.saved = true;
        }
      },
    }
  };
</script>

<style scoped>

  .logs-title h3 {
    font-weight: normal;
  }

  .logs-size-block {
    display: inline-flex;
    flex-direction: column;
  }

  .logs-buttons {
    min-width: auto;
    height: auto;
    margin: 2px;
  }

  .buttons {
    display: flex;
    align-items: center;
  }

  .pointer {
    cursor: pointer;
    display: flex;
  }

  .ellipsis {
    display: block;
    max-width: 16ch;
  }

</style>
