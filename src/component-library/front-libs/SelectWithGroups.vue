<template lang="pug">
  .sg.select-with-groups(v-click-outside="switchOffDropdown")
    .sg__selection.selection(
      ref="selection"
      @click="toggleDropDown"
    )
      .selection__label(:class="{placeholder: isEmptyValue}") {{ config.rootEntity.label }}
      .selection__values(ref="values_container" )
        .selection-item(v-for="item in visibleFlatValues", :key="item.id")
          span.selection-item__name {{ item.name }}
          button.selection-item__btn(type="button" @click.stop="deleteValue(item)")
            svg(xmlns='http://www.w3.org/2000/svg', fill='none', viewBox='0 0 24 24', width='16', height='16')
              path(stroke='currentColor', stroke-linecap='round', stroke-linejoin='round', stroke-width='1.5', d='M18 6.35645 6 18.3564m12 0L6 6.35645')
        .selection-item.selection-item--dark(v-if="flatListCollapsed && flatValues.length !== flatValuesToFit.length", key="unfold_btn")
          button.selection-item__btn(type="button" @click.stop="toggleSelection(false)") {{ `+ ${restFlatValuesCount}` }}
        .selection-item.selection-item--dark(v-if="!flatListCollapsed && flatValues.length !== flatValuesToFit.length", key="fold_btn")
          button.selection-item__btn(type="button" @click.stop="toggleSelection(true)")
            svg(xmlns='http://www.w3.org/2000/svg', width='16', height='16', viewBox='0 0 16 16', fill='none')
              path(d='M8.00002 3.33203V12.6654M8.00002 3.33203L4.66602 6.66536M8.00002 3.33203L11.334 6.66536', stroke='currentColor', stroke-width='1.5', stroke-linecap='round', stroke-linejoin='round')

      .selection__actions
        button.selection__btn(
          type="button"
          v-show="!isEmptyValue"
          @click.stop="clearAll"
        )
          svg(xmlns='http://www.w3.org/2000/svg', fill='none', viewBox='0 0 24 24', width='24', height='24')
            path(stroke='currentColor', stroke-linecap='round', stroke-linejoin='round', stroke-width='1.5', d='M18 6.35645 6 18.3564m12 0L6 6.35645')
        button.selection__btn(
          type="button"
          :class="{rotated: dropdownOpened}"
        )
          svg(xmlns='http://www.w3.org/2000/svg', fill='none', viewBox='0 0 24 24', width='24', height='24')
            path(stroke='currentColor', stroke-linecap='round', stroke-linejoin='round', stroke-width='1.5', d='m8 10 4 4 4-4')


    .sg__dropdown(ref="dropdown", v-if="dropdownOpened")
      .dropdown
        .dropdown__header
          span.dropdown__header-item.dropdown__header-item--root(
            :class="{active: currentLevel === 'rootEntity'}",
            @click="setRootLevel"
          )
            | Все {{ $tc(config.rootEntity.i18nKey, 2)}}
          template(v-if="currentLevel === 'nestedEntity'")
            span /
            span.dropdown__header-item.dropdown__header-item--nested(class="active")
              | {{ currentRootItem[config.rootEntity.nameKey] }} {{ $tc(config.rootEntity.i18nKey, 1) }}
        .dropdown__search(v-show="isSearchVisible")
          SSearch(:value="query", placeholder="Поиск", @input="handleSearch" )
        .dropdown__actions
          SButton(type="button", variant="secondary", size="small", @click="clearAll") Сбросить выбранное
          SButton(type="button", variant="primary", size="small", @click="apply") Применить
        .dropdown__list
          .list-spinner(v-show="$wait.is('fetch_dict')")
            SPreloader(:size="80")
          VirtualList.list(:estimate-size="44", :data-sources="list", :data-component="{}", data-key="id", :keeps="50")
            template(#header="")
              .list-item(v-if="list.length && currentLevel === 'nestedEntity'")
                SCheckboxFn.list-item__checkbox(
                  :checked="isAllNestedEntitiesSelected",
                  :label="selectAllLabel",
                  @change="toggleAll({rootItemId: currentRootItem.id, checked: $event.target.checked})"
                  no-padding
                  theme="swg"
                )
              .list-item(v-if="currentLevel === 'nestedEntity'" )
                SCheckboxFn.list-item__checkbox(
                  :label="notSpecifiedLabel",
                  :checked="isNotSpecifiedNestedEntities",
                  no-padding,
                  @change="toggleListItem({item: {id: `${currentRootItem.id}_0`, full_name: 'Без специализации'}, type: 'nestedEntity', value: $event.target.checked})"
                )
            template(#item="{item}")
              .list-item
                .list-item__checkbox
                  SCheckboxFn.list-item__checkbox(
                    :checked="isCheckedItem({item, type: currentLevel})",
                    :is-indeterminate="isIndeterminateItem({item, type: currentLevel})"
                    :label="item[nameKey]",
                    no-padding,
                    @change="toggleListItem({item, type: currentLevel, value: $event.target.checked})"
                  )
                button.list-item__btn(@click="showNestedLevel(item)" type="button" v-if="currentLevel === 'rootEntity'")
                  svg(width='24', height='24', viewBox='0 0 24 24', fill='none', xmlns='http://www.w3.org/2000/svg')
                    path(d='M10 16L14 12L10 8', stroke='currentColor', stroke-width='1.5', stroke-linecap='round', stroke-linejoin='round')


</template>

<script>
import { set } from 'vue'
import isObjectLike from 'lodash/isObjectLike'
import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import VirtualList from 'vue-virtual-scroll-list'

import { SButton, SSearch, SCheckboxFn, SPreloader } from '@synergy/lms-ui-kit'
export default {
  name: 'SelectWithGroups',
  components: {
    SButton,
    SSearch,
    SCheckboxFn,
    SPreloader,
    VirtualList,
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // state
      dropdownOpened: false,
      currentLevel: 'rootEntity',
      currentRootItem: null,
      flatValuesContainerWidth: null,
      shouldCollapseList: true,

      // data
      currentValue: {},
      rootDirectory: [],
      rootDirectoryCache: [],
      nestedDirectory: [],
      query: '',
    }
  },
  computed: {
    flatValues() {
      if (!isObjectLike(this.value)) return []
      const values = Object.entries(this.value)
      const chipAdditionalWidth = 40
      return values.reduce((acc, [id, rootItem]) => {
        const rootItemName = rootItem[this.config.rootEntity.nameKey]
        const item = {
          id,
          type: 'rootEntity',
          name: rootItemName,
          width: this.getTextWidth(rootItemName) + chipAdditionalWidth,
        }

        const nestedItems = Object.entries(rootItem.items).map(([nestedEntityId, item]) => {
          const name = item[this.config.nestedEntity.nameKey]
          return {
            id: nestedEntityId,
            rootEntityId: id,
            type: 'nestedEntity',
            name: `${rootItemName}: ${name}`,
            width: this.getTextWidth(`${rootItemName}: ${name}`) + chipAdditionalWidth,
          }
        })
        return [...acc, item, ...nestedItems]
      }, [])
    },
    flatValuesToFit() {
      if (!this.flatValuesContainerWidth || !this.flatValues.length) return []
      const gap = 4
      const unfoldBtnWidth = 50
      const visibleValues = [this.flatValues[0]]
      let availableWidth = this.flatValuesContainerWidth - gap - unfoldBtnWidth
      if (this.flatValues.length === 1) return visibleValues
      for (let i = 1; i < this.flatValues.length; i++) {
        const element = this.flatValues[i]
        const isFitElement = availableWidth > gap + element.width
        if (!isFitElement) break
        visibleValues.push(element)
        availableWidth -= gap + element.width
      }
      return visibleValues
    },
    flatListCollapsed() {
      return this.shouldCollapseList && this.restFlatValuesCount > 0
    },
    restFlatValuesCount() {
      return this.flatValues.length - this.flatValuesToFit.length
    },
    visibleFlatValues() {
      return this.flatListCollapsed ? this.flatValuesToFit : this.flatValues
    },
    list() {
      return this.currentLevel === 'rootEntity' ? this.rootDirectory : this.nestedDirectory
    },
    nameKey() {
      return this.config[this.currentLevel]['nameKey']
    },
    count() {
      return this.currentLevel === 'rootEntity'
        ? this.rootDirectory.length
        : this.currentRootItem[this.config['rootEntity']['countKey']] + 1
    },
    selectAllLabel() {
      const key = this.config[this.currentLevel]['i18nKey']
      const units = this.$tc(key, this.count - 1)
      const notSpecifiedText = `без ${this.$tc(key, 2)}`
      return `Выбрать все (${this.count - 1} ${units} и ${notSpecifiedText})`
    },
    notSpecifiedLabel() {
      const key = this.config['nestedEntity']['i18nKey']
      const units = this.$tc(key, 2)
      return `Без ${units}`
    },
    isNotSpecifiedNestedEntities() {
      const rootItemId = this.currentRootItem?.id
      const nestedItems = this.currentValue[rootItemId]?.items
      if (!rootItemId || !nestedItems) return false
      return Object.hasOwn(nestedItems, `${rootItemId}_0`)
    },
    isAllNestedEntitiesSelected() {
      const rootItemId = this.currentRootItem?.id
      const nestedItems = this.currentValue[rootItemId]?.items
      return nestedItems && this.nestedDirectory.length + 1 === Object.keys(nestedItems).length
    },
    isEmptyValue() {
      return !isObjectLike(this.value) || !Object.values(this.value).length
    },
    isSearchVisible() {
      const list = this.currentLevel === 'rootEntity' ? this.rootDirectory : this.nestedDirectory
      return this.query || list.length > 5
    },
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(newVal) {
        this.currentValue = isObjectLike(newVal) ? cloneDeep(newVal) : {}
      },
    },
  },
  methods: {
    // helpers
    getTextWidth(text, font = '400 12px Rubik') {
      const canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement('canvas'))
      const context = canvas.getContext('2d')
      context.font = font
      const metrics = context.measureText(text)
      return metrics.width
    },

    // select dropdown methods
    switchOffDropdown() {
      if (!this.dropdownOpened) return

      this.setDropDownState(false)
    },
    toggleDropDown() {
      this.setDropDownState(!this.dropdownOpened)
    },
    calculateDropdownPosition() {
      if (!this.dropdownOpened) return
      const $dropdown = this.$refs?.dropdown
      const $selection = this.$refs?.selection
      if (!$dropdown || !$selection) return
      if ($dropdown.style?.transform) {
        $dropdown.style.transform = ''
      }
      this.$nextTick(() => {
        if (!$selection || !$dropdown) return

        const selectionRect = $selection.getBoundingClientRect()
        const windowHeight = document.documentElement.clientHeight
        const selectionY = selectionRect.y
        const selectionHeight = $selection.offsetParent.offsetHeight
        const dropdownHeight = $dropdown.offsetHeight
        const bottomFreeSpace = windowHeight - (selectionY + selectionHeight + 5)
        const toBottom = bottomFreeSpace > dropdownHeight
        if (toBottom) {
          $dropdown.style.top = `${$selection.offsetHeight + 8}px`
        } else {
          $dropdown.style.bottom = `${$selection.offsetHeight + 8}px`
        }
      })
    },
    setDropDownState(value) {
      if (value === this.dropdownOpened) return
      if (!this.dropdownOpened) this.$emit('close')
      this.dropdownOpened = value
      this.$nextTick(() => {
        this.calculateDropdownPosition()
      })
    },

    // list methods
    showNestedLevel(rootItem) {
      this.currentRootItem = rootItem
      this.query = ''
      this.$wait.start('fetch_nested')
      this.config.nestedEntity
        .fetchItems({ rootEntityId: rootItem.id })
        .then((values) => {
          this.nestedDirectory = values
        })
        .catch((e) => console.warn(e.message))
        .finally(() => {
          this.currentLevel = 'nestedEntity'
        })
    },
    setRootLevel() {
      this.currentLevel = 'rootEntity'
      this.currentRootItem = {}
      this.rootDirectory = cloneDeep(this.rootDirectoryCache)
    },
    toggleListItem({ item, type, value }) {
      // console.log({ item, type, value })
      const { id, ...itemData } = item
      const rootNameKey = this.config.rootEntity.nameKey
      const nestedNameKey = this.config.rootEntity.nameKey
      switch (type) {
        case 'rootEntity': {
          if (value) {
            const data = {
              [rootNameKey]: itemData[rootNameKey],
              items: {},
            }
            set(this.currentValue, item.id, data)
            this.config.nestedEntity
              .fetchItems({ rootEntityId: item.id })
              .then((nestedEntities) => {
                nestedEntities.forEach((entity) => {
                  const { id: entityId, ...entityData } = entity
                  set(this.currentValue[item.id]['items'], entityId, entityData)
                })
                set(this.currentValue[item.id]['items'], `${id}_0`, {
                  [this.config.nestedEntity.nameKey]: this.config.nestedEntity.notSpecifiedLabel,
                })
              })
              .catch((e) => console.warn(e.message))
          } else {
            this.$delete(this.currentValue, item.id)
          }
          break
        }
        case 'nestedEntity': {
          if (value) {
            if (!this.currentValue[this.currentRootItem.id]) {
              const nameKey = this.config.rootEntity.nameKey
              const data = {
                [nameKey]: this.currentRootItem[nameKey],
                items: {},
              }
              set(this.currentValue, this.currentRootItem.id, data)
            }
            const nestedData = {
              [nestedNameKey]: itemData[nestedNameKey],
            }
            set(this.currentValue[this.currentRootItem.id]['items'], id, nestedData)
          } else {
            this.$delete(this.currentValue[this.currentRootItem.id]['items'], id)
            if (isEmpty(this.currentValue[this.currentRootItem.id]['items'])) {
              this.$delete(this.currentValue, this.currentRootItem.id)
            }
          }
        }
      }
    },
    toggleAll({ rootItemId, checked }) {
      const items = [
        ...this.nestedDirectory,
        { id: `${rootItemId}_0`, [this.config.nestedEntity.nameKey]: this.config.nestedEntity.notSpecifiedLabel },
      ]
      items.forEach((item) => {
        this.toggleListItem({ item, type: 'nestedEntity', value: checked })
      })
    },
    isCheckedItem({ item, type }) {
      switch (type) {
        case 'rootEntity': {
          return !!this.currentValue[item.id]
        }

        case 'nestedEntity': {
          const rootItemId = this.currentRootItem.id
          const items = this.currentValue[rootItemId]?.items
          return items && !isEmpty(items[item.id])
        }
      }
      return false
    },
    isIndeterminateItem({ item, type }) {
      if (!this.currentValue[item.id] || type === 'nestedEntity') return false
      const directoryItem = this.rootDirectory.find((v) => v.id === item.id)
      const directoryCount = directoryItem[this.config.rootEntity.countKey]
      const nestedItems = this.currentValue[item.id].items
      const nestedSelectedItemsCount = isEmpty(nestedItems) ? 0 : Object.values(nestedItems).length
      return nestedSelectedItemsCount > 0 && directoryCount + 1 !== nestedSelectedItemsCount
    },
    apply() {
      this.$emit('apply', this.currentValue)
      this.dropdownOpened = false
    },
    searchEntities(query = '') {
      this.query = query
      if (query !== '' && query.length < 2) return
      switch (this.currentLevel) {
        case 'rootEntity': {
          if (query === '') {
            this.rootDirectory = cloneDeep(this.rootDirectoryCache)
            return
          }
          this.config.rootEntity
            .fetchItems(query)
            .then((values) => {
              this.rootDirectory = values
            })
            .catch((e) => console.warn(e.message))

          break
        }
        case 'nestedEntity': {
          this.config.nestedEntity
            .fetchItems({ rootEntityId: this.currentRootItem.id, query })
            .then((values) => {
              this.nestedDirectory = values
            })
            .catch((e) => console.warn(e.message))

          break
        }
      }
    },

    // selection
    clearAll() {
      this.$emit('reset')
    },
    deleteValue(valueItem) {
      const valueCopy = cloneDeep(this.value)
      switch (valueItem.type) {
        case 'rootEntity': {
          delete valueCopy[valueItem.id]
          break
        }
        case 'nestedEntity': {
          delete valueCopy[valueItem.rootEntityId]['items'][valueItem.id]
          if (isEmpty(valueCopy[valueItem.rootEntityId]['items'])) delete valueCopy[valueItem.rootEntityId]
          break
        }
      }
      this.$emit('apply', valueCopy)
    },
    toggleSelection(shouldCollapseList) {
      this.shouldCollapseList = shouldCollapseList
      this.$nextTick(() => {
        this.calculateDropdownPosition()
      })
    },
  },
  created() {
    this.config.rootEntity.fetchItems().then((values) => {
      this.rootDirectory = values
      this.rootDirectoryCache = values
    })
    this.handleSearch = debounce(this.searchEntities, 300)
  },
  mounted() {
    const observer = new ResizeObserver((entries) => {
      this.flatValuesContainerWidth = entries[0].target.clientWidth - 43
    })
    observer.observe(this.$refs.values_container)
  },
}
</script>

