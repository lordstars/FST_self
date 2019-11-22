<template>
	<div class="app-container">
		<div class="filter-container">
			<el-select v-model="queryParams.companyName" filterable placeholder="公司名称">
				<el-option v-for="item in customerNames" :key="item.id" :label="item.companyName" :value="item.companyName">
				</el-option>
			</el-select>
			<el-select v-model="queryParams.currentLevel" filterable placeholder="当前等级">
				<el-option v-for="item in currentLevels" :key="item.id" :label="item.currentLevel" :value="item.currentLevel">
				</el-option>
			</el-select>
			<!--<el-date-picker v-model="queryParams.changeTime" type="date" placeholder="变更日期" @change="changeTime" value-format="yyyy-MM-dd">
				</el-date-picker>-->
			<el-button class="filter-item" type="primary" plain @click="search">搜索</el-button>
			<el-button class="filter-item" type="warning" plain @click="reset">重置</el-button>
			<el-button class="filter-item" type="success" plain v-has-permission="['companyDictionary:update']" @click.native="add">添加</el-button>
			
		</div>
		<el-table ref="table" :key="tableKey" v-loading="loading" :data="list" border fit stripe :header-cell-style="{background:'#eef1f6',color:'#606266'}" style="width: 100%;" @selection-change="onSelectChange" @sort-change="sortChange">
			<el-table-column type="index" label='序号' width="50" align="center"> </el-table-column>

			<el-table-column label="公司名称" align="center" min-width="150px">
				<template slot-scope="scope">
					<span>{{scope.row.companyName}}</span>
				</template>
			</el-table-column>
			<el-table-column label="初始等级" align="center" min-width="50px">
				<template slot-scope="scope">
					<span>{{scope.row.initialLevel}}</span>
				</template>
			</el-table-column>
			<el-table-column label="当前等级" align="center" min-width="50px">
				<template slot-scope="scope">
					<span>{{scope.row.currentLevel}}</span>
				</template>
			</el-table-column>
			<el-table-column label="当前状态" align="center" min-width="50px">
				<template slot-scope="scope">
					<span>{{scope.row.currentState_self}}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态变更日期" align="center" min-width="100px">
				<template slot-scope="scope">
					<span>{{scope.row.createTime_self}}</span>
				</template>
			</el-table-column>
			<el-table-column label="变更缘由" align="center" min-width="120px">
				<template slot-scope="scope">
					<span>{{scope.row.changeReason_self}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" min-width="50px" class-name="small-padding fixed-width">
				<template slot-scope="{row}">
					<i v-hasPermission="['stateChange:view']" class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
					<i v-hasPermission="['stateChange:update']" class="el-icon-edit table-operation" style="color: #2db7f5;" @click="edit(row)" />
					<i v-hasPermission="['stateChange:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
					<!--<el-link v-has-no-permission="['user:view','user:update','user:delete']" class="no-perm">
						无权限
					</el-link>-->
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
		name: 'credit',
		components: {
			Pagination,
			UserEdit,
			UserView
		},
		data() {
			return {
				queryParams: {
					companyName: '',
					currentLevel: "",
				},
				currentLevels: [{
					id: "1",
					currentLevel: "A"
				}, {
					id: "2",
					currentLevel: "B"
				}, {
					id: "3",
					currentLevel: "C"
				}],
				customerNames: [],
				numberList: [],
				sort: {},
				list: [],
				pagination: {
					size: 10,
					num: 1
				},
				loading: false,
				tableKey: 0,
				total: 0,
				dialog: {
					isVisible: false,
					title: ''
				},
				userViewVisible: false,
				nameRules:[],
			}
		},
		mounted() {
			this.fetch()
			this.getCustomerNames()
		},
		methods: {
			viewClose() {
				this.userViewVisible = false
			},
			editClose() {
				this.dialog.isVisible = false
			},
			editSuccess() {
				this.search()
			},
			search() {
				console.log("搜索条件")
				this.fetch({
					...this.queryParams,
					...this.sort
				})
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
				this.$get('system/companyDictionary/list', {
					...params
				}).then((r) => {
					this.loading = false
					console.log("信用等级列表")
					console.log(r)
					this.total = r.data.data.total
					this.list = r.data.data.rows
					for(var i = 0; i < r.data.data.rows.length; i++) {
						if(r.data.data.rows[i].currentState == "0") {
							this.list[i].currentState_self = "默认"
						}
						if(r.data.data.rows[i].currentState == "1") {
							this.list[i].currentState_self = "升"
						}
						if(r.data.data.rows[i].currentState == "2") {
							this.list[i].currentState_self = "降"
						}
						if(r.data.data.rows[i].createTime == null) {
							this.list[i].createTime_self = "暂未变更"
						}else{
							this.list[i].createTime_self = r.data.data.rows[i].createTime
						}
						if(r.data.data.rows[i].changeReason == null) {
							this.list[i].changeReason_self = "暂未变更"
						}else{
							this.list[i].changeReason_self = r.data.data.rows[i].changeReason
							
						}
						
					}

				})
			},
			reset() {
				console.log("重置")
				this.queryParams = {}
				this.sort = {}
				this.$refs.table.clearSort()
				this.$refs.table.clearFilter()
				this.search()
			},
			//查询客户名称
			getCustomerNames() {
				this.$get("system/companyDictionary").then((res) => {
					console.log("获取公司名称")
					console.log(res.data.data)
					this.customerNames = res.data.data
				})
			},
			sortChange(val) {
				this.sort.field = val.prop
				this.sort.order = val.order
				this.search()
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
					this.$delete("system/stateChange/" + row.id).then(() => {
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
					this.clearSelections()

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
				//把公司名称单独放一个数组传给添加页面
				console.log(this.list)
				for (var i = 0; i < this.list.length; i++) {
					this.nameRules.push(this.list[i].companyName) 
				}
				console.log(this.nameRules)
				this.$refs.edit.forValidator(this.nameRules)
				this.$refs.edit.carry(this.customerNames)
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
		
			onSelectChange(selection) {
				this.selection = selection
			},
			changeTime() {
				console.log("选择变更日期")
			},
		}
	}
</script>

<style>

</style>