<template>
  <v-dialog :value="show" persistent max-width="290">
    <v-card>
      <v-card-title class="headline">{{header}}</v-card-title>
      <v-card-text>{{text}}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click="close()">No</v-btn>
        <v-btn color="green darken-1" flat @click="confirm()">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
export default {
  props: ["header", "text", "close", "confirm", "show"]
};
</script>