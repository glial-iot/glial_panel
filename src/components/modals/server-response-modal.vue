<template>
   <v-dialog :value="visible" persistent max-width="290">
      <v-card>
         <v-card-title class="headline">Server Response</v-card-title>
         <v-card-text>
            <span v-html="format_text(message)"></span>
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click="hide()">Close</v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
</template>


<script>
import { nl2br } from "../../utils/index.js";

export default {
  data: () => ({
    visible: false,
    message: ""
  }),
  methods: {
    show(message) {
      this.message = message;
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    format_text(text) {
      return nl2br(text);
    }
  }
};
</script>
