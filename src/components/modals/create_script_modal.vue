<template lang="html">
   <div>
      <v-btn right color="secondary" class="my-2" @click="dialog_visible = true">
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
               <v-text-field @keyup="get_mask_match()" :label="$options.filters.object_label(type)" v-model="object"></v-text-field>
            </v-card-text>
            <bus-event-shortcuts class="pt-0" v-if="type === 'BUS_EVENT'" v-on:set_object="object = $event; get_mask_match()"></bus-event-shortcuts>
            <v-card-text class="matching_topics_list pt-0" v-if="type === 'BUS_EVENT'">
               <h4 class="matching_topics_header">Matching topics: </h4>
               <div class="matching_topic" v-for="item in mask_topics">
                  {{item.topic}}
               </div>
               <div class="matching_topic" v-if="Object.keys(mask_topics).length === 0" >No match</div>
            </v-card-text>
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

export default {
  components: {
    snackbar,
    busEventShortcuts,
    timerEventShortcuts,
    scheduleEventShortcuts,
    scheduleEventCrontabDescription,
    webEventShortcuts
  },
  data() {
    return {
      dialog_visible: false,
      name: "",
      object: "",
      mask_topics: []
    };
  },
  props: ["type"],
  methods: {
    close() {
      this.name = "";
      this.object = "";
      this.dialog_visible = false;
      this.mask_topics = [];
    },
      get_mask_match() {
          if (this.object !== "" && this.$props.type === "BUS_EVENT") {
              Vue.axios
                  .get(
                      "http://localhost:8080/system_bus",
                      {
                          params: {
                              action: "get_bus",
                              limit: 10,
                              mask: btoa(this.object)
                          }
                      }
                  )
                  .then(response => {
                      if(response.data.length > 0) {
                          this.mask_topics = response.data;
                      }
                      else {
                          this.mask_topics = [];
                      }

                  })
                  .catch(error => {
                      this.mask_topics = [];
                      console.log(error);
                  });
          }
          else {
              this.mask_topics = [];
          }
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
          name: this.name
        };
      } else {
        params = {
          action: "create",
          name: this.name,
          object: this.object
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
