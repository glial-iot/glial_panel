<template>
   <div class="json-viewer">
      <tree :data="treeData" :options="treeOptions">
         <div slot-scope="{ node }" class="viewer-item" :class="[node.data.type]">
            <div v-if="node.hasChildren()" class="viewer-item__key">
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
            <div v-else class="viewer-item__prop">
               <div class="viewer-item__key">{{ node.text }}</div>
               <div class="viewer-item__key__info">
                  <div class="viewer-item__key__value">{{ node.data.objectKey.value }}</div>
                  <div class="viewer-item__key__update">{{ format_time(node.data.objectKey.update_time) }}</div>
                  <div class="viewer-item__key__actions">
                     <button-trash @click.native="topicDelete(node.data.objectKey)"></button-trash>
                  </div>
               </div>
            </div>
         </div>
      </tree>
   </div>
</template>


<script>
import Vue from 'Vue'
import LiquorTree from 'liquor-tree'
import moment from 'moment'
import buttonTrash from "../components/buttons/button-trash.vue";

export default {
   components: {
      "tree": LiquorTree,
      buttonTrash
   },
   props: ["json", "topicDelete"],
   data() {
      return {
         treeData: this.parser(this.json),
         treeOptions: {
            paddingLeft: 10
         }
      }
   },
   methods: {
      isString(value) {
         return 'string' == typeof value
      },
      isNaN(value) {
         return value !== value
      },
      isBoolean(value) {
         return 'boolean' == typeof value
      },
      isNumber(value) {
         return 'number' == typeof value
      },
      isArray(value) {
         return Array.isArray(value)
      },
      isValue(value) {
         return !this.isArray(value) && !this.isPlainObject(value)
      },
      isPlainObject(value) {
         function isObject(obj) {
            return obj != null && typeof obj === 'object' && Array.isArray(obj) === false
         }

         if (!isObject(value) || !value.constructor || !value.constructor.prototype) {
            return false
         }

         return value.constructor.prototype.hasOwnProperty('isPrototypeOf') === true
      },
      isEndNode(value) {
         if (typeof value === 'object' && (value.hasOwnProperty('topic') || value.hasOwnProperty('update_time') || value.hasOwnProperty('value'))) {
            return true
         }

         return false
      },
      isIterable(value) {
         return (this.isArray(value) || this.isPlainObject(value)) && !this.isEndNode(value)
      },
      map(obj, fn) {
         return Object.keys(obj).map((key) => {
            return fn(obj[key], key)
         })
      },
      transformObject(prop, key) {
         let obj = {
            text: key
         }

         if (this.isIterable(prop)) {
            obj.children = this.map(prop, this.transformObject)
            obj.data = {
               'type': this.isArray(prop) ? 'array' : this.isPlainObject(prop) ? 'object' : 'unknown'
            }
            obj.state = {expanded: false}
         } else {
            obj.data = {
               'objectKey': prop || `${prop}`,
               'type': this.getType(prop),
               'data': prop
            }
         }

         return obj
      },
      getType(value) {
         if (this.isNaN(value)) {
            return 'viewer-type--nan'
         }

         if (this.isString(value)) {
            return 'viewer-type--string'
         }

         if (this.isNumber(value)) {
            return 'viewer-type--number'
         }

         if (this.isBoolean(value)) {
            return 'viewer-type--boolean'
         }

         if (null === value) {
            return 'viewer-type--null'
         }
      },
      parser(obj) {
         return [{
            text: 'root',
            state: {expanded: true},
            data: {type: 'root'},
            children: this.map(obj, this.transformObject)
         }]
      },
      format_time(value) {
         return moment.unix(value).format('YYYY-MM-DD, HH:mm:ss')
      }
   }
};

</script>

<style>
.tree-content {
   padding: 0 4px;
}

.tree-anchor {
   line-height: 20px;
}

.tree-arrow {
   height: 16px;
   width: 16px;
}

.viewer-item,
.viewer-item__prop {
   width: 100%;
}

.tree-arrow:not(.has-child) {
   display: none;
}

.viewer-item__prop {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.viewer-item__key__info {
   display: flex;
   align-items: center;
}

.viewer-item__key__info > * {
   flex-shrink: 0;
}

.viewer-item__key__value {
   width: 300px;
   text-align: left;
}

.viewer-item__key__update {
   width: 200px;
   text-align: left;
}

.viewer-item__key__actions {
   width: 100px;
   text-align: center;
}
</style>
