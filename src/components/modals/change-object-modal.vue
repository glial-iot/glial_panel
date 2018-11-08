<template lang="html">
   <div>
      <v-dialog v-on:keydown.esc="hide()" v-on:keydown.enter="submit()" :value="visible" persistent max-width="420">
         <v-card>
            <v-card-title class="headline">Change script {{$options.filters.object_label(type).toLowerCase()}}
            </v-card-title>
            <v-card-text>
               <v-text-field autofocus v-if="visible" v-model="object" @keyup="$refs.matchingTopicsList.get_mask_match()"
                             :label="`Change ${$options.filters.object_label(type).toLowerCase()}`"
                             required></v-text-field>
            </v-card-text>
            <bus-event-shortcuts class="pt-0" v-if="type === 'BUS_EVENT'" v-on:set_object="object = $event; $refs.matchingTopicsList.get_mask_match()"></bus-event-shortcuts>
            <matching-topics-list ref="matchingTopicsList" :mask="object" v-if="type === 'BUS_EVENT'"></matching-topics-list>
            <timer-event-shortcuts class="pt-0" v-if="type === 'TIMER_EVENT'" v-on:set_object="object = $event"></timer-event-shortcuts>
            <schedule-event-shortcuts class="pt-0" v-if="type === 'SHEDULE_EVENT'" v-on:set_object="object = $event"></schedule-event-shortcuts>
            <schedule-event-crontab-description class="pt-0" v-if="type === 'SHEDULE_EVENT'"></schedule-event-crontab-description>
            <web-event-shortcuts v-on:set_by_script_name="object = $parent.name" v-if="type === 'WEB_EVENT'"></web-event-shortcuts>
            <v-card-text v-if="type === 'WEB_EVENT'">
               <span>Full script URL:
                  <a :href="$store.getters.server_url+'/we/'+object" target="_blank">{{$store.getters.server_url}}/we/{{object || "endpoint"}}</a>
               </span>
            </v-card-text>
            <v-card-actions>
               <v-btn color="error" flat @click="hide()">Cancel</v-btn>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" flat @click="submit()">Change</v-btn>
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
  props: ["updateObject"],
  data: () => ({
    object: "",
    uuid: "",
    type: "",
    visible: false,
    mask_topics: []
  }),
  methods: {
    show(uuid, object, type) {
      this.uuid = uuid;
      this.object = object;
      this.type = type;
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.object = "";
      this.uuid = "";
      this.type = "";
      this.mask_topics = [];
    },
    submit() {
        console.log(this.type);
        console.log(this.$store.state.endpoints[this.type]);
      Vue.axios
        .get(
          this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
          {
            params: {
              action: "update",
              uuid: this.uuid,
              object: btoa(this.object)
            }
          }
        )
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