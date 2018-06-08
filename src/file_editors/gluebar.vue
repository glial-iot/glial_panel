<template>
  <v-snackbar :timeout="5000" :top="true" :left="true"  v-model="snackbar"  color="red" >
       {{snackbartext}}
       <v-btn flat  @click.native="snackbar = false">Close</v-btn>
  </v-snackbar> 
</template>
<script>
import Vue from "vue";
export default {
  data: () => ({
    snackbar: false,
    snackbartext: ""
  }),
  methods: {
      display(message){
          this.snackbartext = message;
          this.snackbar = true;
           }
         }
};
</script>


