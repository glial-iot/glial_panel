<template>
    <div>
      <div class="title text-xs-center py-2">Editor</div>

      <div>
         <v-flex xs12>
            <ace-editor v-model="content" @init="editorInit" lang="lua" theme="crimson_editor" width="100%" height="650" value="test"></ace-editor>
         </v-flex>
      </div>

    </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import editor from "vue2-ace-editor";
Vue.component("ace-editor", editor);

export default {
  data: () => ({}),
  methods: {
    editorInit: function() {
      require("brace/ext/language_tools");
      require("brace/mode/html");
      require("brace/mode/javascript");
      require("brace/mode/lua");
      require("brace/theme/crimson_editor");
      //console.log(editor)
      //this.setValue("test");
    }
  }
};
</script>
