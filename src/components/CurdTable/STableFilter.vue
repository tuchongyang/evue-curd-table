<template>
  <div class="table-filter">
    <SchemaForm ref="formSchemaRef" :form-schema="props.schema" inline size="mini">
      <template #operate-button>
        <el-button type="primary" @click="search" :icon="Search">查询</el-button>
        <el-button type="default" @click="reset">重置</el-button>
      </template>
    </SchemaForm>
  </div>
</template>
<script setup>
import { defineProps, defineEmits, ref } from "vue"
import { SchemaForm } from "@evue/schema-form"
import { Search } from "@element-plus/icons-vue"
const props = defineProps({
  schema: {
    type: Object,
    default: () => ({}),
  },
})
const emits = defineEmits(["search"])

const formSchemaRef = ref()
const search = () => {
  emits("search", formSchemaRef.value.modelRef)
}
const reset = () => {
  console.log("formSchemaRef", formSchemaRef)
  formSchemaRef.value.schemaFormRef.resetFields()
}
</script>
