<template>
    <v-card-text class="matching_topics_list pt-0">
        <h4 class="matching_topics_header">Matching topics: </h4>
        <div class="matching_topic" v-for="item in mask_topics.slice(0,10)">
            {{item.topic}}
        </div>
        <div class="matching_topic" v-if="Object.keys(mask_topics).length > 10" >. . .</div>
        <div class="matching_topic" v-if="Object.keys(mask_topics).length === 0" >No match</div>
    </v-card-text>
</template>

<script>
    import Vue from "vue";
    import Axios from "axios";
    import VueAxios from "vue-axios";

    Vue.use(VueAxios, Axios);
    export default {
        name: "matching-topics-list",
        props: ["mask"],
        data() {
            return {
                mask_topics: []
            };
        },
        methods: {
            get_mask_match() {
                if (this.$props.mask !== "") {
                    Vue.axios
                        .get(
                            this.$store.getters.server_url + "/system_bus",
                            {
                                params: {
                                    action: "get_bus",
                                    mask: btoa(this.$props.mask)
                                }
                            }
                        )
                        .then(response => {
                            if (response.data.length > 0) {
                                this.mask_topics = response.data;
                            }
                            else {
                                this.mask_topics = [];
                            }
                        })
                        .catch(error => {
                            this.mask_topics = [];
                            console.log(error);
                        });
                }
                else {
                    this.mask_topics = [];
                }
            }
        },
        mounted: function() {
            this.get_mask_match()
        }
    }
</script>
