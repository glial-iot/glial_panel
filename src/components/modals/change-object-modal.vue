<template lang="html">
   <div>
      <v-dialog :value="visible" persistent max-width="310">
         <v-card>
            <v-card-title class="headline">Change script {{$options.filters.object_label(type).toLowerCase()}}</v-card-title>
            <v-card-text>
               <v-text-field autofocus v-if="visible" v-model="object" :label="`Change ${$options.filters.object_label(type).toLowerCase()}`" required></v-text-field>
            </v-card-text>
            <v-card-text v-if="type === 'SHEDULE_EVENT'" class="pt-0">
               <code class="cron-code font-weight-thin">
   * * * * * *
   │ │ │ │ │ └── Day of the Week
   │ │ │ │ │     (SUN-SAT or 0-6 or "*")
   │ │ │ │ └──── Month of the Year
   │ │ │ │       (JAN-DEC or 1-12 or "*")
   │ │ │ └────── Day of the Month
   │ │ │         (0-30 or "*")
   │ │ └──────── Hour (0-24 or "*")
   │ └────────── Minute (0-59 or "*")
   └──────────── Second (0-59)
               </code><br>
               <span>Shedule in a unix-like <a href="https://en.wikipedia.org/wiki/Cron" target="_blank">cron format</a> with seconds.</span>
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
    visible: false
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
    },
    submit() {
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
