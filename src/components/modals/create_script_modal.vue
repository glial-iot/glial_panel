<template lang="html">
   <div>
      <v-btn v-if="visual !== 'none'" color="secondary" class="my-2" @click="dialog_visible = true">
         <v-icon left small>fa-file</v-icon> Create {{$options.filters.type2string(type)}}
      </v-btn>

      <v-dialog v-on:keydown.esc="close()" v-on:keydown.enter="create_script()" v-model="dialog_visible" max-width="500px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Create new {{$options.filters.type2string(type).toLowerCase()}}</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-0">
               <v-text-field autofocus v-if="dialog_visible" label="Name" v-model="name"></v-text-field>
            </v-card-text>
            <v-card-text v-if="type != 'DRIVER'" class="py-0">
               <v-text-field @keyup="$refs.matchingTopicsList.get_mask_match()" :label="$options.filters.object_label(type)" v-model="object"></v-text-field>
            </v-card-text>
            <bus-event-shortcuts class="pt-0" v-if="type === 'BUS_EVENT'" v-on:set_object="object = $event; $refs.matchingTopicsList.get_mask_match()"></bus-event-shortcuts>
            <matching-topics-list ref="matchingTopicsList" :mask="object" v-if="type === 'BUS_EVENT'"></matching-topics-list>
            <timer-event-shortcuts class="pt-0" v-if="type === 'TIMER_EVENT'" v-on:set_object="object = $event"></timer-event-shortcuts>
            <schedule-event-shortcuts class="pt-0" v-if="type === 'SHEDULE_EVENT'" v-on:set_object="object = $event"></schedule-event-shortcuts>
            <schedule-event-crontab-description class="pt-0" v-if="type === 'SHEDULE_EVENT'"></schedule-event-crontab-description>
            <web-event-shortcuts v-on:set_by_script_name="object = name" v-if="type === 'WEB_EVENT'"></web-event-shortcuts>
            <v-card-text v-if="type === 'WEB_EVENT'">
               <span>Full script URL:
                  <a :href="$store.getters.server_url+'/we/'+object" target="_blank">{{$store.getters.server_url}}/we/{{object || "endpoint"}}</a>
               </span>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="error" flat @click.stop="close">Close</v-btn>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" right flat @click="create_script()">
                  <v-icon left small>fa-file</v-icon> Create </v-btn>
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
      name: "",
      object: "",
      mask_topics: []
    };
  },
  props: ["type", "visual"],
  methods: {
    close() {
      this.name = "";
      this.object = "";
      this.dialog_visible = false;
      this.mask_topics = [];
    },
    open(item) {
        this.name = "";
        this.object = item.topic;
        this.dialog_visible = true;
        this.mask_topics = [];
        this.$refs.matchingTopicsList.get_mask_match(item.topic);
    },
    create_script() {
      let params = {};

      if (this.type !== "DRIVER" && this.object === "") {
        this.$refs.snackbar.update(
          `Field "${this.$options.filters.object_label(this.type)}" is required`
        );
        return;
      }

      if (this.type === "DRIVER") {
        params = {
          action: "create",
          name: this.$base64.encode(this.name)
        };
      } else {
        params = {
          action: "create",
          name: this.$base64.encode(this.name),
          object: this.$base64.encode(this.object)
        };
      }

      Vue.axios
        .get(
          this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
          { params }
        )
        .then(response => {
          this.$emit("data_updated", this.item);
          this.dialog_visible = false;
          this.name = "";
        })
        .catch(error => {
          console.log(error);
          this.$emit("create_error");
        });
    }
  }
};
</script>
