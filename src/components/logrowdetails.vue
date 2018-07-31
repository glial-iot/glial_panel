<template>
   <div>
      <v-dialog v-model="visible" max-width="600px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Details log entry ({{level}}) #{{key}}({{source}})</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Date and time:</div>
               {{date}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Log entry:</div>
               {{entry}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Trace:</div>
               <span v-html="format_text(trace)"></span>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="primary" flat @click.stop="visible=false">Close</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
   </div>
</template>

<script>
import Vue from "vue";
import {nl2br} from "../utils/index.js";

export default {
  data: () => ({
    visible: false,
    entry: "",
    trace: "",
    key: "",
    date: "",
    level: "",
    source: ""
  }),
  methods: {
    show(item) {
      this.trace = item.trace;
      this.entry = item.entry;
      this.key = item.key;
      this.date = item.date_abs + ", " + item.date_rel;
      this.source = item.source;
      this.level = item.level;
      this.visible = true;
    },
    format_text(text) {
      return nl2br(text)
    }
  }
};
</script>

