<template>
  <div>
    <v-data-table v-if="loaded" :headers="headers" :items="items" hide-actions class="no-scroll bus-table"
                  no-data-text="No topics">
      <template slot="items" slot-scope="props">
        <tr :class="props.item.new_attr ? 'row-new' : ''">
          <td class="text-xs-left">
            <div class="ellipsis" :title="props.item.topic">{{ props.item.topic }}</div>
          </td>
          <td class="text-xs-right">
            <div class="ellipsis" :title="props.item.value">{{ props.item.value }}</div>
          </td>
          <td class="text-xs-left">
            <div class="ellipsis" :title="props.item.type">{{ props.item.type }}</div>
          </td>
          <td class="text-xs-center">
            <div class="ellipsis" :title="props.item.tags">{{ props.item.tags }}</div>
          </td>
          <td class="text-xs-left">
            <div class="ellipsis" :title="get_time(props.item.time)">{{ get_time(props.item.time) }}</div>
          </td>
          <td class="justify-center text-xs-center cell-flex">
            <button-create-script @click.native="$refs.create_event_script.open(props.item)"></button-create-script>
            <button-info @click.native="$refs.edit_bus.show(props.item)"></button-info>
            <button-trash @click.native="topicDelete(props.item)"></button-trash>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-divider></v-divider>
    <v-card-title class="py-0 px-0 small_title">
      <v-spacer></v-spacer>
      <span class="body-2 mx-4 grey--text"> Bus records: {{items.length}} </span>
    </v-card-title>
    <edit-bus-modal ref="edit_bus"></edit-bus-modal>
    <create-script-modal ref="create_event_script" :visual="'none'" :type="'BUS_EVENT'"></create-script-modal>
  </div>
</template>


<script>
  import Vue from "vue";

  import editBusModal from "../../modals/edit-bus-modal.vue";
  import buttonTrash from "../../buttons/button-trash.vue";
  import buttonInfo from "../../buttons/button-info.vue";
  import buttonCreateScript from "../../buttons/button-create-script.vue";
  import createScriptModal from "../../modals/create_script_modal.vue";

  import {get_time} from "../../mixins/get_time.js"

  Vue.use(require("vue-moment"));

  export default {
    components: {
      editBusModal,
      buttonTrash,
      buttonInfo,
      buttonCreateScript,
      createScriptModal
    },
    props: ["items", "topicDelete", "loaded"],
    mixins: [get_time],

    data() {
      return {
        headers: [
          {
            text: "Topic",
            value: "topic",
            align: "left"
          },
          {
            text: "Value",
            value: "value",
            sortable: false,
            align: "right",
            width: "15%"
          },
          {
            text: "Type",
            value: "type",
            sortable: false,
            align: "left",
            width: "10%"
          },
          {
            text: "Tags",
            value: "value",
            sortable: false,
            align: "center",
            width: "10%"
          },
          {
            text: "Update time",
            value: "text_time",
            align: "center",
            width: "28%"
          },
          {
            text: "Actions",
            sortable: false,
            align: "center",
            width: "100px"
          }
        ]
      };
    }
  };
</script>
