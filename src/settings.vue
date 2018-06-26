<template>
   <div>
     
    <v-toolbar >
       <v-spacer></v-spacer>
    <v-icon >fa-sliders-h</v-icon>
    <v-toolbar-title center>Settings</v-toolbar-title>
 <v-spacer></v-spacer>
      
  </v-toolbar>
  <v-card >

 <v-form left>
<v-layout row wrap mt-3 pt-3>
    <v-flex xs4>
      <v-icon >fa-globe</v-icon>    <v-title>Server connection address</v-title>
      </v-flex>
      <v-flex xs5 >
        <v-text-field
          name="input-3-1"
          label="your IMPACT server address"
           v-model="server_url" >
</v-text-field>
      </v-flex>
      <v-flex xs3 >
                <v-btn :loading="url_button.loading" :disabled="url_button.disabled" :color="url_button.color" @click="url_update">
            <v-icon left small>fa-arrow-alt-circle-right</v-icon> Update
         </v-btn>
      </v-flex>
 
     </v-layout>
     </v-form>
     
  </v-card>

<v-card >
 
 
 <v-form left>
<v-layout row wrap mt-3 pt-3>
    <v-flex xs4 >
      <v-icon >fa-wrench</v-icon>    <v-title>Setting # 2 (reserved for a future use)</v-title>
      </v-flex>
      <v-flex xs5>
        <v-text-field
          name="input-3-2"
          label="Setting # 2"
          v-model="server_url" >
</v-text-field>
      </v-flex>
      <v-flex xs3>
                <v-btn :loading="reserved_button.loading" :disabled="reserved_button.disabled" :color="reserved_button.color" @click="">
            <v-icon left small>fa-arrow-alt-circle-right</v-icon> Update
         </v-btn>
      </v-flex>
 
     </v-layout>
     </v-form>
     
  </v-card>


  <v-card >
 
 
 <v-form left>
<v-layout row wrap mt-3 pt-3>
    <v-flex xs4 >
      <v-icon >fa-wrench</v-icon>    <v-title>Setting #3 (reserved for a future use)</v-title>
      </v-flex>
      <v-flex xs5 >
        <v-text-field
          name="input-3-3"
          label="Setting #3"
          value="123.123.123.123" >
</v-text-field>
      </v-flex>
      <v-flex  xs3>
                <v-btn :loading="reserved_button.loading" :disabled="reserved_button.disabled" :color="reserved_button.color" @click="">
            <v-icon left small>fa-arrow-alt-circle-right</v-icon> Update
         </v-btn>
      </v-flex>
 
     </v-layout>
     </v-form>
     
  </v-card>

      <snackbar ref="snackbar"></snackbar>

   </div>

</template>

<script>
import Vue from "vue";

import Axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, Axios);

import snackbar from "./components/snackbar.vue";
Vue.component("snackbar", snackbar);

import VueLocalStorage from 'vue-localstorage';
Vue.use(VueLocalStorage);

export default {

  data() {
    return {
      server_url: '',
      button: null,
      color: null,
      reserved_button: {
        disabled: false,
        loading: false,
        color: "secondary",
        action: "wipe_storage"
      },
      url_button: {
        disabled: false,
        loading: false,
        color: "secondary",
        action: "url"
      }
    };
  },
    localStorage :  { url:  {type: String}}
 ,
created:

function(){
 
 this.server_url=this.$localStorage.get('url', 'localhost') 

},

methods:

{

url_update(){

 this.$localStorage.set('url', this.server_url)
 this.$parent.$parent.$parent.$data.server_url =this.server_url;
          setTimeout(() => (this.url_button.loading = false), 500);
          setTimeout(() => (this.url_button.disabled = false), 500);
          this.url_button.color = "success";
          this.url_button.loading = true;
          this.url_button.disabled = true;
          setTimeout(() => (this.url_button.color = "secondary"), 800);
 

},

}

};
</script>
