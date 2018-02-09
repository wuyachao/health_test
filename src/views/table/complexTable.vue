<template>
    <div class="app-container calendar-list-container">
        <div class="filter-container">
            <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.env">
                <el-option v-for="item in envOptions" :key="item.key" :label="item.label" :value="item.key">
                </el-option>
            </el-select>
            <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary"
                       icon="el-icon-edit">add
            </el-button>
            <el-checkbox class="filter-item" style='margin-left:15px;' @change='tableKey=tableKey+1'
                         v-model="showOwner">showOwner
            </el-checkbox>
        </div>

        <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
                  highlight-current-row
                  style="width: 100%; margin-top: 20px;">
            <el-table-column align="center" width="100" label="name">
                <template slot-scope="scope">
                    <span>{{scope.row.name}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="200" label="host">
                <template slot-scope="scope">
                    <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.host}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="65" label="port">
                <template slot-scope="scope">
                    <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.port}}</span>
                </template>
            </el-table-column>
            <el-table-column v-if='showOwner' align="center" label="email">
                <template slot-scope="scope">
                    <span style='color:red;'>{{scope.row.email}}</span>
                </template>
            </el-table-column>
            <el-table-column v-if='showOwner' align="center" label="phone">
                <template slot-scope="scope">
                    <span style='color:red;'>{{scope.row.phone}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="150" label="status">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status | statusFilter">{{nodeStatus[scope.row.status]}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" label="partnerStatus" min-width="100">
                <template slot-scope="scope">
                    <el-button class="filter-item" style="margin-left: 10px;" @click="handlePartner(scope.row.vendor)">
                        {{Object.keys(scope.row.vendor)[0]}}--{{Object.values(scope.row.vendor)[0]}} 点击展开
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column align="center" width="210" label="time">
                <template slot-scope="scope">
                    <span>{{scope.row.last_update_time}}</span>
                </template>
            </el-table-column>
            <el-table-column class-name="status-col" align="center" label="isAlert" width="80">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.isalert | statusFilter">{{alertStatus[scope.row.isalert]}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" label="actions" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">edit</el-button>
                    <el-button size="mini" type="success" @click="updateAlertStatus(scope.row,0)">允许
                    </el-button>
                    <el-button size="mini" type="danger" @click="updateAlertStatus(scope.row,1)">禁止
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="70px"
                     style='width: 400px; margin-left:50px;'>
                <el-form-item label='name:' prop="name">
                    <el-input v-model="temp.name"></el-input>
                </el-form-item>
                <el-form-item label='host:' prop="host">
                    <el-input v-model="temp.host"></el-input>
                </el-form-item>
                <el-form-item label="port:" prop="port">
                    <el-input v-model="temp.port"></el-input>
                </el-form-item>
                <el-form-item label='email:' prop="email">
                    <el-input v-model="temp.email"></el-input>
                </el-form-item>
                <el-form-item label='phone:' prop="phone">
                    <el-input v-model="temp.phone"></el-input>
                </el-form-item>
                <el-form-item label="env:" prop="env">
                    <el-select class="filter-item" v-model="temp.env" placeholder="Please select">
                        <el-option v-for="item in envOptions" :key="item.key" :label="item.label" :value="item.key">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">cancel</el-button>
                <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">confirm</el-button>
                <el-button v-else type="primary" @click="updateData">confirm</el-button>
            </div>
        </el-dialog>

        <el-dialog title="第三方服务状态列表" :visible.sync="dialogPvVisible">
            <el-table :data="partnerTable" border fit highlight-current-row style="width: 100%">
                <el-table-column prop="key" label="第三方供应商"></el-table-column>
                <el-table-column prop="status" label="第三方供应商状态"></el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">confirm</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
  import {fetchList, createHcinfo, updateHcinfo, updateAlertStatus} from '@/api/hcinfo'
  import waves from '@/directive/waves' // 水波纹指令
  import {parseTime} from '@/utils'

  export default {
    name: 'complexTable',
    directives: {
      waves
    },
    data() {
      return {
        pKeys: [],
        pValue: [],
        tableKey: 0,
        list: null,
        listLoading: true,
        listQuery: {
          env: "dev",
        },
        nodeStatus: ["服务正常", "节点服务异常", "redis异常", "第三方服务异常"],
        partnerTable: [],
        envOptions: [{label: '开发环境', key: 'dev'}, {label: 'stg环境', key: 'stg'}, {label: '生产环境', key: 'pro'}],
        showOwner: false,
        temp: {
          name: '',
          host: '',
          port: '',
          email: '',
          phone: '',
          env: 'pro'
        },
        alertTmp: {
          name: '',
          isalert: '',
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        alertStatus: {
          0: '告警',
          1: '禁止'
        },
        dialogPvVisible: false,
        rules: {
          name: [{required: true, message: 'name is required', trigger: 'change'}],
        },
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: 'success',
          1: 'danger',
          2: 'danger',
          3: 'danger',
        }
        return statusMap[status]
      },
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data
          this.listLoading = false
        })
      },
      handleFilter() {
        this.getList()
      },
      resetTemp() {
        this.temp = {
          name: 'waimai',
          host: '192.168.0.1',
          port: '10022',
          email: '123@qq.com',
          phone: '11111111'
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createHcinfo(this.temp).then(() => {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateAlertStatus(row, status) {
        const tempData = Object.assign({}, this.alertTmp)
        tempData.name = row.name
        tempData.isalert = status
        updateAlertStatus(tempData).then(() => {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
        row.isalert = status
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            updateHcinfo(tempData).then(() => {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handlePartner(partner) {
        this.dialogPvVisible = true
        let a = Object.keys(partner)
        let b = Object.values(partner)
        this.partnerTable = a.map((item, index) => {
          return {
            key: item,
            status: b[index]
          }
        })
      },
    }
  }
</script>
