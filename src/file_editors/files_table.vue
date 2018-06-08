<template>
  <div>
      <v-card>

         <v-card-title class="py-1 px-1">
            <files-create-button @create_error="update_snackbar('Create file: network error')" @data_updated="table_update(path)" :path="path" :filetype="filetype"></files-create-button>
         </v-card-title>

         <v-data-table :headers="headers" :items="files_table" hide-actions class="elevation-1 no-scroll" >

            <template slot="items" slot-scope="props">
               <td class="text-xs-left"><v-icon color="primary" small right class="mr-1">fa-file-code</v-icon> {{ props.item.name }}</td>

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

import files_create_button from "./files_create_button.vue";
Vue.component("files-create-button", files_create_button);

export default {
  data: () => ({
    snackbar: false,
    snackbartext: "",
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
    update_snackbar: function(text) {
      this.snackbar_visible = false;
      this.snackbar_text = text;
      if (text !== "") {
        this.snackbar_visible = true;
      }
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
          this.update_snackbar("");
        })
        .catch(error => {
          console.log(error);
          this.update_snackbar("Delete file: network error");
        });
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
          this.update_snackbar("");
        })
        .catch(error => {
          console.log(error);
          this.update_snackbar("Get file list: network error");
        });
    }
  }
};
</script>

<style>
table.table tbody td,
table.table tbody th {
  height: 25px !important;
}

.no-scroll table {
  table-layout: fixed;
}
</style>


<style scoped>
.button-sm {
  margin: -11px !important;
}
</style>
