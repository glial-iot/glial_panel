<template>
  <v-card-text>
    <a title="Set schedule to run script every hour" class="pt-1 pr-1 pb-1" href="#"
       @click="$emit('set_object','0 0 * * * *')">Every hour</a>
    <a title="Set schedule to run script every 30 minutes" class="pa-1" href="#"
       @click="$emit('set_object','0 0 30 * * * *')">Every 30 minutes</a>
  </v-card-text>
</template>