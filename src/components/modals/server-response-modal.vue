<template>
   <v-dialog :value="text.length > 0" persistent max-width="290">
      <v-card>
         <v-card-title class="headline">{{header}}</v-card-title>
         <v-card-text>{{text}}</v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click="close()">Close</v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
</template>


<script>
export default {
  props: ["header", "text", "close"]
};
</script>