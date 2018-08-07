<template>
   <div>
      <v-dialog :value="visible" persistent max-width="500">
         <v-card>
            <v-card-title class="headline">Edit Bus Topic</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Topic</div>
               <div class="subheading subheading-value">{{item.topic}}</div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Update time</div>
               <div class="subheading subheading-value">{{item.text_time}}</div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Type</div>
               <div class="subheading subheading-value" v-if="!edit_type">
                  <span>{{get_text(item.type)}}</span>
                  <v-btn small color="green darken-1" flat @click="edit('type')">Edit</v-btn>
               </div>
               <div class="subheading edit-form" v-if="edit_type">
                  <v-text-field v-model="type"></v-text-field>
                  <v-btn small color="green darken-1" flat @click="save('type')">Save</v-btn>
                  <v-btn small color="red darken-1" flat @click="cancel_edit('type')">Cancel</v-btn>
               </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Tags</div>
               <div class="subheading subheading-value" v-if="!edit_tags">
                  <span>{{get_text(item.tags)}}</span>
                  <v-btn small color="green darken-1" flat @click="edit('tags')">Edit</v-btn>
               </div>
               <div class="subheading edit-form" v-if="edit_tags">
                  <v-text-field v-model="tags"></v-text-field>
                  <v-btn small color="green darken-1" flat @click="save('tags')">Save</v-btn>
                  <v-btn small color="red darken-1" flat @click="cancel_edit('tags')">Cancel</v-btn>
               </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Value</div>
               <div class="subheading subheading-value" v-if="!edit_value">
                  <span>{{get_text(item.value)}}</span>
                  <v-btn small color="green darken-1" flat @click="edit('value')">Edit</v-btn>
               </div>
               <div class="subheading edit-form" v-if="edit_value">
                  <v-text-field v-model="value"></v-text-field>
                  <v-btn small color="green darken-1" flat @click="save('value')">Save</v-btn>
                  <v-btn small color="red darken-1" flat @click="cancel_edit('value')">Cancel</v-btn>
               </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" flat @click="hide()">Close</v-btn>
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
  data: () => ({
    visible: false,
    item: {},
    type: '',
    tags: '',
    value: '',
    edit_type: false,
    edit_tags: false,
    edit_value: false
  }),
  methods: {
    show(item) {
      this.visible = true;
      this.item = item
    },
    hide() {
      this.visible = false;
      this.item = {}
    },
    edit(field) {
      switch (field) {
        case "type":
          this.type = this.item.type
          this.edit_type = true
          break
        case "tags":
          this.tags = this.item.tags
          this.edit_tags = true
          break
        case "value":
          this.value = this.item.value
          this.edit_value = true
          break
      }
    },
    cancel_edit(field) {
      switch (field) {
        case "type":
          this.type = ""
          this.edit_type = false
          break
        case "tags":
          this.tags = ""
          this.edit_tags = false
          break
        case "value":
          this.value = ""
          this.edit_value = false
          break
      }
    },
    save(field) {
      let params = {}

      switch (field) {
        case "type":
          params = {
            action: "update_type",
            type: this.type,
            topic: this.item.topic
          }
          break
        case "tags":
          params = {
            action: "update_tags",
            tags: this.tags,
            topic: this.item.topic
          }
          break
        case "value":
          params = {
            action: "update_value",
            value: this.value,
            topic: this.item.topic
          }
      }

      Vue.axios
        .get(this.$store.getters.server_url + "/system_bus", {
          params
        })
        .then(response => {
          console.log(response.data);
          if (response.data.result) {
            this.$refs.snackbar.update("Topic update success", "success", 5000);

            switch (field) {
              case "type":
                this.item.type = this.type
                this.edit_type = false
              case "tags":
                this.item.tags = this.tags
                this.edit_tags = false
                break
              case "value":
                this.item.value = this.value
                this.edit_value = false
            }
          } else if (response.data.error) {
            this.$refs.snackbar.update(response.data.error_msg);
          } else {
            this.$refs.snackbar.update("Unknown response");
          }
          
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Network error");
        });
    },
    get_text(text) {
      if (text) {
        return text
      }
      
      return '(Empty)'
    }
  }
};
</script>

<style scoped>
.edit-form {
  display: flex;
  align-items: center;
}

.subheading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subheading-value {
  font-size: 14px !important;
}
</style>