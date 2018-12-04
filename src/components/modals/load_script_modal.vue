<template lang="html">
  <div>
    <v-btn right color="secondary" class="my-2" @click="load_script_file(type)">
      <v-icon left small>fa-upload</v-icon>
      Load {{$options.filters.type2string(type)}}
    </v-btn>

    <form>
      <input ref="fileInputImport" @change="handle_file_change" id="fileInput" type="file" style="display:none;"/>
    </form>

    <snackbar ref="snackbar"></snackbar>
  </div>
</template>
<script>
  import Vue from "vue";
  import Axios from "axios";
  import VueAxios from "vue-axios";
  import snackbar from "../snackbar.vue";

  Vue.use(VueAxios, Axios);

  export default {
    components: {
      snackbar,
    },
    props: ["type"],
    methods: {
      load_script_file() {
        let file_input = document.getElementById("fileInput");
        file_input.click();
      },
      handle_file_change(event) {
        let result = {};
        let fr = new FileReader();
        fr.onload = (event) => {
          result = JSON.parse(event.target.result);
          if (result.type === this.type) {
            this.create_loaded_script(result.name, result.object, result.body, result.tag, result.comment)
          }
          else {
            this.$refs.snackbar.update(
              `This file doesn't contain ${this.$options.filters.type2string(this.type).toLowerCase()}!`
            );
          }
        };
        fr.readAsText(event.target.files[0]);
        this.$refs.fileInputImport.value = ""
      },
      create_loaded_script(name, object, body, tag, comment) {
        let params = {
          action: "create",
          name: this.$base64.encode(name),
          tag: this.$base64.encode(tag),
          comment: this.$base64.encode(comment)
        };
        if (this.type !== "DRIVER") {
          params.object = this.$base64.encode(object);
        }
        Vue.axios.get(
          this.$store.getters.server_url +
          this.$store.state.endpoints[this.type],
          {params}
        )
          .then(response => {
            this.update_script_body(response, body);
          })
          .catch(error => {
            console.log(error);
            this.$emit("load_script_error");
          });
      },
      update_script_body(script, body) {
        let data = new Blob([body], {
          type: "text/plain"
        });
        let reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = () => {
          Vue.axios.post(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type] +
            "?action=update_body&uuid=" +
            script.data.script.uuid,
            reader.result
          )
            .then(response => {
              this.$emit("script_loaded", this.item);
              this.$refs.snackbar.update("Script loaded and saved", "success", 3000);
            })
            .catch(error => {
              console.log(error);
              this.$emit("load_script_error");
            });
        };
      }
    }
  };
</script>
