import { createApp } from "vue"

import Dev from "./ServeView.vue"

import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import zhCn from "element-plus/es/locale/lang/zh-cn"

const app = createApp(Dev)
app.use(ElementPlus, { locale: zhCn, size: "mini" })
import { CurdTable } from "../src/components"
app.component("CurdTable", CurdTable)
import { FormDialog } from "@evue/schema-form"
app.use(FormDialog.install)
app.mount("#app")
