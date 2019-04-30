<template lang="html">
  <div>
    <v-dialog v-on:keydown.esc="close()" v-on:keydown.enter="set_setting()" v-model="dialog_visible"
              max-width="500px">
      <v-card>
        <v-card-title>
          <div class="title text-xs-center">Create/Modify setting</div>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="py-0">
          <v-text-field autofocus v-if="dialog_visible" label="Name" v-model="name"></v-text-field>
        </v-card-text>

        <v-card-text class="py-0">
          <v-text-field v-if="dialog_visible" label="Value" v-model="value"></v-text-field>
        </v-card-text>

        <v-card-text class="py-0">
          <v-text-field v-if="dialog_visible" label="Description" v-model="description"></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" flat @click.stop="close">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" right flat @click="set_setting()">
            <v-icon left small>fa-check</v-icon>
            Done
          </v-btn>
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
  import snackbar from "../snackbar.vue";

  Vue.use(VueAxios, Axios);
  import busEventShortcuts from "../blocks/shortcuts/bus_event_shortcuts.vue";
  import timerEventShortcuts from "../blocks/shortcuts/timer_event_shortcuts.vue";
  import scheduleEventShortcuts from "../blocks/shortcuts/schedule_event_shortcuts.vue";
  import webEventShortcuts from "../blocks/shortcuts/web_event_shortcuts.vue";
  import scheduleEventCrontabDescription from "../blocks/misc/schedule-event-crontab-description.vue";
  import matchingTopicsList from "../blocks/misc/matching-topics-list.vue";

  export default {
    components: {
      snackbar,
      busEventShortcuts,
      timerEventShortcuts,
      scheduleEventShortcuts,
      scheduleEventCrontabDescription,
      webEventShortcuts,
      matchingTopicsList
    },
    data() {
      return {
        dialog_visible: false,
        name: ""
      };
    },
    methods: {
      close() {
        this.name = "";
        this.value = "";
        this.description = "";
        this.dialog_visible = false;
      },
      open(item) {
        this.name = item ? item.setting_name : "";
        this.value = item ? item.setting_value : "";
        this.description = item ? item.setting_description : "";
        this.dialog_visible = true;
      },
      set_setting(action) {
        Vue.axios
          .get(this.$store.getters.server_url + "/settings", {
            params: {
              action: "set",
              name: this.name,
              value: this.$base64.encode(this.value),
              description: this.$base64.encode(this.description)
            }
          })
          .then(response => {
            this.$refs.snackbar.update("Setting set successfully", "success", 5000);
            this.close();
            this.$parent.get_settings_list();
          })
          .catch(error => {
            this.$refs.snackbar.update(response.data.error_msg, "error", 5000);
          });
      }
    }
  };
</script>
