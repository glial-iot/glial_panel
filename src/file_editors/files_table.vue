<template>
  <div>
      <v-data-table :headers="headers" :items="files_table" hide-actions class="elevation-1" >

         <template slot="items" slot-scope="props">

            <td class="justify-center layout px-0">
            <v-btn icon class="mx-0 " @click="file_delete(props.item)">
               <v-icon color="pink" small>fa-trash-alt</v-icon>
            </v-btn>
            <v-btn icon class="ml-0 mr-2 " @click="file_edit(props.item)">
               <v-icon color="green" small>fa-pencil-alt</v-icon>
            </v-btn>
            </td>

            <td class="text-xs-left "><v-icon color="primary" small right class="mr-1">fa-file-code</v-icon> {{ props.item.name }}</td>

         </template>

      </v-data-table>
      <v-snackbar :timeout="10000" :top="true" :right="true" v-model="snackbar" :color="'error'" >
         {{ snackbartext }}
         <v-btn flat  @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>
</div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

export default {
  data: () => ({
    snackbar: false,
    snackbartext: "",
    headers: [
      {
        text: "Actions",
        sortable: false,
        align: "center",
        width: "10%"
      },
      {
        text: "Filename",
        value: "name",
        align: "left",
        width: "90%"
      }
    ],
    files_table: []
  }),
  props: ["path"],

  watch: {
    path(new_item) {
      this.table_update(new_item);
    }
  },

  mounted: function() {
    this.table_update(this.path);
  },

  methods: {
    file_edit(item) {
      this.$router.push({ path: "/editor", query: { file: item.address } });
    },

    file_delete(item) {
      console.log("delete:", item.address);
      /* Vue.axios
        .get("http://localhost:8080/system_bus_action", {
          params: {
            action: "delete_topics",
            topic: item.topic
          }
        })
        .then(response => {
          Vue.delete(this.files_table, this.files_table.indexOf(item));
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          this.snackbar = false;
          this.snackbartext = "Delete file: network error";
          this.snackbar = true;
        }); */
    },

    table_update(path) {
      this.files_table = [];
      Vue.axios
        .get("http://localhost:8080/system_webedit_data_v2", {
          params: {
            item: "get_list",
            address: path
          }
        })
        .then(response => {
          this.files_table = response.data;
        })
        .catch(error => {
          console.log(error);
          this.snackbar = false;
          this.snackbartext = "Get file list: network error";
          this.snackbar = true;
        });
    }
  }
};
</script>
