<template>
  <div>
      <v-data-table :headers="headers" :items="table_values" :loading="loading_status" hide-actions must-sort class="elevation-1" >

      <v-progress-linear slot="progress" :color="loading_color" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="props">
         <td class="text-xs-center table-sm">{{ props.item.key }}</td>
         <td class="text-xs-center table-sm">{{ props.item.level }}</td>
         <td class="text-xs-center table-sm">{{ props.item.source }}</td>
         <td class="text-xs-left table-sm">{{ props.item.date }}</td>
         <td class="text-xs-left table-sm">{{ props.item.entry }}</td>
         <td class="justify-center layout px-0 table-sm button-sm">
         <v-btn icon class="mx-0 " @click="show_trace(props.item)">
            <v-icon color="pink" small>fa-project-diagram</v-icon>
         </v-btn>
         </td>

      </template>

</v-data-table>
</div>
</template>

<script>
import Vue from "vue";
import VueTimers from "vue-timers";
Vue.use(VueTimers);
import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

export default {
  data: () => ({
    headers: [
      {
        text: "Key",
        value: "key",
        align: "center",
        sortable: false,
        width: "1%"
      },
      {
        text: "Level",
        value: "level",
        align: "center",
        sortable: false,
        width: "4%"
      },
      {
        text: "Source",
        value: "source",
        align: "center",
        sortable: false,
        width: "19%"
      },
      {
        text: "Date",
        value: "date",
        align: "center",
        sortable: false,
        width: "37%"
      },
      {
        text: "Entry",
        value: "entry",
        align: "center",
        sortable: false,
        width: "40%"
      },
      {
        text: "Trace",
        align: "center",
        sortable: false,
        width: "2%"
      }
    ],
    table_values: [],
    loading_status: false,
    update_time: 1000,
    loading_color: "blue"
  }),

  timers: {
    table_update: {
      autostart: true,
      time: this.update_time
    }
  },

  methods: {
    logs_delete(item) {},
    show_trace(item) {},

    table_update() {
      this.loading_status = true;
      Vue.axios
        .get("http://localhost:8080/system_logger_data", {
          params: {
            item: "ALL",
            limit: 100
          }
        })
        .then(response => {
          this.table_values = response.data;
          //this.loading_status = false;
          this.timers.table_update.time = this.update_time;
          this.loading_color = "blue";
          this.$timer.start("table_update");
        })
        .catch(error => {
          console.log(error);
          this.loading_color = "red";

          this.timers.table_update.time = this.update_time;
          this.$timer.start("table_update");
        });
    }
  }
};
</script>


<style scoped>
.table-sm {
  height: 25px;
}

.button-sm {
  margin: -11px!important;
}
</style>
