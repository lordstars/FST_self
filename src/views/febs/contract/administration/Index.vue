<template>
	<div class="app-container">
		<div class="filter-container">
			<el-select v-model="queryParams.contractNum" filterable placeholder="合同编号">
				<el-option v-for="item in contractAll" :key="item.id" :label="item.contractNum" :value="item.contractNum">
				</el-option>
			</el-select>
			<el-select v-model="queryParams.contractName" filterable placeholder="合同名称">
				<el-option v-for="item in contractAll" :key="item.id" :label="item.contractName" :value="item.contractName">
				</el-option>
			</el-select>
			<el-select v-model="queryParams.companyName" filterable placeholder="客户名称">
				<el-option v-for="item in customerNames" :key="item.id" :label="item.companyName" :value="item.companyName">
				</el-option>
			</el-select>
			<!--<div class="filter-item search-item">
      	 <el-select v-model="term" placeholder="是否到期">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
      </div>-->

			<el-button class="filter-item" type="primary" plain @click="search">搜索</el-button>
			<el-button class="filter-item" type="warning" plain @click="reset">重置</el-button>
			<el-dropdown v-has-any-permission="['user:add','user:delete','user:reset','user:export']" trigger="click" class="filter-item">
				<el-button>
					更多操作<i class="el-icon-arrow-down el-icon--right" />
				</el-button>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item v-has-permission="['contractManagement:add']" @click.native="add">添加</el-dropdown-item>
					<el-dropdown-item v-has-permission="['contractManagement:delete']" @click.native="batchDelete">删除</el-dropdown-item>
					<!-- <el-dropdown-item v-has-permission="['contractManagement:reset']" @click.native="resetPassword">密码重置</el-dropdown-item>-->
					<el-dropdown-item v-has-permission="['contractManagement:export']" @click.native="exportExcel">导出</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>

		<el-table ref="table" :key="tableKey" v-loading="loading" :data="list" border fit stripe :header-cell-style="{background:'#eef1f6',color:'#606266'}" style="width: 100%;" @selection-change="onSelectChange" @sort-change="sortChange">
			<el-table-column type="selection" align="center" width="50"/>
			<el-table-column type="index" label='序号' width="50" align="center"> </el-table-column>
			<el-table-column label="合同编号" :show-overflow-tooltip="true" align="center" min-width="100px">
				<template slot-scope="scope">
					<span>{{scope.row.contractNum }}</span>
				</template>
			</el-table-column>
			<el-table-column label="合同名称" :show-overflow-tooltip="true" align="center" min-width="150px">
				<template slot-scope="scope">
					<span>{{scope.row.contractName}}</span>
				</template>
			</el-table-column>
			
			<el-table-column label="客户名称" align="center" min-width="150px">
				<template slot-scope="scope">
					<span>{{scope.row.companyName}}</span>
				</template>
			</el-table-column>
			<el-table-column label="客户等级" align="center" min-width="70px">
				<template slot-scope="scope">
					<span>{{scope.row.httcurrentLevel}}</span>
				</template>
			</el-table-column>
			<el-table-column label="签订日期" align="center" min-width="100px">
				<template slot-scope="scope">
					<span>{{scope.row.contractBeginning}}</span>
				</template>
			</el-table-column>
			<el-table-column label="终止日期" align="center" min-width="100px">
				<template slot-scope="scope">
					<span>{{scope.row.contractEnd}}</span>
				</template>
			</el-table-column>
			<el-table-column label="合同年限" align="center" min-width="50px">
				<template slot-scope="scope">
					<span>{{scope.row.contractYears}}</span>
				</template>
			</el-table-column>
			<el-table-column label="是否顺延" align="center" min-width="50px">
				<template slot-scope="scope">
					<span>{{scope.row.is_Postpone}}</span>
				</template>
			</el-table-column>
			<el-table-column label="合同负责人" align="center" min-width="80px">
				<template slot-scope="scope">
					<span>{{scope.row.contractHead}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" min-width="80px" class-name="small-padding fixed-width">
				<template slot-scope="{row}">
					<i v-hasPermission="['contractManagement:view']" class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
					<i v-hasPermission="['contractManagement:update']" class="el-icon-edit table-operation" style="color: #2db7f5;" @click="edit(row)" />
					<i v-hasPermission="['contractManagement:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
					<el-link v-has-no-permission="['user:view','user:update','user:delete']" class="no-perm">
						无权限
					</el-link>
				</template>
			</el-table-column>
		</el-table>
		<pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="fetch" />
		<user-edit ref="edit" :dialog-visible="dialog.isVisible" :title="dialog.title" @success="editSuccess" @close="editClose" />
		<user-view ref="view" :dialog-visible="userViewVisible" @close="viewClose" />
	</div>
</template>

<script>
	import Pagination from '@/components/Pagination'
	import UserEdit from './Edit'
	import UserView from './View'

	export default {
		name: 'ContractManage',
		components: {
			Pagination,
			UserEdit,
			UserView
		},
		filters: {
			sexFilter(status) {
				const map = {
					0: 'success',
					1: 'danger',
					2: 'info'
				}
				return map[status]
			},
			statusFilter(status) {
				const map = {
					0: 'danger',
					1: 'success'
				}
				return map[status]
			}
		},
		data() {
			return {
				dialog: {
					isVisible: false,
					title: ''
				},
				userViewVisible: false,
				tableKey: 0,
				loading: false,
				list: [],
				numRules:[],//整合的合同编号的数组
				total: 0,
				queryParams: {
					contractNum: "",
					contractName: "",
					companyName: ""
				},
				customerNames: [],
				contractAll: [],
				sort: {},
				selection: [],
				pagination: {
					size: 10,
					num: 1
				},
				options: [{
					value: '选项1',
					label: '全部'
				}, {
					value: '选项2',
					label: '超期'
				}, {
					value: '选项3',
					label: '未逾期'
				}],
				term: '',
				numberList: [],

			}
		},
		computed: {
			currentUser() {
				return this.$store.state.account.user
			}
		},
		mounted() {
			this.fetch()
			//获取客户名称
			this.getCustomerNames()
			//获取合同编号,合同名称
			this.getcontractAll()

		},
		methods: {
			transSex(sex) {
				switch(sex) {
					case '0':
						return this.$t('common.sex.male')
					case '1':
						return this.$t('common.sex.female')
					default:
						return this.$t('common.sex.secret')
				}
			},
			filterStatus(value, row) {
				return row.status === value
			},
			filterSex(value, row) {
				return row.sex === value
			},
			viewClose() {
				this.userViewVisible = false
			},
			editClose() {
				this.dialog.isVisible = false
			},
			editSuccess() {
				this.search()
				this.getcontractAll()
			},
			onSelectChange(selection) {
				this.selection = selection
			},
			search() {
				console.log("搜索条件查询")
				this.fetch({
					...this.queryParams,
					...this.sort
				})
			},
			reset() {
				this.queryParams = {}
				this.sort = {}
				this.$refs.table.clearSort()
				this.$refs.table.clearFilter()
				this.search()
			},
			exportExcel() {
				this.$download('system/user/excel', {
					pageSize: this.pagination.size,
					pageNum: this.pagination.num,
					...this.queryParams
				}, `user_${new Date().getTime()}.xlsx`)
			},
			
			resetPassword() {
				if(!this.selection.length) {
					this.$message({
						message: this.$t('tips.noDataSelected'),
						type: 'warning'
					})
					return
				}
				this.$confirm(this.$t('tips.confirmRestPassword'), this.$t('common.tips'), {
					confirmButtonText: this.$t('common.confirm'),
					cancelButtonText: this.$t('common.cancel'),
					type: 'warning'
				}).then(() => {
					const userNames = []
					this.selection.forEach((u) => {
						userNames.push(u.username)
					})
					this.$put('system/user/password/reset', {
						usernames: userNames.join(',')
					}).then(() => {
						this.$message({
							message: this.$t('tips.resetPasswordSuccess'),
							type: 'success'
						})
						this.clearSelections()
					})
				}).catch(() => {
					this.clearSelections()
				})
			},
			//单行删除
			singleDelete(row) {
				console.log("点击删除单行", row)
				this.$refs.table.toggleRowSelection(row, true)
				this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$delete("system/contractManagement/" + row.id).then(() => {
						this.$message({
							message: "删除成功",
							type: 'success'
						})
						this.clearSelections()
						this.search()
					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});

				//    this.batchDelete()
			},
			//批量删除
			batchDelete() {
				if(!this.selection.length) {
					this.$message({
						message: "请先选择需要操作的数据",
						type: 'warning'
					})
					return
				}
				//    let contain = false
				this.$confirm("选中数据将被永久删除 是否继续？", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: 'warning'
				}).then(() => {
					const userIds = []
					this.selection.forEach((u) => {
						console.log("遍历到的每一行")
						console.log(u)
						//        if (u.id === this.currentUser.userId) {
						//          contain = true
						//          return
						//        }
						userIds.push(u.id)

					})
					console.log("查看选择删除的id", userIds)
					this.delete(userIds)
					//      if (contain) {
					//        this.$message({
					//          message: "包含当前登录用户，操作已取消",
					//          type: 'warning'
					//        })
					//        this.clearSelections()
					//      } else {
					//      	
					//        this.delete(userIds)
					//      }
				}).catch(() => {
					this.clearSelections()
				})
			},
			clearSelections() {
				this.$refs.table.clearSelection()
			},
			delete(userIds) {
				console.log("进入删除方法")
				console.log(userIds)
				this.$delete(`system/contractManagement/${userIds}`).then(() => {
					this.$message({
						message: "删除成功",
						type: 'success'
					})
					this.clearSelections()
					this.search()
				})
			},
			add() {
				this.dialog.title = "添加"
				this.dialog.isVisible = true
				console.log("点击添加时传参合同编号数组用来校验")
				console.log(this.list)
				for (var i = 0; i < this.list.length; i++) {
					this.numRules.push(this.list[i].contractNum) 
				}
				console.log(this.numRules)
				this.$refs.edit.forValidator(this.numRules)
				
			},
			view(row) {
				this.$refs.view.setUser(row)
				this.userViewVisible = true
			},
			edit(row) {
				console.log("点击编辑")
				console.log(row)
				let roleId = []
				if(row.roleId && typeof row.roleId === 'string') {
					roleId = row.roleId.split(',')
					row.roleId = roleId
				}
				this.$refs.edit.setUser(row)
				this.dialog.title = "修改"
				this.dialog.isVisible = true
			},
			fetch(params = {}) {
				console.log("开始执行fetch方法")
				params.pageSize = this.pagination.size
				params.pageNum = this.pagination.num
				//    if (this.queryParams.timeRange) {
				//      params.createTimeFrom = this.queryParams.timeRange[0]
				//      params.createTimeTo = this.queryParams.timeRange[1]
				//    }
				this.loading = true
				this.$get('system/contractManagement/list', {
					...params
				}).then((r) => {
					console.log("查询列表请求成功")
					console.log(r.data.data)
					const data = r.data.data
					this.total = data.total
					this.list = data.rows
					for(var i = 0; i < data.rows.length; i++) {
						if(data.rows[i].isPostpone == "2") {
							this.list[i].is_Postpone = "否"
						}
						if(data.rows[i].isPostpone == "1") {
							this.list[i].is_Postpone = "是"
						}
					}
					for(var i = 0; i < data.rows.length; i++) {
						if(data.rows[i].currentLevel == null) {
							this.list[i].httcurrentLevel = "默认"
						}else{
							this.list[i].httcurrentLevel = data.rows[i].currentLevel
						}
					}

					this.loading = false
				})
			},
			sortChange(val) {
				this.sort.field = val.prop
				this.sort.order = val.order
				this.search()
			},
			//查询客户名称
			getCustomerNames() {
				this.$get("system/companyDictionary").then((res) => {
					console.log("获取客户名称列表")
					console.log(res.data.data)
					this.customerNames = res.data.data
				})
			},
			//查询合同编号，合同名称
			getcontractAll() {
				this.$get("system/contractManagement").then((res) => {
					console.log("获取合同编号和合同名称")
					console.log(res.data.data)
					this.contractAll = res.data.data
				})
			},

		}
	}
</script>
<style lang="scss" scoped>

</style>