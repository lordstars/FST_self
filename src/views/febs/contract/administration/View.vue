<template>
	<el-dialog :title="$t('common.view')" :width="width" :visible.sync="isVisible" class="user-view" >
		<el-upload class="upload-demo" action="http://120.77.233.206:8301/system/file/uploadup/" multiple :file-list="fileList" :show-file-list="false" :on-success="uploadFile" :headers="importHeaders" style="margin-bottom: 20px;margin-top: -20px;" :data="uploadData">
			<el-button size="small" type="primary">点击上传</el-button>
		</el-upload>
		<el-table :data="tableData" style="width: 100%" ref="table" :header-cell-style="{background:'#eef1f6',color:'#606266'}" fit border stripe v-loading="viewLoading">
			<el-table-column prop="contractName" label="文件名称" align="center" width="450">
			</el-table-column>
			<el-table-column label="操作" align="center" min-width="120px" class-name="small-padding fixed-width">
				<template slot-scope="{row}">
					<i v-hasPermission="['contractManagement:update']" class="el-icon-download table-operation" style="color: #2db7f5;" @click="down(row)" />
					<i v-hasPermission="['contractManagement:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
					<el-link v-has-no-permission="['user:view','user:update','user:delete']" class="no-perm">
						无权限
					</el-link>
				</template>
			</el-table-column>
		</el-table>
	</el-dialog>
</template>
<script>
	export default {
		name: 'UserView',
		props: {
			dialogVisible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				screenWidth: 0,
				fileList: [],
				importHeaders: {
					"Authorization": "bearer " + localStorage.getItem("token")
				},
				width: this.initWidth(),
				user: {},
				tableData: [],
				uploadData:{
					contractId:"",
					
				},
				viewLoading:false,
				lastMessage:"",

			}
		},
		computed: {
			isVisible: {
				get() {
					return this.dialogVisible
				},
				set() {
					this.close()
				}
			},
			avatar() {
				if(this.user.avatar) {
					return require(`@/assets/avatar/${this.user.avatar}`)
				} else {
					return require('@/assets/avatar/default.jpg')
				}
			}
		},
		mounted() {
			window.onresize = () => {
				return(() => {
					this.width = this.initWidth()
				})()
			}
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
			initWidth() {
				this.screenWidth = document.body.clientWidth
				if(this.screenWidth < 550) {
					return '95%'
				} else if(this.screenWidth < 990) {
					return '580px'
				} else if(this.screenWidth < 1400) {
					return '600px'
				} else {
					return '650px'
				}
			},
			setUser(val) {
				//存储val后在删除后重新刷新数据时用
				this.lastMessage=val
				this.tableData=[]
				this.viewLoading=true
				console.log("查看页面传过来row")
				console.log(val)
				console.log(val.id)
				this.uploadData.contractId=val.id
				this.$get("system/contractFile/contractFilesInfo/" + val.id).then((res) => {
					this.viewLoading=false
					console.log("获取到文件列表")
					console.log(res)
					this.tableData = res.data.data
					

				})
				this.user = { ...val
				}
			},
			close() {
				this.$emit('close')
			},
			uploadFile(response, file, fileList) {
				console.log("文件上传成功")
				console.log(file)
				console.log(fileList)
					this.$message({
									message: "上传成功",
									type: 'success'
								})
					this.viewLoading=true
						this.$get("system/contractFile/contractFilesInfo/" + this.uploadData.contractId).then((res) => {
							this.viewLoading=false
					console.log("上传后更新文件列表")
					console.log(res)
					this.tableData = res.data.data
				})

			},
			down(row) {
				console.log("下载文件")
				
				var javaBean = {
					id: row.id
				}
				var requestDataStr = JSON.stringify(javaBean);
				var options = {
					url: 'http://120.77.233.206:8301/system/file/' + row.id, //下载地址
					data: requestDataStr, //要发送的数据
					method: 'post', //post方式发送数据
				};

				console.log(options)
				var xhr = new XMLHttpRequest(); //创建新的XHR对象
				xhr.open(options.method, options.url); //指定获取数据的方式和url地址
				var token1 = "bearer " + localStorage.getItem("token")
				xhr.setRequestHeader('Authorization', token1)
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
				xhr.responseType = 'blob'; //以blob的形式接收数据，一般文件内容比较大
				// 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
				xhr.send(options.data); //post请求传的参数
				xhr.onload = function() {
					// 请求完成
					if(this.status === 200) {
						// 请求成功
						console.log("请求成功")
						console.log(this.response)
						var blob = this.response;
						console.log(blob)
						var reader = new FileReader();
						reader.readAsDataURL(blob); // 转换为base64，可以直接放入a表情href
						reader.onload = function(e) {
							// 转换完成，创建一个a标签用于下载
							var a = document.createElement('a');
							a.download = row.contractName + "." + row.fileSuffix; //下载的文件名
							a.href = e.target.result;
							document.body.append(a)
							//							$("body").append(a); // 修复firefox中无法触发click
							a.click();
							a.remove();
						}
					}
				};

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
					this.$delete("system/contractFile/"+row.id).then(() => {
						this.$message({
							message: "删除成功",
							type: 'success'
						})
						console.log("删除后获取上级id",this.lastMessage)
						this.$get("system/contractFile/contractFilesInfo/" + this.lastMessage.id).then((res) => {
					this.viewLoading=false
					console.log("删除后获取到文件列表")
					console.log(res)
					this.tableData = res.data.data

				})

					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});

				//    this.batchDelete()
			},
		}
	}
</script>
<style lang="scss" scoped>
	.user-view {
		.img-wrapper {
			text-align: center;
			margin-top: -1.5rem;
			margin-bottom: 10px;
			img {
				width: 4rem;
				border-radius: 50%;
			}
		}
		.view-item {
			margin: 7px;
			i {
				font-size: .97rem;
			}
			span {
				margin-left: 5px;
			}
		}
	}
</style>