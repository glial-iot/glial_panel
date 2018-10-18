<template>
    <v-card-text>
        <a title="Set mask to select all topics" class="pt-1 pr-1 pb-1" href="#" @click="$emit('set_object','.+')">All topics</a>
        <a title="Set mask to filter only topics containing 'test'" class="pa-1" href="#" @click="$emit('set_object','.+test.+')">All topics with 'test'</a>
    </v-card-text>
</template>