<style lang="scss">
.select-with-groups {
  .sui-checkbox--theme--swg {
    .sui-container-with-label-wrapper {
      max-width: 100%;
    }
    .sui-checkbox__text {
      font-size: 14px;
      line-height: 20px;
      word-break: break-word;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      max-height: 40px;
    }
    .sui-checkbox__label {
      top: calc(50% - 12px);
    }
    .sui-checkbox__container {
      cursor: pointer;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../assets/stylesheets/mixins';
.sg {
  color: var(--color-text-primary);
  position: relative;
  &__dropdown {
    position: absolute;
    width: 100%;
    z-index: 1000;
  }
  &__test {
    color: red;
    padding: 4px;
    svg {
      outline: 1px dashed green;
    }
  }
}

.selection {
  position: relative;
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--color-bg-primary);
  min-height: 52px;
  &:hover {
    border-color: var(--border-hover-color);
    outline: 1px solid var(--border-hover-color);
  }

  &__label {
    position: absolute;
    top: 8px;
    left: 12px;
    font-size: 12px;
    line-height: 16px;
    color: var(--color-text-tertiary);
    &.placeholder {
      top: 15px;
      font-size: 14px;
      line-height: 20px;
    }
  }
  &__values {
    display: flex;
    width: calc(100% - 56px);
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 16px;
  }
  &__actions {
    width: 56px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }
  &__btn {
    @include button-reset;
    width: 24px;
    height: 24px;
    color: var(--color-icon-secondary);
    &:hover {
      color: var(--color-icon-tertiary);
    }
    svg {
      transform: rotate(0);
      transition: all 0.3s ease-in-out;
    }
    &.rotated {
      svg {
        transform: rotate(180deg);
      }
    }
  }
}
.selection-item {
  display: flex;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  background-color: #454a4f;
  color: #fff;
  border-radius: 4px;
  max-width: 100%;
  &--dark {
    background-color: var(--color-lbutton-light);
  }

  &__name {
    font-size: 12px;
    line-height: 16px;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__btn {
    @include button-reset;
  }
}

.dropdown {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--color-bg-primary);
  box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.05);
  &:hover {
    border-color: var(--border-hover-color);
    outline: 1px solid var(--border-hover-color);
  }
  &__header {
    display: flex;
    gap: 4px;
  }
  &__header-item {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    &--root {
      cursor: pointer;
      white-space: nowrap;
    }
    &--nested {
      white-space: nowrap;
      overflow: hidden;
      max-width: 100%;
      text-overflow: ellipsis;
    }

    &.active {
      font-weight: 500;
    }
  }
  &__actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    gap: 6px;
  }
  &__list {
    position: relative;
    height: 376px;
  }
}
.list-spinner {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.list {
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 376px;
  overflow-y: auto;
  @include scroll;
  &__item {
  }
}
.list-item {
  display: flex;
  gap: 8px;
  height: 44px;
  width: 100%;
  padding: 10px 16px;
  align-items: center;
  &:hover {
    background-color: #e7e7e7;
  }

  &__checkbox {
    flex-shrink: 0;
    flex-grow: 1;
    max-width: calc(100% - 30px);
    :deep(.sui-container-with-label-wrapper) {
      max-width: 100%;
    }

    :deep(.sui-checkbox__text) {
      font-size: 14px;
      line-height: 20px;
      word-break: break-word;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      max-height: 40px;
    }
    :deep(.sui-checkbox__label) {
      top: calc(50% - 12px);
    }
    :deep(.sui-checkbox__container) {
      cursor: pointer;
    }
  }

  &__name {
    flex-grow: 1;
  }
  &__btn {
    flex-shrink: 0;
    @include button-reset;
    color: var(--color-icon-primary);
  }
}
</style>
