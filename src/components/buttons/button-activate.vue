<template>
  <div class="button_root_container">
    <button class="v-btn v-btn--icon icon-btn" v-show="flag === 'NON_ACTIVE'" type="button" title="Activate">
      <i class="fa fa-play-circle green--text"></i>
    </button>
    <button class="v-btn v-btn--icon icon-btn" v-show="flag === 'ACTIVE'" type="button" title="Deactivate">
      <i class="fa fa-stop-circle red--text"></i>
    </button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        name: "buttonActivate"
      }
    },
    props: {
      flag: String,
    }
  }
</script>