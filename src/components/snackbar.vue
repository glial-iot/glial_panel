<template>
  <v-snackbar :timeout="timeout" :top="true" v-model="visible" :color='color'>
    <p class="text">{{text}}</p>
    <v-btn flat @click.native="visible = false">Close</v-btn>
  </v-snackbar>
</template>
<script>
  import Vue from "vue";

  export default {
    data: () => ({
      visible: false,
      text: "",
      color: "",
      timeout: 0
    }),
    methods: {
      update(message, color, timeout) {
        this.visible = false;
        if (message !== "") {
          this.text = message;
          this.color = color || "error";
          this.timeout = timeout || 10000;
          this.visible = true;
        }
      }
    }
  };
</script>

<style scoped>
  .text {
    margin: 0;
    max-width: calc(100% - 70px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

