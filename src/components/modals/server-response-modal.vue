<template>
   <v-dialog :value="visible" persistent max-width="290">
      <v-card>
         <v-card-title class="headline">Server Response</v-card-title>
         <v-card-text>
            <span v-html="$options.filters.nl2br(message)"></span>
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click="hide()">Close</v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
</template>


<script>
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
    }
  }
};
</script>
