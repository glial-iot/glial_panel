<template>
   <div>
      <v-dialog v-model="visible" max-width="900px">
         <v-card>
            <v-card-title>
               <div class="title text-xs-center">{{$options.filters.type2string(type)}} "{{name}}"</div>
               <v-spacer></v-spacer>
               <v-btn color="primary" flat @click="$refs.rename_script.show(uuid, type, name)">Rename</v-btn>
               <v-btn color="primary" flat @click="$refs.change_object.show(uuid, object, type)">Change Object</v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
               <div class="subheading">Status: {{active_flag}}, {{status}}({{status_msg}})</div>
               <div class="subheading">UUID: {{uuid}}</div>
            </v-card-text>
            <v-card-text>
               <div class="subheading">{{$options.filters.object_label(type)}}: {{object}}</div>
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
                           <div class="ellipsis" :title="props.item.date_abs">{{$options.filters.toRelativeTime(props.item.time)}}</div>
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
               <v-btn color="green darken-1" flat @click.stop="hide()">Close</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
      <rename-script-modal ref="rename_script" :hideDetails="hide" :updateName="update_name"></rename-script-modal>
      <change-object-modal ref="change_object" :updateObject="update_object"></change-object-modal>
   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
import VueTimers from "vue-timers";
Vue.use(VueAxios, Axios, VueTimers);

import renameScriptModal from "./rename-script-modal.vue";
import changeObjectModal from "./change-object-modal.vue";

export default {
  components: {
    renameScriptModal,
    changeObjectModal
  },
  data: () => ({
    visible: false,
    name: "",
    status: "",
    status_msg: "",
    type: "",
    uuid: "",
    active_flag: "",
    object: "",
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
  timers: {
      get_script_data: {
          autostart: false,
          repeat: true,
          time: 1000
      }
  },
  methods: {
    show(item) {
      this.type = item.type;
      this.uuid = item.uuid;
      this.visible = true;
      this.get_script_data();
      this.$timer.start('get_script_data');
    },
    get_logs() {
      Vue.axios
        .get(this.$store.getters.server_url + "/logger", {
          params: {
            action: "get_logs",
            uuid: this.uuid,
            limit: 5
          }
        })
        .then(response => {
          this.logs = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    },
    get_script_data() {
        Vue.axios
            .get(
                this.$store.getters.server_url +
                this.$store.state.endpoints[this.type],
                {
                    params: {
                        action: "get",
                        uuid: this.uuid
                    }
                }
            )
            .then(response => {
                this.active_flag = response.data.active_flag;
                this.name = response.data.name;
                this.object = response.data.object;
                this.type = response.data.type;
                this.status = response.data.status;
                this.status_msg = response.data.status_msg;
                this.active_flag = response.data.active_flag;
                this.object = response.data.object;
                this.get_logs();
            })
            .catch(error => {

            });
    },
    hide() {
      this.visible = false;
      this.visible = false;
      this.name = "";
      this.status = "";
      this.status_msg = "";
      this.type = "";
      this.uuid = "";
      this.active_flag = "";
      this.object = "";
      this.logs = [];
    },
    update_name(value) {
      this.name = value;
    },
    update_object(value) {
      this.object = value;
    }
  }
};
</script>
