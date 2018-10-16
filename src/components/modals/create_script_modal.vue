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
            <v-card-text class="pt-0" v-if="type === 'BUS_EVENT'">
               <a title="Set mask to select all topics" class="pt-1 pr-1 pb-1" href="#" @click="set_object('.+')">All topics</a>
               <a title="Set mask to filter only topics containing 'test'" class="pa-1" href="#" @click="set_object('.+test.+')">All topics with 'test'</a>
            </v-card-text>
            <v-card-text v-if="type === 'BUS_EVENT'">
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
            <v-card-text v-if="type === 'SHEDULE_EVENT'" class="pt-0">
               <code class="cron-code font-weight-thin">
   * * * * * *
   │ │ │ │ │ │
   │ │ │ │ │ └── Day of the Week (SUN-SAT or 0-6 or "*")
   │ │ │ │ └──── Month of the Year (JAN-DEC or 1-12 or "*")
   │ │ │ └────── Day of the Month (0-30 or "*")
   │ │ └──────── Hour (0-24 or "*")
   │ └────────── Minute (0-59 or "*")
   └──────────── Second (0-59)
               </code><br>
               <span>Schedule in a unix-like <a href="https://en.wikipedia.org/wiki/Cron" target="_blank">cron format</a> with seconds.</span>
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

export default {
  components: {
    snackbar
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
    set_object(value){
        if (this.type === "WEB_EVENT") {
            this.object = this.name;
        }else {
            this.object = value;
        }
        this.get_mask_match();
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
