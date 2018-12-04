<template>
  <div>
    <div class="json-viewer-head">
      <div>
        <div class="json-viewer-header-cell">Topic</div>
      </div>
      <div class="viewer-item__key__info">
        <div class="viewer-item__key__value json-viewer-header-cell">Value</div>
        <div class="viewer-item__key__type json-viewer-header-cell">Type</div>
        <div class="viewer-item__key__tags json-viewer-header-cell">Tags</div>
        <div class="viewer-item__key__update json-viewer-header-cell">Update time</div>
        <div class="viewer-item__key__actions json-viewer-header-cell">Actions</div>
      </div>
    </div>
    <hr class="v-divider">
    <div class="json-viewer">
      <tree ref="tree" :data="treeData" :options="treeOptions">
        <div slot-scope="{ node }" class="viewer-item" :class="[node.data.type]">
          <div v-if="checkChildren(node)" class="viewer-item__key">
            <div>
              {{ node.text }}
              <span v-if="node.collapsed()">
                        <template v-if="node.data.type == 'array'">
                           [ {{ node.children.length }} ]
                        </template>
                        <template v-else>
                           { {{ node.children.length }} }
                        </template>
                     </span>
            </div>
            <template v-if="node.data.objectKey">
              <div class="viewer-item__key__info">
                <div class="viewer-item__key__value" :title="node.data.objectKey.value">{{ node.data.objectKey.value
                  }}
                </div>
                <div class="viewer-item__key__type" :title="node.data.objectKey.type">{{ node.data.objectKey.type }}
                </div>
                <div class="viewer-item__key__tags" :title="node.data.objectKey.tags">{{ node.data.objectKey.tags }}
                </div>
                <div class="viewer-item__key__update" :title="get_time(node.data.objectKey.update_time)">{{
                  get_time(node.data.objectKey.update_time) }}
                </div>
                <div class="viewer-item__key__actions">
                  <button-info @click.native="$refs.edit_bus.show(node.data.objectKey)"></button-info>
                  <button-trash @click.native="topicDelete(node.data.objectKey)"></button-trash>

                </div>
              </div>
            </template>
          </div>
          <div v-else class="viewer-item__prop">
            <div class="viewer-item__key">{{ node.text }}</div>
            <div class="viewer-item__key__info">
              <div class="viewer-item__key__value" :title="node.data.objectKey.value">{{ node.data.objectKey.value }}
              </div>
              <div class="viewer-item__key__type" :title="node.data.objectKey.type">{{ node.data.objectKey.type }}</div>
              <div class="viewer-item__key__tags" :title="node.data.objectKey.tags">{{ node.data.objectKey.tags }}</div>
              <div class="viewer-item__key__update" :title="get_time(node.data.objectKey.update_time)">{{
                get_time(node.data.objectKey.update_time) }}
              </div>
              <div class="viewer-item__key__actions">
                <button-create-script @click.native="$refs.create_event_script.open(props.item)"></button-create-script>
                <button-info @click.native="$refs.edit_bus.show(node.data.objectKey)"></button-info>
                <button-trash @click.native="topicDelete(node.data.objectKey)"></button-trash>
              </div>
            </div>
          </div>
        </div>
      </tree>
    </div>
    <v-card-title class="py-0 px-0 small_title">
      <v-spacer></v-spacer>
      <span class="body-2 mx-4 grey--text"> Bus records: {{dataElements}} </span>
    </v-card-title>
    <edit-bus-modal ref="edit_bus"></edit-bus-modal>
    <create-script-modal ref="create_event_script" :visual="'none'" :type="'BUS_EVENT'"></create-script-modal>
  </div>
</template>


