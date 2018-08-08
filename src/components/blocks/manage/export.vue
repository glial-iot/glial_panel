<template>
   <div>
      <v-card class="mt-3">
         <v-card-title>
            <v-icon>fa-sliders-h</v-icon>
            <v-toolbar-title>Export settings</v-toolbar-title>
         </v-card-title>
         <v-divider> </v-divider>
         <v-form>
            <v-layout row wrap pl-3 pt-2>
               <v-flex md2 pt-4>
                  <v-checkbox
                     label="Save to Influx"
                     :disabled="!influx_initialized"
                     v-model="influx_export"
                  ></v-checkbox>
               </v-flex>
               <v-flex md2 pt-4>
                  <v-checkbox
                     label="Send to Impact"
                     :disabled="!impact_initialized"
                     v-model="impact_export"
                  ></v-checkbox>
               </v-flex>
            </v-layout>
         </v-form>
      </v-card>
      <snackbar ref="snackbar"></snackbar>
   </div>
</template>
<script>

import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);
import snackbar from "../../snackbar.vue";
import {EXPORT_TYPE_INFLUX, EXPORT_TYPE_IMPACT} from '../../../utils/constants.js'

export default {
  components: {
    snackbar
  },
  data() {
    return {
      influx_export: false,
      impact_export: false,
      influx_initialized: false,
      impact_initialized: false,
    };
  },
  mounted: function() {
    this.get_export(EXPORT_TYPE_INFLUX)
    this.get_export(EXPORT_TYPE_IMPACT)
  },
  watch: {
    influx_export: function(value) {
      if (this.influx_initialized) {
        this.set_export(EXPORT_TYPE_INFLUX, value)
      }
    },
    impact_export: function(value) {
      if (this.influx_initialized) {
        this.set_export(EXPORT_TYPE_IMPACT, value)
      }
    }
  },
  methods: {
    get_export(type) {
      Vue.axios
        .get(this.$store.getters.server_url + "/export", {
          params: {action: "get", type}
        })
        .then(response => {
          switch (type) {
            case EXPORT_TYPE_IMPACT:
              this.impact_export = response.data.value
              this.impact_initialized = true
              break
            case EXPORT_TYPE_INFLUX:
              this.influx_export = response.data.value
              this.influx_initialized = true
              break
          }
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Network error");
        });
    },
    set_export(type, value) {
      Vue.axios
        .get(this.$store.getters.server_url + "/export", {
          params: {action: "set", type, value}
        })
        .then(response => {
          this.$refs.snackbar.update("Export value successfuly updated", "success", 5000);
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Network error");
        });
    },
  },
};
</script>