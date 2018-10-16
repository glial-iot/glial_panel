<template lang="html">
    <div>
        <v-btn right color="secondary" class="my-2" @click="load_script_file(type)">
            <v-icon left small>fa-upload</v-icon>
            Load {{$options.filters.type2string(type)}}
        </v-btn>

        <form>
            <input @change="handle_file_change" id="fileInput" type="file" style="display:none;"/>
        </form>

        <v-dialog v-on:keydown.esc="close()" v-on:keydown.enter="create_loaded_script()" v-model="visible"
                  max-width="500px">
            <v-card>
                <v-card-title>
                    <div class="title text-xs-center">Load {{$options.filters.type2string(type).toLowerCase()}} as
                        "{{name}}"
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="py-0">
                    <v-text-field autofocus v-if="visible" label="Name" v-model="name"></v-text-field>
                </v-card-text>
                <v-card-text v-if="type != 'DRIVER'" class="py-0">
                    <v-text-field @keyup="get_mask_match()" :label="$options.filters.object_label(type)"
                                  v-model="object"></v-text-field>
                </v-card-text>
                <v-card-text class="pt-0" v-if="type === 'BUS_EVENT'">
                    <a class="dashed pt-1 pr-1 pb-1" href="#" @click="set_object('.+')">All topics</a>
                    <a class="dashed pa-1" href="#" @click="set_object('.+test.+')">All topics with 'test'</a>
                </v-card-text>
                <v-card-text v-if="type === 'BUS_EVENT'">
                    <h4 class="matching_topics_header">Matching topics: </h4>
                    <div class="matching_topic" v-for="item in mask_topics">
                        {{item.topic}}
                    </div>
                    <div class="matching_topic" v-if="Object.keys(mask_topics).length === 0">No match</div>
                </v-card-text>
                <v-card-text v-if="type === 'WEB_EVENT'">
               <span>Full script URL:
                  <a :href="$store.getters.server_url+'/we/'+object" target="_blank">{{$store.getters.server_url}}/we/{{object || "endpoint"}}</a>
               </span>
                </v-card-text>
                <v-card-text v-if="type === 'SHEDULE_EVENT'" class="pt-0">
                    <code class="cron-code font-weight-thin">
                        * * * * * *
                        │ │ │ │ │ │
                        │ │ │ │ │ └── Day of the Week (SUN-SAT or 0-6 or "*")
                        │ │ │ │ └──── Month of the Year (JAN-DEC or 1-12 or "*")
                        │ │ │ └────── Day of the Month (0-30 or "*")
                        │ │ └──────── Hour (0-24 or "*")
                        │ └────────── Minute (0-59 or "*")
                        └──────────── Second (0-59)
                    </code><br>
                    <span>Schedule in a unix-like <a href="https://en.wikipedia.org/wiki/Cron" target="_blank">cron format</a> with seconds.</span>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="error" flat @click.stop="close">Close</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" right flat @click="create_loaded_script()">
                        <v-icon left small>fa-file</v-icon>
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <snackbar ref="snackbar"></snackbar>
    </div>
</template>
<style>
    .matching_topics_header {
        color: rgba(0, 0, 0, .54);
        font-weight: normal;
    }

    .matching_topic {
        font-size: 12px;
    }

    .cron-code {
        background: none;
        color: inherit;
        box-shadow: none;
        line-height: 120%;
    }
</style>
<script>
    import Vue from "vue";
    import Axios from "axios";
    import VueAxios from "vue-axios";
    import snackbar from "../snackbar.vue";

    Vue.use(VueAxios, Axios);

    export default {
        components: {
            snackbar
        },
        data() {
            return {
                visible: false,
                name: "",
                object: "",
                body: "",
                mask_topics: []
            };
        },
        props: ["type"],
        methods: {
            load_script_file() {
                let file_input = document.getElementById("fileInput");
                file_input.click();
            },
            handle_file_change(event) {
                let result = {};
                let fr = new FileReader();
                fr.onload = (event) => {
                    result = JSON.parse(event.target.result);
                    if (result.type === this.type) {
                        this.initialize_data(result);
                    }
                    else {
                        this.$refs.snackbar.update(
                            `This file doesn't contain ${this.$options.filters.type2string(this.type).toLowerCase()}!`
                        );
                    }
                };
                fr.readAsText(event.target.files[0]);
            },
            initialize_data(data) {
                this.name = data.name;
                this.object = data.object;
                this.body = data.body;
                this.get_mask_match();
                this.visible = true;
            },
            close() {
                this.name = "";
                this.object = "";
                this.visible = false;
                this.body = "";
                this.mask_topics = [];
            },
            set_object(value) {
                if (this.type === "WEB_EVENT") {
                    this.object = this.$parent.name;
                } else {
                    this.object = value;
                }
                this.get_mask_match();
            },
            get_mask_match() {
                if (this.object !== "" && this.type === "BUS_EVENT") {
                    Vue.axios
                        .get(
                            "http://localhost:8080/system_bus",
                            {
                                params: {
                                    action: "get_bus",
                                    limit: 10,
                                    mask: btoa(this.object)
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
            },
            create_loaded_script() {
                if (this.type !== "DRIVER" && this.object === "") {
                    this.$refs.snackbar.update(
                        `Field "${this.$options.filters.object_label(this.type)}" is required`
                    );
                    return;
                }
                let params = {
                    action: "create",
                    name: this.name
                };
                if (this.type !== "DRIVER") {
                    params.object = this.object;
                }
                Vue.axios.get(
                    this.$store.getters.server_url +
                    this.$store.state.endpoints[this.type],
                    {params}
                )
                    .then(response => {
                        this.update_script_body(response);
                    })
                    .catch(error => {
                        console.log(error);
                        this.$emit("load_script_error");
                    });
            },
            update_script_body(script) {
                let data = new Blob([this.body], {
                    type: "text/plain"
                });
                let reader = new FileReader();
                reader.readAsDataURL(data);
                reader.onload = () => {
                    Vue.axios.post(
                        this.$store.getters.server_url +
                        this.$store.state.endpoints[this.type] +
                        "?action=update_body&uuid=" +
                        script.data.script.uuid,
                        reader.result
                    )
                        .then(response => {
                            this.$emit("script_loaded", this.item);
                            this.close();
                        })
                        .catch(error => {
                            console.log(error);
                            this.$emit("load_script_error");
                        });
                };
            }
        }
    };
</script>
