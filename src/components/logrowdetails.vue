<template>
   <div>
      <v-dialog v-model="dialog_details_visible" max-width="500px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Details log entry #{{dialog_details_props.log_key}}({{dialog_details_props.log_source}})</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Date and time:</div>
               {{dialog_details_props.log_date}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Log entry:</div>
               {{dialog_details_props.log_entry}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Trace:</div>
               {{dialog_details_props.log_trace}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="primary" flat @click.stop="dialog_details_visible=false">Close</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
   </div>
</template>

<script>

import Vue from "vue";

export default {
  data: () => ({
      dialog_details_visible: false,
      dialog_details_props: {
      log_entry: "",
      log_trace: "",
      visible: false
    },
  }),
  methods: {
    show(item) {
      this.dialog_details_props.log_trace = item.trace;
      this.dialog_details_props.log_entry = item.entry;
      this.dialog_details_props.log_key = item.key;
      this.dialog_details_props.log_date = item.date_abs + ", " + item.date_rel;
      this.dialog_details_props.log_source = item.source;
      this.dialog_details_visible = true;
    }
  }
};
</script>
