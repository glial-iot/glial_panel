<template>
   <div>
      <files-table :item="item" :filetype="filetype"></files-table>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import files_table from "../components/files_table.vue";
Vue.component("files-table", files_table);

export default {
  data: () => ({
    item: "WEBEVENT_SCRIPTS",
    filetype: "lua"
  })
};
</script>
