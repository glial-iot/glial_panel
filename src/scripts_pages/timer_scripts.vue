<template>
   <div>
      <scripts-table :type="type"></scripts-table>
   </div>
</template>

<script>
import Vue from "vue";
import scripts_table from "./components/scripts_table.vue";
Vue.component("scripts-table", scripts_table);

export default {
  data: () => ({
    type: "TIMER_EVENT"
  })
};
</script>
