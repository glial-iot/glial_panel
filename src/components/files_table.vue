<template>
   <div>
      <v-card class="elevation-3">

         <v-card-title class="py-0 px-0">
            <v-spacer></v-spacer>

            <file-create-form @create_error="$refs.snackbar.update('Create file: error')" @data_updated="table_update(path)" :path="path" :filetype="filetype"></file-create-form>
         </v-card-title>

         <v-divider></v-divider>

         <v-data-table :headers="headers" :items="files_table" hide-actions class="no-scroll">

            <template slot="items" slot-scope="props">
               <td class="text-xs-left">
                  <v-icon color="primary" small right class="mr-1">fa-file-code</v-icon> {{ props.item.name }}</td>

               <td class="justify-center layout px-0 button-sm">
                  <v-btn icon class="mx-0" @click="file_delete(props.item)">
                     <v-icon color="pink" small>fa-trash-alt</v-icon>
                  </v-btn>
                  <v-btn icon class="ml-0 mr-2" @click="file_edit(props.item)">
                     <v-icon color="green" small>fa-pencil-alt</v-icon>
                  </v-btn>
               </td>
            </template>

         </v-data-table>

      </v-card>
      <snackbar ref="snackbar"></snackbar>

   </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import file_create_form from "./file_create_form.vue";
Vue.component("file-create-form", file_create_form);

import snackbar from "./snackbar.vue";
Vue.component("snackbar", snackbar);

export default {
  data: () => ({
    new_file_visible: true,
    headers: [
      {
        text: "Filename",
        value: "name",
        align: "left",
        width: "90%"
      },
      {
        text: "Actions",
        sortable: false,
        align: "center",
        width: "10%"
      }
    ],
    files_table: []
  }),
  props: ["path", "filetype"],

  mounted: function() {
    this.table_update(this.path);
  },

  methods: {
    file_edit(item) {
      this.$router.push({ path: "/editor", query: { file: item.address } });
    },
    file_delete(item) {
      console.log("delete:", item.address);
      Vue.axios
        .get("http://localhost:8080/system_webedit_data_v2", {
          params: {
            item: "delete",
            address: item.address
          }
        })
        .then(response => {
          Vue.delete(this.files_table, this.files_table.indexOf(item));
          console.log(response);
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.$refs.snackbar.update("Delete file: network error");
        });
    },

    table_update(path) {
      Vue.axios
        .get("http://localhost:8080/system_webedit_data_v2", {
          params: {
            item: "get_list",
            address: path
          }
        })
        .then(response => {
          this.files_table = response.data;
          this.$refs.snackbar.update("");
        })
        .catch(error => {
          console.log(error);
          this.files_table = [];
          this.$refs.snackbar.update("Get file list: network error");
        });
    }
  }
};
</script>

<style>
.no-scroll table {
  table-layout: fixed;
}
</style>


<style scoped>
</style>
