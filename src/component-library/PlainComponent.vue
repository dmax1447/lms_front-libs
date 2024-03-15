<template>
  <div class="wrap">
    <SInput v-model="val" label="input" placeholder="placeholder"/>
    <SButton variant="primary" size="small">button</SButton>
  </div>
</template>

<script>
import { SButton} from "@synergy/lms-ui-kit";

export default {
  name: "Plain",
  components: {
    SButton
  },
  data() {
    return {
      val: 'test val'
    }
  }

}
</script>

<style lang="scss" scoped>
.sbutton {
  font-size: 14px;
  padding: 8px 24px;
  display: inline-flex;
  align-items:center;
  justify-content:center;
  border:1px solid transparent;
  cursor:pointer;
  border-radius: 4px;
  transition: background-color .2s;
  text-decoration: none;
  font-family: inherit;
  color: #fff;
  background-color: #35a70b;

}
</style>
