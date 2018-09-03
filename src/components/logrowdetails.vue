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
               {{date}}, {{$options.filters.toRelativeTime(timestamp)}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Log entry:</div>
               {{entry}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Trace:</div>
               <span v-html="$options.filters.nl2br(trace)"></span>
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
      this.timestamp = item.time;
      this.date = item.date_abs;
      this.source = item.source;
      this.level = item.level;
      this.visible = true;
    }
  }
};
</script>

