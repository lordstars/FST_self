<template>
	<el-dialog title="变更历史" :width="width" :visible.sync="isVisible" class="user-view" >
		
		<div>
				<el-table ref="table" :key="tableKey" :data="changeList" border fit stripe :header-cell-style="{background:'#eef1f6',color:'#606266'}" style="width: 90%;margin: 0 auto;" :loading="loading">
					<el-table-column type="index" label='序号' width="50" align="center"> </el-table-column>
					<el-table-column label="变更前" align="center" min-width="50px">
						<template slot-scope="scope">
							<span>{{scope.row.beforeChange}}</span>
						</template>
					</el-table-column>
					<el-table-column label="变更后" align="center" min-width="50px">
						<template slot-scope="scope">
							<span>{{scope.row.afterChange}}</span>
						</template>
					</el-table-column>
					<el-table-column label="日期" align="center" min-width="100px">
						<template slot-scope="scope">
							<span>{{scope.row.createTime}}</span>
						</template>
					</el-table-column>
					<el-table-column label="变更原因" align="center" min-width="120px">
						<template slot-scope="scope">
							<span>{{scope.row.changereason}}</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
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
				tableKey:0,
				width: this.initWidth(),
				changeList:[],
				viewLoading:false,
				changeListId:"",//获取变更历史列表外层id
				loading:false,
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
//			avatar() {
//				if(this.user.avatar) {
//					return require(`@/assets/avatar/${this.user.avatar}`)
//				} else {
//					return require('@/assets/avatar/default.jpg')
//				}
//			}
		},
		mounted() {
			window.onresize = () => {
				return(() => {
					this.width = this.initWidth()
				})()
			}
		},
		methods: {
//			transSex(sex) {
//				switch(sex) {
//					case '0':
//						return this.$t('common.sex.male')
//					case '1':
//						return this.$t('common.sex.female')
//					default:
//						return this.$t('common.sex.secret')
//				}
//			},
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
				this.loading=true
				console.log("进入变更历史")
				console.log(val)
				this.changeListId=val.id
				this.$get("system/stateChange/"+this.changeListId).then((res) => {
					this.loading=false
					console.log("获取变更历史列表")
					console.log(res)
					this.changeList = res.data.data
				})
//				this.changeList = { ...val}
			},
			close() {
				this.$emit('close')
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