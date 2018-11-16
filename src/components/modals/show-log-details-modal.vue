<template>
   <div>
      <v-dialog v-on:keydown.esc="visible = false" v-model="visible" max-width="600px">
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
               <span v-html="$options.filters.nl2br(entry)"></span>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text v-if="visible_trace">
               <div class="subheading">Trace:</div>
               <span v-html="$options.filters.nl2br(trace)"></span>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="primary" flat @click.stop="visible = false">Close</v-btn>
               <v-btn color="primary" flat v-if="visible_trace === false" @click.stop="visible_trace = true">Show trace</v-btn>
               <v-btn color="primary" flat v-if="visible_trace === true" @click.stop="visible_trace = false">Hide trace</v-btn>
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
    visible_trace: false,
    entry: "",
    trace: "",
    key: "",
    timestamp: "",
    date: "",
    level: "",
    source: ""
  }),
  methods: {
    show(item) {
      this.trace = item.trace;
      this.entry = item.entry;
      this.key = item.key;
      this.timestamp = item.time_ms;
      this.date = this.$options.filters.moment(item.time_ms, 'YYYY-MM-DD, HH:MM:SS');
      this.source = item.source;
      this.level = item.level;
      this.visible = true;
      this.visible_trace = false;
    }
  }
};
</script>