<script>
  import Vue from "vue";
  import LiquorTree from "liquor-tree";
  import moment from "moment";

  import editBusModal from "../../modals/edit-bus-modal.vue";
  import buttonTrash from "../../buttons/button-trash.vue";
  import buttonInfo from "../../buttons/button-info.vue";
  import buttonCreateScript from "../../buttons/button-create-script.vue";
  import createScriptModal from "../../modals/create_script_modal.vue";

  import {get_time} from "../../mixins/get_time.js"

  const DATA_KEY = "__data__";

  export default {
    components: {
      tree: LiquorTree,
      editBusModal,
      buttonTrash,
      buttonInfo,
      buttonCreateScript,
      createScriptModal
    },
    props: ["json", "topicDelete"],
    mixins: [get_time],
    data() {
      return {
        treeData: this.parser(this.json),
        treeOptions: {
          paddingLeft: 10
        },
        dataElements: 0
      };
    },
    watch: {
      json: function (value, oldValue) {
        const oldTree = this.$refs.tree.toJSON();
        const newTree = this.parser(this.json);
        const tree = this.$refs.tree.tree;
        let mergedTree;
        const oldTreeLength = this.countTotalElements(this.parser(oldValue));
        const newTreeLength = this.countTotalElements(this.parser(value));

        if (oldTreeLength > newTreeLength) {
          mergedTree = newTree;
        } else {
          if (oldTree && newTree) {
            mergedTree = this.merge(oldTree, newTree);
          } else {
            mergedTree = newTree;
          }
        }

        this.dataElements = this.countDataElements(this.json);
        this.treeData = mergedTree;
        this.$set(this.$refs.tree, "model", mergedTree);
        tree.setModel(mergedTree);
      }
    },
    methods: {
      merge(target, source) {
        for (let key of Object.keys(source)) {
          let sourceElem;

          if (
            this.isArray(source) &&
            target[key] &&
            target[key].hasOwnProperty("text")
          ) {
            sourceElem = source.find(item => item.text === target[key].text);
          } else {
            sourceElem = source[key];
          }

          if (sourceElem instanceof Object && key in target) {
            if (key === "state") {
              Object.assign(sourceElem, this.merge(target[key], sourceElem));
            } else {
              this.merge(target[key], sourceElem);
            }
          }
        }

        Object.assign(target || {}, source);
        return target;
      },
      countTotalElements(obj) {
        let count = [];

        function getCount(data, level) {
          level = level || 0;
          count[level] = count[level] || 0;
          for (var k in data) {
            data.hasOwnProperty(k) && count[level]++;
            typeof data[k] === "object" && getCount(data[k], level + 1);
          }
        }

        getCount(obj);

        return count.reduce((a, b) => a + b, 0);
      },
      countDataElements(obj) {
        let count = [];

        function getCount(data, level) {
          level = level || 0;
          count[level] = count[level] || 0;
          for (var k in data) {
            if (k === DATA_KEY && data.hasOwnProperty(k)) {
              count[level]++;
            }

            typeof data[k] === "object" && getCount(data[k], level + 1);
          }
        }

        getCount(obj);

        return count.reduce((a, b) => a + b, 0);
      },
      isObjectEmpty(obj) {
        return Object.keys(obj).length === 0;
      },
      isString(value) {
        return "string" == typeof value;
      },
      isNaN(value) {
        return value !== value;
      },
      isBoolean(value) {
        return "boolean" == typeof value;
      },
      isNumber(value) {
        return "number" == typeof value;
      },
      isArray(value) {
        return Array.isArray(value);
      },
      isValue(value) {
        return !this.isArray(value) && !this.isPlainObject(value);
      },
      isPlainObject(value) {
        function isObject(obj) {
          return (
            obj != null && typeof obj === "object" && Array.isArray(obj) === false
          );
        }

        if (
          !isObject(value) ||
          !value.constructor ||
          !value.constructor.prototype
        ) {
          return false;
        }

        return (
          value.constructor.prototype.hasOwnProperty("isPrototypeOf") === true
        );
      },
      isEndNode(value) {
        if (
          typeof value === "object" &&
          (value.hasOwnProperty("topic") ||
            value.hasOwnProperty("update_time") ||
            value.hasOwnProperty("value"))
        ) {
          return true;
        }

        return false;
      },
      isIterable(value) {
        return (
          (this.isArray(value) || this.isPlainObject(value)) &&
          !this.isEndNode(value)
        );
      },
      map(obj, fn) {
        return Object.keys(obj).map(key => {
          return fn(obj[key], key);
        });
      },
      transformObject(prop, key) {
        let obj = {
          text: key
        };

        if (this.isIterable(prop)) {
          obj.children = this.map(prop, this.transformObject);
          obj.data = {
            type: this.isArray(prop)
              ? "array"
              : this.isPlainObject(prop) ? "object" : "unknown",
            objectKey: prop[DATA_KEY]
          };
          obj.state = {};
        } else {
          obj.data = {
            objectKey: prop[DATA_KEY],
            type: this.getType(prop),
            data: prop
          };
          if (obj.text === DATA_KEY) {
            obj.state = {visible: false};
          }
        }

        return obj;
      },
      getType(value) {
        if (this.isNaN(value)) {
          return "viewer-type--nan";
        }

        if (this.isString(value)) {
          return "viewer-type--string";
        }

        if (this.isNumber(value)) {
          return "viewer-type--number";
        }

        if (this.isBoolean(value)) {
          return "viewer-type--boolean";
        }

        if (null === value) {
          return "viewer-type--null";
        }
      },
      parser(obj) {
        if (this.isObjectEmpty(obj)) {
          return;
        }

        return this.map(obj, this.transformObject);
      },
      checkChildren(node) {
        if (node.children.length === 1 && node.children[0].text === DATA_KEY) {
          return false;
        }

        return node.hasChildren();
      }
    }
  };
</script>
