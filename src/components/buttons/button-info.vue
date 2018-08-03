<template>
   <button type="button" :class="get_class()">
      <div class="v-btn__content">
         <svg aria-hidden="true" class="svg-inline--fa fa-info-circle fa-w-16 v-icon blue--text" style="font-size: 16px;" data-prefix="fa" data-icon="info-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
            <path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path>
         </svg>
      </div>
   </button>
</template>

<script>
export default {
  props: ["item"],
  methods: {
    get_class: function() {
      if (this.item && this.item.index === 0) {
        return "btn-icon v-btn v-btn--icon fix-first";
      }

      return "btn-icon v-btn v-btn--icon";
    }
  }
};
</script>

<style scoped>
.v-btn--icon {
  width: 24px;
  height: 24px;
}

.btn-icon:before {
  height: 24px !important;
  width: 24px !important;
  left: 0px !important;
  top: 0px !important;
  border-radius: 0;
}

.btn-icon.fix-first:before {
  height: 25px !important;
}
</style>
