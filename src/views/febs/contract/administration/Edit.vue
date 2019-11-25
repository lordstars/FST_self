<template>
	<el-dialog :title="title" :width="width" top="10px" bottom="-10px" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="isVisible" >
		<el-form ref="form" :model="user" :rules="rules" label-position="right" label-width="130px" v-loading="loading">
			<el-form-item label="录入人：" prop="entryPerson">
				<!--<el-input v-model="user.entryPerson" :readonly="user.id === '' ? false : 'readonly'" />-->
				<el-input v-model="user.entryPerson" disabled="disabled" />

			</el-form-item>
			<el-form-item label="客户名称：" prop="companyName" v-show="!this.user.id">
				<el-select v-model="user.companyName" filterable placeholder="客户名称">
					<el-option v-for="item in customerNames" :key="item.id" :label="item.companyName" :value="item.companyName">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="客户名称：" prop="companyName" v-show="this.user.id">
				<!--<el-input v-model="user.companyName" />-->
				<el-select v-model="user.companyName" filterable placeholder="客户名称" disabled="disabled">
					<el-option v-for="item in customerNames" :key="item.id" :label="item.companyName" :value="item.companyName">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="合同编号：" prop="contractNum" v-show="!this.user.id">
				<el-input v-model="user.contractNum" />
			</el-form-item>
			<el-form-item label="合同编号：" v-show="this.user.id">
				<el-input v-model="user.contractNum" disabled="disabled" />
			</el-form-item>
			<el-form-item label="合同性质：" prop="contractNature">
				<el-radio v-model="user.contractNature" label="1">我司</el-radio>
				<el-radio v-model="user.contractNature" label="2">非我司</el-radio>
			</el-form-item>
			<el-form-item label="合同分类：" prop="contractType">
				<el-radio v-model="user.contractType" label="1">空运</el-radio>
				<el-radio v-model="user.contractType" label="2">海运</el-radio>
				<el-radio v-model="user.contractType" label="3">其他</el-radio>
			</el-form-item>
			<el-form-item label="合同名称：" prop="contractName">
				<el-input v-model="user.contractName" />
			</el-form-item>
			<el-form-item label="合同起始日期：" prop="contractBeginning">
				<el-date-picker v-model="user.contractBeginning" type="date" placeholder="选择起始日期" @change="startChange" value-format="yyyy-MM-dd">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="合同终止日期：" prop="contractEnd">
				<el-date-picker v-model="user.contractEnd" type="date" placeholder="合同终止日期" @change="endChange" value-format="yyyy-MM-dd">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="合同年限：" prop="contractYears">
				<el-input v-model="user.contractYears" />
			</el-form-item>
			<el-form-item label="合同负责人：" prop="contractHead">
				<el-input v-model="user.contractHead" />
			</el-form-item>
			<el-form-item label="是否延期：" prop="isPostpone">
				<el-radio v-model="user.isPostpone" label="1">是</el-radio>
				<el-radio v-model="user.isPostpone" label="2">否</el-radio>
			</el-form-item>
			<el-form-item label="年限：" prop="postponeYears" v-show='user.isPostpone==1'>
				<el-radio v-model="user.postponeYears" label="1">1</el-radio>
				<el-radio v-model="user.postponeYears" label="2">3</el-radio>
				<el-radio v-model="user.postponeYears" label="3">5</el-radio>
			</el-form-item>
			<el-form-item label="上传附件：" prop="upload" v-show="!this.user.id">
				<el-upload class="upload-demo" :action="url" :auto-upload="false" multiple :file-list="fileList" :before-upload="beforeUpload" :on-success="uploadFile" ref="upload" :http-request="httpRequest" :on-change="handleChange" :on-remove="beforeRemove">
					<el-button size="small" type="primary">点击上传</el-button>
				</el-upload>
			</el-form-item>

			<!--v-show="!this.user.id"-->
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
	import Treeselect from '@riophae/vue-treeselect'
	import '@riophae/vue-treeselect/dist/vue-treeselect.css'

	export default {
		name: 'UserEdit',
		components: {
			Treeselect
		},
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
			var validatorNum = (rule, value, callback) => {
				for(var i = 0; i < this.num_list.length; i++) {
					if(this.num_list[i] == value) {
						callback(new Error('已存在此合同编号'));
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
				fileList: [],
				calEnd: "",
				calStart: "",
				fileString: "",
				hasList: "",
				loading: false,
				importHeaders: {
					"Authorization": "bearer " + localStorage.getItem("token")
				},
				url:"http://120.77.233.206:8301/system/file/upload/",
//				url: "http://192.168.1.102:8301/system/file/upload/",
				customerNames: [],
				//				uploadForm: new FormData(),
				file: [],
				num_list: [], //首页传过来的合同编号数组
				rules: {
					contractNum: [{
						required: true,
						message: '不能为空',
						trigger: 'blur'
					}, {
						validator: validatorNum,
						trigger: 'blur'
					}],
					contractNature: {
						required: true,
						message: '请选择',
						trigger: 'blur'
					},
					contractType: {
						required: true,
						message: '请选择',
						trigger: 'blur'
					},
					contractName: {
						required: true,
						message: '请填写客户名称',
						trigger: 'blur'
					},
					contractBeginning: {
						required: true,
						message: '请选择起始日期',
						trigger: 'blur'
					},
					contractEnd: {
						required: true,
						message: '请选择终止日期',
						trigger: 'blur'
					},
					contractYears: {
						required: true,
						message: '请填写合同年限',
						trigger: 'blur'
					},
					contractHead: {
						required: true,
						message: '请填写合同负责人',
						trigger: 'blur'
					},
					isPostpone: {
						required: true,
						message: '请选择',
						trigger: 'blur'
					},
					companyName: {
						required: true,
						message: '请填写客户名称',
						trigger: 'blur'
					}

				}
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
			},
		},
		mounted() {
			console.log("初次加载获取token")
			console.log(localStorage.getItem("token"))

			this.initDept()
			this.initRoles()
			this.getCustomerNames()
			window.onresize = () => {
				return(() => {
					this.width = this.initWidth()
				})()
			}
		},
		methods: {
			initUser() {
				return {
					id: '',
					entryPerson: localStorage.getItem("currentusername"),
					contractNum: '',
					contractNature: '',
					contractType: '',
					contractName: '',
					contractBeginning: '',
					contractEnd: '',
					contractYears: '',
					contractHead: '',
					isPostpone: '',
					postponeYears: '',
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
			setUser(val) {
				console.log("编辑信息传过来的row")
				console.log(val)
				this.user = { ...val}
			},
			forValidator(val) {
				console.log("首页传入合同编号数组进行验证")
				console.log(val)
				this.num_list = val

			},
			close() {
				this.$emit('close')
			},

			submitForm() {
				this.loading = true
				console.log("开始提交")
				this.$refs.form.validate((valid) => {
					console.log("开始校验")
					if(valid) {
						console.log("合法")
						if(!this.user.id) {
							console.log("id为空")
							var upData = new FormData() //首先创建FormData对象
							this.$refs.upload.submit() //触发文件手动上传
							this.file.forEach(function(file) {
								upData.append('file', file, file.name); // 因为要上传多个文件，所以需要遍历一下才行
							})
							upData.append("body", JSON.stringify(this.user)) // 这里需要转换一下格式传给后台
							this.$axios({
								method: 'post',
								url: 'http://120.77.233.206:8301/system/file/upload/',
								data: upData,
								headers: {
									'Authorization': "bearer " + localStorage.getItem("token"),
									'Content-Type': 'multipart/form-data'
								},

							}).then(res => {
								this.loading = false
								console.log("原始请求成功")
								this.isVisible = false
								this.fileList = []
								this.$message({
									message: "新增成功",
									type: 'success'
								})
								this.$emit('success')
							})
						} else {
							console.log("id不为空")
							// update
							let params =this.user
							delete params.createTime
							
							console.log("传递user对象")
//							let currentLevel=this.user.httcurrentLevel
//							if(this.user.httcurrentLevel=="默认"){
//								currentLevel=null
//							}else{
//								currentLevel=this.user.httcurrentLevel
//							}
//							this.$set(params,"currentLevel",currentLevel)
//							console.log(params)
							this.$put('system/contractManagement',params).then((res) => {
								this.loading = false
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
						this.loading = false
						console.log("信息不合法")
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
			httpRequest(param) {
				console.log("自定义上传文件请求")
				this.file.push(param.file)
			},
			//增加模块上传相关
			handleRemove(file, fileList) {
				console.log("文件列表移除")
				console.log(file, fileList);
			},
			handlePreview(file) {

				console.log(file);
			},

			startChange() {
				console.log("选择起始日期")
				console.log(this.user.contractBeginning)
				console.log(this.user.contractBeginning.split("-")[0])
				this.calStart = this.user.contractBeginning.split("-")[0]
				var d0 = new Date(this.user.contractBeginning.replace(/\-/g, "\/"));
				var d1 = new Date(this.user.contractEnd.replace(/\-/g, "\/"));
				if(this.user.contractBeginning != "" && this.user.contractEnd != "" && d0 >= d1) {
					this.$alert('终止日期不可早于起始日期', '提示', {
						confirmButtonText: '确定',
						callback: action => {}
					});
					this.user.contractBeginning = ""
					return false;
				}
			},
			endChange() {
				console.log("选择终止日期")
				console.log(this.user.contractEnd)
				var d0 = new Date(this.user.contractBeginning.replace(/\-/g, "\/"));
				var d1 = new Date(this.user.contractEnd.replace(/\-/g, "\/"));
				if(this.user.contractBeginning != "" && this.user.contractEnd != "" && d0 >= d1) {
					this.$alert('终止日期不可早于起始日期', '提示', {
						confirmButtonText: '确定',
						callback: action => {}
					});
					this.user.contractEnd = ""
					return false;
				}
				console.log(this.user.contractEnd.split("-")[0])
				this.calEnd = this.user.contractEnd.split("-")[0]
			},
			handleChange(file, fileList) {
				console.log("文件改变")
				console.log(fileList)
				console.log(fileList.length)
				this.hasList = fileList.length

			},
			beforeRemove(file, fileList) {
				console.log("移除文件")
				console.log(fileList)
				console.log(fileList.length)
				this.hasList = fileList.length
			},
			uploadFile(response, file, fileList) {
				console.log("文件上传成功")
				console.log(file)
				console.log(fileList)
				this.isVisible = false
				this.fileList = []
				this.$message({
					message: "新增成功",
					type: 'success'
				})
				this.$emit('success')

				//				let FormData = new FormData();
				//        		FormData.append('file', file);
				//				this.user.multipartFiles =fileList
				//				this.user.multipartFiles =FormData
				//				this.fileString = this.fileString + "_" + response
				//				console.log(this.fileString)

				//				this.user.contractFile =fileList
			},
			beforeUpload(file) {

				console.log("文件上传之前")
				console.log(file)
				//				this.user.contractFile =file
				//				this.$post("system/file/upload/",{
				//					
				//				}).then((res) => {
				//					console.log("同步上传成功")
				//				})
				//				http://120.77.233.206:8301/system/file/upload/
			},
			nosub() {
				this.isVisible = false
				this.fileList = []
			},
			//查询客户名称
			getCustomerNames() {
				this.$get("system/companyDictionary").then((res) => {
					console.log("获取客户名称列表")
					console.log(res.data.data)
					this.customerNames = res.data.data
				})
			},
		}
	}
</script>
<style lang="scss" scoped>
	.el-input {
		width: 220px;
	}
	
	.el-select {
		width: 220px;
	}
</style>