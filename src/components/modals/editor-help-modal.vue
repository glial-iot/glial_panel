<template type:html>
  <div>
    <v-dialog v-on:keydown.esc="hide()" v-model="visible" max-width="500">
      <v-card>
        <v-card-title class="headline">Glue help</v-card-title>
        <v-card-text>
          <h2>Logging:</h2>
          <b>log_info()</b>: the function of adding to the log record level "INFO"
          <br>
          <b>log_warning()</b>: the function of adding to the log record level "WARNING"
          <br>
          <b>log_error()</b>: the function of adding to the log record level "ERROR"
          <br>
          <b>log_user()</b>: the function of adding to the log record level "USER"
          <br>
          <b>log()</b>: alias for log_user()
          <br>
          <b>print()</b>: alias for log_user()
          <br>
          <br>All logging functions take a string or a table (in this case it will be turned into text using the inspect
          library)
          <br>
          <br>
          <h2>Scripts:</h2>
          <b>_script_name</b>: variable with the name of the current script
          <br>
          <b>_script_uuid</b>: variable with uuid of the current script
          <br>
          <b>store</b>: A table unique for each script, for storing temporary data (for example, when you restart
          scripts). You can use it simply as a variable:
          <br>>>store.value = 5
          <br>>>print(store.value)
          <br><br>
          <h2>Work with bus:</h2>
          <b>update{topic = "/test_topic/", value=10}</b>: Updates the topic "test_topic" with a value from the variable
          10
          <br>
          <b>get_value(topic)</b>: Gets the topic value "topic"
          <br>
          <b>bus_serialize(pattern)</b>: Gets the contents of the bus as a table. With the "pattern" variable, only the
          bus part can be selected.
          <br>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
  import Vue from "vue";

  export default {
    data: () => ({
      visible: false
    }),
    methods: {
      show() {
        this.visible = true;
      },
      hide() {
        this.visible = false;
      }
    }
  };
</script>
