<template>
	<el-dialog :title="title" :width="width" top="10px" bottom="-10px" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="isVisible" :loading="loading">
		<el-form ref="form" :model="user" :rules="rules" label-position="right" label-width="130px">
			<!--<div class="rowInfo">-->
			<el-form-item label="录入人：" prop="entryPerson">
				<el-input v-model="user.entryPerson" readonly="readonly" :disabled="true" />
			</el-form-item>
			<!--<el-form-item label="录入时间：" prop="currentTime">
				<el-input v-model="user.currentTime" readonly="readonly" :disabled="true" />
			</el-form-item>-->
			<!--</div>-->

			<el-form-item label="公司名称：" prop="companyName" v-show="!this.user.id">
				<el-select v-model="user.companyName" filterable placeholder="客户名称">
					<el-option v-for="item in customerNames" :key="item.id" :label="item.companyName" :value="item.companyName">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="公司名称：" prop="companyName" v-show="this.user.id">
				<el-select v-model="user.companyName" filterable placeholder="客户名称" disabled="disabled">
					<el-option v-for="item in customerNames" :key="item.id" :label="item.companyName" :value="item.companyName">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="信用等级：" prop="temporary">
				<el-radio v-model="user.temporary" label="A">A</el-radio>
				<el-radio v-model="user.temporary" label="B">B</el-radio>
				<el-radio v-model="user.temporary" label="C">C</el-radio>
			</el-form-item>
			<el-form-item label="变更缘由：" prop="changeReason" v-show="this.user.id">
				<el-input v-model="user.changeReason" type="textarea" />
			</el-form-item>
			<!--<div v-show="this.user.id">-->
			<!--<div v-show="this.user.id">
				<el-form-item label="变更历史：">
				</el-form-item>
				<el-table ref="table" :key="tableKey" :data="user.innerList" border fit stripe :header-cell-style="{background:'#eef1f6',color:'#606266'}" style="width: 90%;margin: 0 auto;">
					<el-table-column type="index" label='序号' width="50" align="center"> </el-table-column>
					<el-table-column label="等级" align="center" min-width="50px">
						<template slot-scope="scope">
							<span>{{scope.row.in_level}}</span>
						</template>
					</el-table-column>
					<el-table-column label="日期" align="center" min-width="100px">
						<template slot-scope="scope">
							<span>{{scope.row.in_time}}</span>
						</template>
					</el-table-column>
					<el-table-column label="缘由" align="center" min-width="120px">
						<template slot-scope="scope">
							<span>{{scope.row.in_reason}}</span>
						</template>
					</el-table-column>
				</el-table>
			</div>-->

		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button type="warning" plain @click="nosub">
				{{ $t('common.cancel') }}
			</el-button>
			<el-button type="primary" plain @click="submitForm">
				{{ $t('common.confirm') }}
			</el-button>
		</div>
	</el-dialog>
