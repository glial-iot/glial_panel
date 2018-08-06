<template>
   <div>
      <v-dialog :value="visible" max-width="500">
         <v-card>
            <v-card-title class="headline">Script editor help</v-card-title>
            <v-card-text>If you want to save the script, you need to press the button "Save".</v-card-text>
         </v-card>
      </v-dialog>
   </div>
</template>


<script>
import Vue from "vue";

export default {
  data: () => ({
    visible: false
  }),
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    }
  }
};
</script>
