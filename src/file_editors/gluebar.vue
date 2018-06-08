<template>
  <v-snackbar :timeout="10000" :top="true" :right="true"  v-model="snackbar"  color='error' >
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
      update(message){
               this.snackbar = false;
               this.snackbartext = message;
                  if (message !== "") {
                  this.snackbar = true;
                                   }
                      }
         }
};
</script>


