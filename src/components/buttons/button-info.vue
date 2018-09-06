<template>
   <button type="button" class="btn-icon v-btn v-btn--icon">
      <div class="v-btn__content">
         <svg aria-hidden="true" class="svg-inline--fa fa-info fa-w-6 v-icon v-icon blue--text" style="font-size: 16px;" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
            <path fill="currentColor" d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"></path>
         </svg>
      </div>
   </button>
</template>

<style scoped>
.v-btn--icon {
  width: 24px;
  height: 24px;
}

.btn-icon:before {
  height: 25px !important;
  width: 25px !important;
  left: 0px !important;
  top: 0px !important;
  border-radius: 0;
}
</style>
