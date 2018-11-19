<template lang="html">
   <div>
      <v-dialog v-on:keydown.esc="hide()" v-on:keydown.enter="submit()" :value="visible" persistent max-width="420">
         <v-card>

            <v-card-title class="headline">Change script comment</v-card-title>

            <v-card-text>
               <v-textarea autofocus v-if="visible" v-model="comment" :label="`Comment`" required></v-textarea>
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
    comment: "",
    uuid: "",
    type: "",
    visible: false
  }),
  methods: {
    show(uuid, comment, type) {
      this.uuid = uuid;
      this.comment = comment;
      this.type = type;
      this.visible = true;
    },
    hide() {
        this.uuid = "";
        this.comment = "";
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
              comment: this.$base64.encode(this.comment)
            }
          }
        )
        .then(response => {
          if (response.data.comment === this.comment ) {
              this.$emit("comment_updated", this.comment);
          }
          this.hide();
        })
        .catch(error => {
          this.$emit("comment_error", this.comment);
          console.log(error);
        });
    }
  }
};
</script>