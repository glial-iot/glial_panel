<template lang="html">
  <div>
    <v-dialog v-on:keydown.esc="hide()" v-on:keydown.enter="submit()" :value="visible" persistent max-width="420">
      <v-card>

        <v-card-title class="headline">Change script tags</v-card-title>

        <v-card-text>
          <v-text-field autofocus v-if="visible" v-model="tags" :label="`Tags`" required></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-btn color="error" flat @click="hide()">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="submit()">Change</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
    <snackbar ref="snackbar"></snackbar>
  </div>
</template>

<script>
  import Vue from "vue";
  import Axios from "axios";
  import VueAxios from "vue-axios";

  Vue.use(VueAxios, Axios);
  import snackbar from "../snackbar.vue";

  export default {
    components: {
      snackbar
    },
    data: () => ({
      tags: "",
      uuid: "",
      type: "",
      visible: false
    }),
    methods: {
      show(uuid, tags, type) {
        this.uuid = uuid;
        this.tags = tags;
        this.type = type;
        this.visible = true;
      },
      hide() {
        this.uuid = "";
        this.tags = "";
        this.type = "";
        this.visible = false;
      },
      submit() {
        Vue.axios
          .get(
            this.$store.getters.server_url +
            this.$store.state.endpoints[this.type],
            {
              params: {
                action: "update",
                uuid: this.uuid,
                tag: this.$base64.encode(this.tags)
              }
            }
          )
          .then(response => {
            if (response.data.tag === this.tags) {
              this.$emit("tags_updated", this.tags);
            }
            this.hide();
          })
          .catch(error => {
            this.$emit("tags_error", this.tags);
            console.log(error);
          });
      }
    }
  };
</script>