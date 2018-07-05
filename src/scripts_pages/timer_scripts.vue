<template>
   <div>
      <files-table :type="type"></files-table>
   </div>
</template>

<script>
import Vue from "vue";
import files_table from "./components/files_table.vue";
Vue.component("files-table", files_table);

export default {
  data: () => ({
    type: "TIMER_EVENT"
  })
};
</script>
