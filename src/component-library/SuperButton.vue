<template>
  <button class="sbutton">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "SuperButton"
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
