<template>
  <div class="table-container">
    <STableFilter :schema="filterSchema" @search="onSearch" v-show="filterSchema.formItem.length && filterVisible" />
    <div class="table-control">
      <div class="btn-control">
        <el-button type="primary" size="mini" @click="create()" v-if="!option.hideBtnAdd">
          <el-icon><plus /></el-icon>
          添加
        </el-button>
        <slot name="menuLeft"></slot>
      </div>
      <div class="min-control" v-if="!option.hideMenu"><STableMenu :filterVisible="filterVisible" @operation="onMenuOption" /></div>
    </div>
    <el-table id="table" border :data="list" v-loading="loading" v-bind="tableAttrs" @row-click="onRowClick" @selection-change="selectionChange">
      <el-table-column type="index" v-if="$attrs.index !== undefined" />
      <el-table-column type="selection" v-if="$attrs.selection !== undefined" />
      <template v-for="item in columns" :key="item.label">
        <el-table-column v-bind="getColumnAttrs(item)" v-if="!item.hidden">
          <template #header>
            <template v-if="!$slots[item.prop + 'Header']">{{ item.label }}</template>
            <slot :name="item.prop + 'Header'" :column="item"></slot>
          </template>
          <template #default="scope">
            <template v-if="item.children && item.children.length">
              <template v-for="sub in item.children" :key="sub.prop">
                <el-table-column v-bind="getColumnAttrs(sub)" v-if="!sub.hidden"></el-table-column>
              </template>
            </template>
            <STableItem :scope="scope" :schema="item" />
          </template>
        </el-table-column>
      </template>
      <el-table-column label="操作" fixed="right" :width="option.menuWidth || '180'" v-if="!option.hideOperation">
        <template #default="scope">
          <template v-if="!$slots.menuBtn">
            <el-button type="text" @click.stop="create(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="text" @click.stop="detail(scope.row)">
              <el-icon><Document /></el-icon> 详情
            </el-button>
            <el-button type="text" style="color: #ff0000" @click.stop="startremove(scope)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
          <el-dropdown trigger="click" v-else>
            <el-button type="text">
              {{ props.option.menuBtnTitle }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button type="text" @click.stop="create(scope.row)">
                    <el-icon><Edit /></el-icon> 编辑
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="text" @click.stop="detail(scope.row)">
                    <el-icon><Document /></el-icon> 详情
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="text" style="color: #ff0000" @click.stop="startremove(scope)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </el-dropdown-item>
                <slot name="menuBtn" v-bind="scope"></slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <slot name="menu" v-bind="scope"></slot>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="!option.pageHide" class="pagination" background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="listQuery.pageIndex" v-model:page-size="listQuery.pageSize" @current-change="fetchData" @size-change="fetchData"> </el-pagination>
    <STableDetail ref="STableDetailRef" />
  </div>
</template>
<script setup>
import { defineProps, defineEmits, computed, ref, reactive, provide, getCurrentInstance } from "vue"
import STableItem from "./STableItem.vue"
import STableFilter from "./STableFilter.vue"
import STableMenu from "./STableMenu.vue"
import STableDetail from "./STableDetail.vue"
// import { useFormModal } from "@/components/FormModal"
// import { FormDialog } from "@evue/schema-form"
import { deepClone } from "./utils/common"
import { Edit, Delete, Plus, ArrowDown, Document } from "@element-plus/icons-vue"
const props = defineProps({
  // 表格的数据
  data: {
    type: Array,
    default() {
      return []
    },
  },
  // 表格列模型
  columns: {
    type: Array,
    default() {
      return []
    },
  },
  pageOptions: {
    type: Object,
    default() {
      return {
        pageIndex: 1,
        pageSize: 10,
      }
    },
  },
  // 调用接口获取数据
  fetchData: {
    type: Function,
    default: null,
  },
  // 自定义创建函数
  fetchCreate: {
    type: Function,
    default: null,
  },
  // 自定义编辑函数
  fetchEdit: {
    type: Function,
    default: null,
  },
  // 自定义删除函数
  fetchRemove: {
    type: Function,
    default: null,
  },
  // 专门配置一些公共的参数
  option: {
    type: Object,
    default() {
      return {
        optionWidth: 160,
        hideMenu: false, // 是否隐藏右侧工具菜单
        hideOperation: false, // 是否隐藏操作列
        hideBtnAdd: false, // 是否隐藏添加按钮
        pageHide: false, // 是否隐藏分页器
        excelTitle: "", //导出表格的文件名
      }
    },
  },
})
const emits = defineEmits(["selectionChange"])
const list = computed(() => {
  const result = props.data.map((item) => {
    return item
  })

  return result
})
const tableAttrs = ref({})
const listQuery = reactive({
  pageIndex: 1,
  pageSize: 10,
})
const search = reactive({})
const filterVisible = ref(true)
const loading = ref(false)
const fetchData = () => {
  if (props.fetchData) {
    loading.value = true
    props.fetchData({ ...listQuery, search }).finally(() => {
      loading.value = false
    })
  }
}
// 总数量由外面决定
const total = computed(() => props.pageOptions.total || props.data.length || 0)
// 组装过滤器模型
const filterSchema = computed(() => {
  const result = []
  const getFilter = (columns) => {
    for (const i in columns) {
      const a = columns[i]
      if (a.children && a.children.length) {
        getFilter(a.children)
        continue
      }
      if (a.filter) {
        const options = a.options || []
        !options.some((a) => a.label == "全部") && options.unshift({ label: "全部", value: "" })
        result.push({
          type: a.filter.component || "input",
          label: a.label,
          prop: a.prop,
          options: options,
        })
      }
    }
  }
  getFilter(props.columns)
  return {
    formItem: result,
  }
})
// 搜索
const onSearch = (params) => {
  for (let i in params) {
    search[i] = params[i]
  }
  console.log("search", search)

  fetchData()
}
fetchData()
// 组装columns
const columns = ref([])
const cs = deepClone(props.columns)
// cs.map((a) => {
//   if (a.children) {
//     a.children = a.children.filter((b) => !b.hidden)
//   }
// })
columns.value = cs //.filter((a) => !a.hidden)
provide("columns", columns)
const getTableValue = (val, schema) => {
  if (schema.options) {
    const cur = schema.options.find((a) => a.value == val)
    return (cur && cur.label) || val
  }
  return val
}
// 菜单点击事件
const onMenuOption = (option, val) => {
  switch (option) {
    case "refresh":
      fetchData()
      break
    case "searchToggle":
      filterVisible.value = !filterVisible.value
      break
    case "size": {
      if (val) {
        tableAttrs.value.size = val
      }
      break
    }
    case "export":
      import("./utils/Export2Excel").then((excel) => {
        excel.export_json_to_excel({
          header: columns.value.map((a) => a.label),
          data: list.value.map((a) => columns.value.map((b) => getTableValue(a[b.prop], b))),
          filename: props.excelTitle || "导出数据",
        })
      })
      break
  }
}

// 添加/编辑
const create = (row) => {
  const formSchema = {
    formItem: [],
    rules: {},
  }
  const setItem = (a) => {
    const item = {
      type: (a.form && a.form.component) || "input",
      label: a.label,
      prop: a.prop,
      options: a.options,
      props: a.form && a.form.props,
      value: a.form && a.form.value,
      hidden: a.form && a.form.hidden,
      span: (a.form && a.form.span) || 12,
    }
    formSchema.formItem.push(item)
    if (a.form && a.form.rules) {
      formSchema.rules[a.prop] = a.form.rules
    }
  }
  columns.value.map((a) => {
    if (a.children && a.children.length) {
      for (let i in a.children) {
        setItem(a.children[i])
      }
    } else {
      setItem(a)
    }
  })
  import("@evue/schema-form").then((res) => {
    res.FormDialog.show({
      title: row ? "编辑" : "添加",
      formSchema: formSchema,
      fields: row,
      handleOk: async (modelRef) => {
        const fun = row ? "fetchCreate" : "fetchEdit"
        return await (props[fun] && props[fun](modelRef, row))
      },
    })
  })
}
const instance = getCurrentInstance()
const startremove = (scope) => {
  instance.appContext.config.globalProperties
    .$confirm("确认删除当前数据吗", "提示", {
      type: "warning",
      cancelButtonText: "取消",
      confirmButtonText: "确定",
    })
    .then(async () => {
      await (props.fetchRemove && props.fetchRemove(scope.row))
      instance.appContext.config.globalProperties.$message({
        type: "success",
        message: "删除成功",
      })
    })
}

const getColumnAttrs = (column) => {
  const { children, ...args } = column
  return args || children
}
// 详情
const STableDetailRef = ref()
const detail = (row) => {
  STableDetailRef.value.open({ data: row, columns: columns.value })
}
// 行点击事件
const onRowClick = (row) => {
  if (typeof instance.attrs["click-row-to-view"] !== "undefined") {
    detail(row)
  }
}
// 多选事件
const selectionChange = (rows) => {
  emits("selectionChange", rows)
}
</script>
<style lang="scss">
.table-container {
  .el-table {
    --el-table-header-bg-color: #f8f8f9;
    --el-table-header-text-color: #555;
  }
  .pagination {
    margin: 15px 0;
    text-align: right;
    font-weight: normal;
  }
  .table-control {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}
</style>
