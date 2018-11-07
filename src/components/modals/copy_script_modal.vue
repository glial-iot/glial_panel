<template lang="html">
   <div>
      <v-dialog v-on:keydown.esc="close()" v-on:keydown.enter="copy_script()" v-model="visible" max-width="500px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Copy script "{{name}}"</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-0">
               <v-text-field autofocus v-if="visible" label="Name" v-model="name"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-btn color="error" flat @click.stop="close">Close</v-btn>
               <v-spacer></v-spacer>
               <v-btn color="green darken-1" right flat @click="copy_script()">
                  <v-icon left small>fa-copy</v-icon> Copy </v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
   </div>
</template>
<style>

</style>
<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

export default {
    data() {
        return {
            visible: false,
            name: "",
            uuid: "",
            type: ""
        };
    },
    methods: {
        close() {
            this.name = "";
            this.type = "";
            this.uuid = "";
            this.visible = false;
        },
        show(item) {
            this.name = item.name;
            this.type = item.type;
            this.uuid = item.uuid;
            this.visible = true;
        },
        copy_script() {
            Vue.axios
                .get(
                    this.$store.getters.server_url +
                    "/busevents",
                    {
                        params: {
                            action: "copy",
                            uuid: this.uuid,
                            name: btoa(this.name)
                        }
                    }
                )
                .then(response => {
                    this.$emit("copy_successful", this.item);
                    this.close();
                })
                .catch(error => {
                    this.$emit("copy_error");
                });
        }
    }
};
</script>
