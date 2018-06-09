<template>
   <v-snackbar :timeout="10000" :top="true" :right="true" v-model="visible" :color='color'>
      {{text}}
      <v-btn flat @click.native="visible = false">Close</v-btn>
   </v-snackbar>
</template>
<script>
import Vue from "vue";
export default {
  data: () => ({
    visible: false,
    text: "",
    color: ""
  }),
  methods: {
    update(message, color) {
      this.visible = false;
      if (message !== "") {
        this.text = message;
        this.visible = true;
        this.color = color || "error";
      }
    }
  }
};
</script>


