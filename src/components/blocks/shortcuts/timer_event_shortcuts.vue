<template>
    <v-card-text>
        <a title="Set interval to 1 second" class="pt-1 pr-1 pb-1" href="#" @click="$emit('set_object','1')">Every second</a>
        <a title="Set interval to 10 seconds" class="pa-1" href="#" @click="$emit('set_object','10')">Every 10 seconds</a>
    </v-card-text>
</template>