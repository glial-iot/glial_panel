<template lang="html">
   <div>
      <v-dialog v-on:keydown.esc="hide()" v-on:keydown.enter="submit()" :value="visible" persistent max-width="420">
         <v-card>
            <v-card-title class="headline">Change script {{$options.filters.object_label(type).toLowerCase()}}
            </v-card-title>
            <v-card-text>
               <v-text-field autofocus v-if="visible" v-model="object" v-on:input="get_mask_match()" v-on:change="object_keyup()"
                             :label="`Change ${$options.filters.object_label(type).toLowerCase()}`"
                             required></v-text-field>
            </v-card-text>
            <v-card-text class="pt-0" v-if="type === 'BUS_EVENT'">
               <a title="Set mask to select all topics" class="pt-1 pr-1 pb-1" href="#" @click="set_object('.+')">All topics</a>
               <a title="Set mask to filter only topics containing 'test'" class="pa-1" href="#" @click="set_object('.+test.+')">All topics with 'test'</a>
            </v-card-text>
            <v-card-text class="matching_topics_list pt-0" v-if="type === 'BUS_EVENT'">
               <h4 class="matching_topics_header">Matching topics: </h4>
               <div class="matching_topic" v-for="item in mask_topics">
                  {{item.topic}}
               </div>
               <div class="matching_topic" v-if="Object.keys(mask_topics).length === 0" >No match</div>
            </v-card-text>
            <v-card-text class="pt-0" v-if="type === 'WEB_EVENT'">
               <a title="Set endpoint name equal to script name" class="pt-1 pr-1 pb-1" href="#" @click="set_object()">By the script name</a>
            </v-card-text>
            <v-card-text v-if="type === 'WEB_EVENT'">
               <span>Full script URL:
                  <a :href="$store.getters.server_url+'/we/'+object" target="_blank">{{$store.getters.server_url}}/we/{{object || "endpoint"}}</a>
               </span>
            </v-card-text>
            <v-card-text class="pt-0" v-if="type === 'TIMER_EVENT'">
               <a title="Set interval to 1 second" class="pt-1 pr-1 pb-1" href="#" @click="set_object('1')">Every second</a>
               <a title="Set interval to 10 seconds" class="pa-1" href="#" @click="set_object('10')">Every 10 seconds</a>
            </v-card-text>
            <v-card-text class="pt-0" v-if="type === 'SHEDULE_EVENT'">
               <a title="Set schedule to run script every hour" class="pt-1 pr-1 pb-1" href="#" @click="set_object('0 0 * * * *')">Every hour</a>
               <a title="Set schedule to run script every 30 minutes" class="pa-1" href="#" @click="set_object('0 0 30 * * * *')">Every 30 minutes</a>
            </v-card-text>
            <v-card-text class="pt-0" v-if="type === 'SHEDULE_EVENT'">
               <code class="cron-code font-weight-thin">
                  * * * * * *
                  │ │ │ │ │ └── Day of the Week
                  │ │ │ │ │ (SUN-SAT or 0-6 or "*")
                  │ │ │ │ └──── Month of the Year
                  │ │ │ │ (JAN-DEC or 1-12 or "*")
                  │ │ │ └────── Day of the Month
                  │ │ │ (0-30 or "*")
                  │ │ └──────── Hour (0-24 or "*")
                  │ └────────── Minute (0-59 or "*")
                  └──────────── Second (0-59)
               </code><br>
               <span>Schedule in a unix-like <a href="https://en.wikipedia.org/wiki/Cron"
                                                target="_blank">cron format</a> with seconds.</span>
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

export default {
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
      this.get_mask_match();
    },
    hide() {
      this.visible = false;
      this.object = "";
      this.uuid = "";
      this.type = "";
      this.mask_topics = [];
    },
    set_object(value){
        if (this.type === "WEB_EVENT") {
            this.object = this.$parent.name;
        }else {
            this.object = value;
        }
        this.get_mask_match();
    },
    get_mask_match() {
        console.log("hit");
        if (this.object !== "" && this.type === "BUS_EVENT") {
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
              object: this.object
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