<template>
   <div>
      <v-dialog v-model="visible" max-width="900px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">Details {{type}} script: "{{name}}"</div>
               <v-spacer></v-spacer>
               <v-btn color="primary" flat @click="$refs.rename_script.show(uuid, type, name)">Rename</v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Active flag:</div>
               {{active_flag}}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Status:</div>
               {{status}}({{status_msg}})
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">UUID:</div>
               {{uuid}}
            </v-card-text>
            <v-card-text>
               <div class="subheading">Logs:</div>
               <v-data-table :headers="headers" :items="logs" hide-actions must-sort class="no-scroll">

                  <template slot="items" slot-scope="props">
                     <tr>
                        <td class="text-xs-center">
                           <div class="ellipsis">{{ props.item.level }}</div>
                        </td>
                        <td class="text-xs-center">
                           <div class="ellipsis" :title="props.item.date_abs">{{props.item.date_rel }}</div>
                        </td>
                        <td class="text-xs-left">
                           <div class="ellipsis" :title="props.item.entry">{{ props.item.entry }}</div>
                        </td>
                     </tr>
                  </template>
               </v-data-table>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>

               <v-btn color="primary" flat @click.stop="hide()">Close</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
      <rename-script-modal ref="rename_script" :hideDetails="hide"></rename-script-modal>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import renameScriptModal from "../../components/modals/rename-script-modal.vue";

export default {
  components: {
    renameScriptModal
  },
  data: () => ({
    visible: false,
    name: "",
    status: "",
    status_msg: "",
    type: "",
    uuid: "",
    active_flag: "",
    logs: [],
    headers: [
      {
        text: "Level",
        value: "level",
        align: "center",
        sortable: false,
        width: "15%"
      },
      {
        text: "Date",
        value: "date",
        align: "center",
        sortable: false,
        width: "30%"
      },
      {
        text: "Entry",
        value: "entry",
        align: "left",
        sortable: false
      }
    ]
  }),
  methods: {
    show(item) {
      this.name = item.name;
      this.status = item.status;
      this.status_msg = item.status_msg;
      this.type = item.type;
      this.uuid = item.uuid;
      this.active_flag = item.active_flag;
      this.visible = true;
      this.get_logs();
    },
    get_logs() {
      Vue.axios
        .get(this.$store.getters.server_url + "/logger", {
          params: {
            action: "get_logs",
            uuid: this.uuid,
            limit: 10
          }
        })
        .then(response => {
          this.logs = response.data;
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    },
    hide() {
      this.visible = false;
    }
  }
};
</script>
