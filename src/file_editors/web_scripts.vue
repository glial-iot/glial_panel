<template>
    <div>
        <div class="title text-xs-center py-2">{{this.$route.params.item}}</div>
         <files-table :path="path" :filetype="filetype"></files-table>
    </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import files_table from "./files_table.vue";
Vue.component("files-table", files_table);

export default {
  data: () => ({
    path: "user/webevents_scripts",
    filetype: "lua"
  })
};
</script>