</template>
<script>
	import { validMobile } from '@/utils/my-validate'

	export default {
		name: 'creditEdit',
		props: {
			dialogVisible: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: ''
			}
		},
		data() {
			var validatorName = (rule, value, callback) => {
				for(var i = 0; i < this.name_list.length; i++) {
					if(this.name_list[i] == value) {
						callback(new Error('已存在此公司'));
					}
				}
				callback()
			};
			return {
				user: this.initUser(),
				screenWidth: 0,
				width: this.initWidth(),
				depts: [],
				roles: [],
				calEnd: "",
				calStart: "",
				fileString: "",
				tableKey: 0,
				importHeaders: {
					"Authorization": "bearer " + localStorage.getItem("token")
				},
				customerNames: [],
				rules: {
					companyName:[{
						required: true,
						message: '请填写公司名称',
						trigger: 'blur'
					},{
						validator: validatorName,
						trigger: 'blur'
					}],
					temporary: {
						required: true,
						message: '请选择信用等级',
						trigger: 'blur'
					}

				},
				loading:false,
				name_list:[],
			}
		},
		computed: {
			isVisible: {
				get() {
					return this.dialogVisible
				},
				set() {
					this.close()
					this.reset()
				}
			},
			contractYears: function() {
				return this.calEnd - this.calStart
			}
		},
		mounted() {
				this.loading=true
			console.log("初次加载获取token")
			console.log(localStorage.getItem("token"))

			this.initDept()
			this.initRoles()
//			this.getCustomerNames()
			window.onresize = () => {
				return(() => {
					this.width = this.initWidth()
				})()
			}
		},
		methods: {
			initUser() {
				return {
					id:"",
					initialLevel:"",
					entryPerson: localStorage.getItem("currentusername"),
					companyName: '',
				}
			},
			initWidth() {
				this.screenWidth = document.body.clientWidth
				if(this.screenWidth < 991) {
					return '90%'
				} else if(this.screenWidth < 1400) {
					return '45%'
				} else {
					return '650px'
				}
			},
			initDept() {
				this.$get('system/dept').then((r) => {
					this.depts = r.data.data.rows
				}).catch((error) => {
					console.error(error)
					this.$message({
						message: this.$t('tips.getDataFail'),
						type: 'error'
					})
				})
			},
			initRoles() {
				this.$get('system/role/options').then((r) => {
					this.roles = r.data.data
				}).catch((error) => {
					console.error(error)
					this.$message({
						message: this.$t('tips.getDataFail'),
						type: 'error'
					})
				})
			},
			forValidator(val) {
				console.log("首页传入公司名称数组进行验证")
				console.log(val)
				this.name_list = val

			},
			//此方法直接拿父级已经获取过的值 减少一次接口请求
			carry(val){
				console.log("携带父页面以获取到的公司列表")
				this.customerNames=val
			},
			setUser(val) {

				console.log("编辑信息传过来的row")
				console.log(val)
				this.user = { ...val}
				this.user.temporary=val.currentLevel
				this.user.entryPerson=localStorage.getItem("currentusername")
			},
			close() {
				this.$emit('close')
			},
			submitForm() {
				console.log("开始提交")
				
				this.$refs.form.validate((valid) => {
					if(valid) {
						this.loading=true
						console.log("合法")
						if(!this.user.id) {
							console.log("id为空,是添加页面")
							// create
						
							this.$put('system/companyDictionary', { ...this.user
							}).then((res) => {
								this.loading=false
								console.log("新增提交")
								console.log(res)
								this.isVisible = false
								this.$message({
									message: "新增成功",
									type: 'success'
								})
								this.$emit('success')
							})
						} else {
							console.log("id不为空,编辑页面")
							console.log(this.user)
//							if(this.user.currentState_self == "默认") {
//							this.user.currentState = "0"
//						}
//						if(this.user.currentState_self == "升") {
//							this.user.currentState = "1"
//						}
//						if(this.user.currentState_self == "降") {
//							this.user.currentState = "2"
//						}
//						if(this.user.createTime_self == "暂未变更") {
//							console.log("暂未变更修改字段名")
//							this.user.createTime = null
//						}else{
//							this.user.createTime = this.user.createTime_self
//							
//						}
//						if(this.user.changeReason_self == "暂未变更") {
//							this.user.changeReason = null
//						}else{
//							this.user.changeReason = this.user.changeReason_self
//							
//						}
							// update
							let params =this.user
							console.log("params取代")
							console.log(params)
							
//							delete params.createTime
							this.$put('system/companyDictionary',params).then((res) => {
								this.loading=false
								console.log("重新编辑后提交")
								this.isVisible = false
								this.$message({
									message: "修改成功",
									type: 'success'
								})
								this.$emit('success')
							})
						}
					} else {
						return false
					}
				})
			},
			reset() {
				// 先清除校验，再清除表单，不然有奇怪的bug
				this.$refs.form.clearValidate()
				this.$refs.form.resetFields()
				this.user = this.initUser()
			},
			nosub() {
				this.isVisible = false
			},
			//查询客户名称
//			getCustomerNames() {
//				this.$get("system/companyDictionary").then((res) => {
//				this.loading=false
//					
//					console.log("获取公司名称列表")
//					console.log(res.data.data)
//					this.customerNames = res.data.data
//				})
//			},
		}
	}
</script>
<style lang="scss" scoped>
	.el-input {
		width: 250px;
	}
	
	.el-select {
		width: 250px;
	}
	
	.el-textarea {
		width: 300px;
	}
	
	.rowInfo {
		display: flex;
	}
</style>