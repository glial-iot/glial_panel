<template>
  <div class="fill-height">
    <v-card class="fill-height elevation-3">
      <v-card-title>
        <v-icon>fa-upload</v-icon>
        <v-toolbar-title>Upload scripts</v-toolbar-title>
      </v-card-title>
      <v-divider></v-divider>
      <form class="filetarget" ref="fileform" @click="load_script_file">

        <input ref="fileInputImport" multiple="multiple" @change="handle_file_change" id="fileInput" type="file" style="display:none;"/>

        <figure class="file-upload-icon">
          <i class="fa fa-file-code"></i>
        </figure>
        <p class="filetarget-text">Drop your .json script files here!</p>
        <p class="filetarget-text-small">(or click to select them on your filesystem)</p>

      </form>

      <v-card-text>

        <v-data-table class="no-scroll" :headers="headers" :items="scripts" hide-actions no-data-text="No scripts">

          <template slot="items" slot-scope="script">
            <tr v-bind:class="{'invalid-script-upload': !script.item.valid, 'inprogress-script-upload': script.item.status === 'in progress', 'uploaded-script-upload': script.item.status === 'uploaded', }">

              <td class="text-xs-left ellipsis" :title="script.item.filename">
                {{ script.item.filename}}
              </td>

              <td class="text-xs-left ellipsis" :title="script.item.name">
                {{ script.item.name }}
              </td>

              <td class="text-xs-left ellipsis" :title="script.item.type">
                {{ script.item.type }}
              </td>

              <td class="justify-center text-xs-center button-sm">
                <button title="Remove script from upload" type="button" @click="remove_from_list(script.index)" class="v-btn v-btn--icon icon-btn">
                  <i class="fa fa-trash-alt black--text"></i>
                </button>
              </td>

              <td class="text-xs-center ellipsis" :title="script.item.valid">
                {{ script.item.valid }}
              </td>

              <td class="text-xs-center ellipsis" :title="script.item.status">
                {{ script.item.status }}
              </td>

            </tr>
          </template>

        </v-data-table>
      </v-card-text>

        <v-card-text class="text-md-center">
          <v-btn v-show="list_has_valid_ready_scripts" :disabled="load_in_process" class="my-2" color="secondary" @click="create_loaded_scrips()">
            <v-icon left small>fa-upload</v-icon>
            <span v-if="!load_in_process">LOAD VALID SCRIPTS</span>
            <span v-if="load_in_process">LOADING ...</span>
          </v-btn>

          <v-btn v-show="scripts.length > 0" color="error" class="my-2" @click="clear_list()">
            <v-icon left small>fa-trash</v-icon>
            CLEAR LIST
          </v-btn>
        </v-card-text>



    </v-card>

    <snackbar ref="snackbar"></snackbar>
  </div>
</template>


<script>
  import Vue from "vue";
  import Axios from "axios";
  import VueAxios from "vue-axios";

  Vue.use(VueAxios, Axios);

  import snackbar from "../components/snackbar.vue";
  import buttonTrash from "../components/buttons/button-trash.vue";

  export default {
    components: {
      snackbar,
      buttonTrash
    },
    data: () => ({
      headers: [],
      dragAndDropCapable: false,
      files: [],
      scripts: [],
      scripts_table: [],
      load_in_process: false
    }),
    methods: {
      load_script_file() {
        let file_input = document.getElementById("fileInput");
        file_input.click();
      },
      determineDragAndDropCapable(){
        let div = document.createElement('div');
        return ( ( 'draggable' in div )
          || ( 'ondragstart' in div && 'ondrop' in div ) )
          && 'FormData' in window
          && 'FileReader' in window;
      },
      handle_file_change(event) {
        Array.from(event.target.files).forEach(file => {
          this.parse_json_from_uploaded_file(file);
        });
        this.$refs.fileInputImport.value = ""
      },
      parse_json_from_uploaded_file (file) {
        let result = {};
        let fr = new FileReader();
        fr.onload = (event) => {
          try {
            result = JSON.parse(event.target.result);
          }
          catch (error) {
            console.log(error);
          }
          if (result.type && result.name) {
            result.filename = file.name;
            result.valid = true;
            result.status = "ready";
            this.scripts.push(result);
          }
          else {
            result.valid = false;
            result.filename = file.name;
            this.scripts.push(result);
          }
        }
        fr.readAsText(file);
      },
      create_loaded_scrips() {
        let interval_msec = 300;
        this.load_in_process = true;
        this.scripts.filter(script => script.valid === true && script.status === "ready").forEach((script, index, array) => {
            setTimeout(() => {
              this.create_script(script);
              if (index === array.length -1) {
                setTimeout(() => {
                  this.load_in_process = false;
                }, 1000);
              }
            }, index * interval_msec);
        })
      },
      create_script(script) {
        script.status = "in progress";
        let params = {
          action: "create",
          name: this.$base64.encode(script.name),
          tag: script.tag ? this.$base64.encode(script.tag) : "",
          comment: script.comment ? this.$base64.encode(script.comment) : ""
        };
        if (this.type !== "DRIVER") {
          params.object = script.object ? this.$base64.encode(script.object) : "";
        }
        Vue.axios.get(
          this.$store.getters.server_url +
          this.$store.state.endpoints[script.type],
          {params}
        )
          .then(response => {
            this.update_script_body(response, script);
          })
          .catch(error => {
            setTimeout(() => {
              this.create_script(script);
            }, 200);
            console.log(error);
          });
      },
      remove_from_list (index) {
        this.scripts.splice(index, 1);
      },
      update_script_body(created_script, uploaded_script) {
        let data = new Blob([uploaded_script.body], {
          type: "text/plain"
        });
        let reader = new FileReader();
        reader.onload = () => {
          Vue.axios.post(
            this.$store.getters.server_url +
            this.$store.state.endpoints[uploaded_script.type] +
            "?action=update_body&uuid=" +
            created_script.data.script.uuid,
            reader.result
          )
            .then(response => {
              uploaded_script.status = "uploaded";
            })
            .catch(error => {
              setTimeout(() => {
                this.update_script_body(created_script, uploaded_script);
              }, 200);
              console.log(error);
            });
        };
        reader.readAsDataURL(data);
      },
      clear_list () {
        this.scripts = [];
        this.files = []
      }
    },
    watch: {

    },
    computed: {
      list_has_valid_ready_scripts() {
        return this.scripts.filter(script => script.valid === true && script.status === "ready").length > 0
      }
    },
    mounted: function () {

      this.dragAndDropCapable = this.determineDragAndDropCapable();
      if( this.dragAndDropCapable ){
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( evt ) {
          this.$refs.fileform.addEventListener(evt, function(e){
            e.preventDefault();
            e.stopPropagation();
          }.bind(this), false);
        }.bind(this));

        this.$refs.fileform.addEventListener('drop', function(e){
          Array.from(e.dataTransfer.files).forEach((file)=>{
            this.parse_json_from_uploaded_file(file);
          })
        }.bind(this));
      }

      this.headers = [
        {
          text: "File name",
          align: "left",
          sortable: false,
          width: "15%"
        },
        {
          text: "Script name",
          align: "left",
          sortable: false,
          width: "15%"
        },
        {
          text: "Script type",
          value: "left",
          align: "left",
          width: "15%"
        },
        {
          text: "Remove from list",
          sortable: false,
          align: "center",
          width: "7%"
        },
        {
          text: "Valid",
          align: "center",
          sortable: false,
          width: "7%"
        },
        {
          text: "Upload status",
          align: "center",
          sortable: false,
          width: "7%"
        }
      ];
    },
  };
</script>
