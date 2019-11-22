/* eslint-disable */
import Vue from 'vue'
import 'normalize.css/normalize.css' 
// a modern alternative to CSS resets
//Normalize.css只是一个很小的css文件，但它在磨人的HTML元素样式上提供了跨浏览器的高度一致性
import Element from 'element-ui'
import './styles/element-variables.scss'
import '@/styles/index.scss' // 全局样式
import App from './App'
import store from './store'
import router from './router'
import i18n from './lang' // 中英文切换 它的语法是&t("") 它的详细用法见 lang/index.js
import './icons' // icon
import './utils/error-log' // error log
import request from '@/utils/request'
import * as filters from './filters' // global filters
import axios from 'axios'
Vue.prototype.$axios = axios
//import * as xxx from 'xxx'  会将 "xxx" 中所有 export 导出的内容组合成一个对象返回
//(或import * as obj from 'xx'  这种写法是把所有的输出包裹到obj对象里);
import { hasPermission, hasNoPermission, hasAnyPermission } from './utils/permissionDirect'
const Plugins = [
  hasPermission,
  hasNoPermission,
  hasAnyPermission
]

Plugins.map((plugin) => {
  Vue.use(plugin)
})

Vue.use(Element, {
  i18n: (key, value) => i18n.t(key, value)
})

Vue.prototype.$post = request.post
Vue.prototype.$get = request.get
Vue.prototype.$put = request.put
Vue.prototype.$delete = request.delete
Vue.prototype.$download = request.download
Vue.prototype.$upload = request.upload
Vue.prototype.$login = request.login

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
