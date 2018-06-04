<template>
    
  
    <div>
        <div class="title text-xs-center py-2"></div>
         <bus-table></bus-table>
    </div>
</template>

<script>
	import Vue from "vue";
	import Axios from "axios";
	import VueAxios from "vue-axios";
	Vue.use(VueAxios, Axios);

	import bus_table from "./bus_table.vue";
	Vue.component('bus-table', bus_table)


	export default {
		data: () => ({

		}),

	};

</script>
