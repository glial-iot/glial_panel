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
               <v-text-field :label="$options.filters.object_label(type)" v-model="object"></v-text-field>
            </v-card-text>
            <v-card-text v-if="type === 'WEB_EVENT'">
               <span>Full script URL:
                  <a :href="$store.getters.server_url+'/we/'+object" target="_blank">{{$store.getters.server_url}}/we/{{object || "endpoint"}}</a>
               </span>
            </v-card-text>
            <v-card-text v-if="type === 'SCHEDULE_EVENT'" class="pt-0">
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
<style>
.cron-code {
  background: none;
  color: inherit;
  box-shadow: none;
  line-height: 120%;
}
</style>
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
      object: ""
    };
  },
  props: ["type"],
  methods: {
    close() {
      this.name = "";
      this.object = "";
      this.dialog_visible = false;
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
