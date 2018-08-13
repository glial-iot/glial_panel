<template>
   <div>
      <v-data-table :headers="headers" :items="items" hide-actions class="no-scroll bus-table" :no-data-text="get_empty_text()">
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
                  <div class="ellipsis" :title="props.item.text_time">{{ props.item.text_time }}</div>
               </td>
               <td class="justify-center text-xs-center cell-flex">
                  <button-info @click.native="$refs.edit_bus.show(props.item)"></button-info>
                  <button-trash @click.native="topicDelete(props.item)"></button-trash>
                  <button-download v-show="props.item.tsdb" @click.native="tsdbSet(props.item)"></button-download>
                  <button-download-disabled v-show="!props.item.tsdb" @click.native="tsdbSet(props.item)"></button-download-disabled>
               </td>
            </tr>
         </template>
      </v-data-table>
      <edit-bus-modal ref="edit_bus"></edit-bus-modal>
   </div>
</template>


<script>
import Vue from 'Vue'

import editBusModal from "../../modals/edit-bus-modal.vue";
import buttonTrash from "../../buttons/button-trash.vue";
import buttonDownload from "../../buttons/button-download.vue";
import buttonDownloadDisabled from "../../buttons/button-download-disabled.vue";
import buttonInfo from "../../buttons/button-info.vue";

export default {
   components: {
      editBusModal,
      buttonTrash,
      buttonDownload,
      buttonDownloadDisabled,
      buttonInfo
   },
   props: [
      "items",
      "topicDelete",
      "tsdbSet",
      "loaded"
   ],
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
               width: "100px"
            }
         ]
      }
   },
   methods: {
      get_empty_text() {
         if (!this.loaded) {
            return "No data available";
         }

         return "No topics";
      }
   }
};

</script>

<style>
.row-new {
  background-color: rgb(155, 204, 255);
}

.row-new:hover {
  background-color: rgb(155, 204, 255);
}

.cell-flex {
  display: flex;
}

.bus-table table.v-table tbody td:not(:first-child),
.bus-table table.v-table thead th:not(:first-child) {
  padding: 0 4px;
}
</style>
