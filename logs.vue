<template>

  <div>
	 
	  <v-toolbar  justify-center>
		  
		      <v-btn   :loading="deletesuccess"  color="primary"  dark @click="Clearlogs" >
		           <v-icon color="white" small>fa-trash</v-icon>
		  		   &nbsp; Clear logs
		
	         </v-btn>
		  		 		  
   		      <v-spacer></v-spacer>
		      <v-spacer></v-spacer>

		  <v-flex xs12 sm6 class="py-2 text-xs-right"  >
            <v-btn-toggle v-model="filterkey">
              <v-btn flat value="ERROR" @click="Updatefilterkey('ERROR')">
                Error
              </v-btn>
              <v-btn flat value="WARNING" @click="Updatefilterkey('WARNING')">
                Warning
              </v-btn>
              <v-btn flat value="INFO" @click="Updatefilterkey('INFO')">
                Info	
              </v-btn>
              <v-btn flat value="USER" @click="Updatefilterkey('USER')" >
                User
              </v-btn>
			  <v-btn flat value="ALL" @click="Updatefilterkey('ALL')">
                All
              </v-btn>
            </v-btn-toggle>
          </v-flex>
		  

		  
  </v-toolbar>

	  
      <v-data-table :headers="headers" :items="table_values" :loading="loading_status" must-sort class="elevation-1" >

      <v-progress-linear slot="progress" :color="loading_color" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="props">
         <td class="text-xs-center ">{{ props.item.key }}</td>
         <td class="text-xs-center ">{{ props.item.level }}</td>
         <td class="text-xs-center ">{{ props.item.source }}</td>
         <td class="text-xs-left ">{{ props.item.date }}</td>
         <td class="text-xs-left ">{{ props.item.entry }}</td>
         <td class="justify-center layout px-0">
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
			headers: [{
					text: "Key",
					value: "key",
					align: "center",
					sortable: false,
					width: "5%"
				},
				{
					text: "Level",
					value: "level",
					align: "center",
					sortable: false,
					width: "5%"
				},
				{
					text: "Source",
					value: "source",
					align: "center",
					sortable: false,
					width: "20%"
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
					align: "center",
					sortable: false,
					width: "35%"
				},
				{
					text: "Trace",
					align: "center",
					sortable: false,
					width: "5%"
				}
			],


			table_values: [],
			loading_status: false,
			update_time: 1000,
			loading_color: "blue",
			deletesuccess: false,
			filterkey: 'ALL'
		}),

		timers: {
			table_update: {
				autostart: true,
				time: this.update_time
			}
		},

		methods: {
			Clearlogs() {
				Vue.axios.get('http://192.168.1.45:8080/system_logger_action', {
						params: {
							action: "delete_logs"
						}
					})
					.then(response => {
						this.deletesuccess = response.data.result;
						console.log(this.deletesuccess);
						setTimeout(() => {
							this.deletesuccess = false;
						}, 1000)
					});

				this.table_update();
			},
			Updatefilterkey(newfilter) {
				this.filterkey = newfilter;
				this.table_update();
				console.log('current filter:' + this.filterkey);
			},

			Filter() {
				var data = this.table_values;
				var currentfilter = this.filterkey;
				data = data.filter(function(item, index, data) {
					return item.level == currentfilter;
				})
				this.table_values = data;
			},

			show_trace(item) {},

			table_update() {
				this.loading_status = true;
				Vue.axios
					.get("http://192.168.1.45:8080/system_logger_data", {
						params: {
							item: "ALL",
							limit: 100
						}
					})
					.then(response => {
						this.table_values = response.data;
						if (this.filterkey != 'ALL') {
							this.Filter()
						};
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
