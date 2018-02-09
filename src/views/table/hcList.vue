<template>
    <div class="app-container calendar-list-container">
        <div class="filter-container">
            <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="服务名"
                      v-model="listQuery.name">
            </el-input>
            <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.env">
                <el-option v-for="item in envOptions" :key="item.key" :label="item.label" :value="item.key">
                </el-option>
            </el-select>
            <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.sort">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
                </el-option>
            </el-select>
            <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">search
            </el-button>
            <el-checkbox class="filter-item" style='margin-left:15px;' @change='tableKey=tableKey+1'
                         v-model="showOwner">showOwner
            </el-checkbox>
        </div>

        <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
                  highlight-current-row
                  style="width: 100%; margin-top: 20px;">
            <el-table-column align="center" width="50" label="id">
                <template slot-scope="scope">
                    <span>{{scope.row.id}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="100" label="name">
                <template slot-scope="scope">
                    <span>{{scope.row.name}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="200" label="host">
                <template slot-scope="scope">
                    <span>{{scope.row.host}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="65" label="port">
                <template slot-scope="scope">
                    <span>{{scope.row.port}}</span>
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
                    <span>{{scope.row.created}}</span>
                </template>
            </el-table-column>
        </el-table>

        <div class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                           :current-page.sync="listQuery.page"
                           :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
                           layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

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
  import {fetchErrorList} from '@/api/hcinfo'
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
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          name: undefined,
          env: "dev",
          sort: "desc"
        },
        nodeStatus: ["服务正常", "节点服务异常", "redis异常", "第三方服务异常"],
        sortOptions: [{label: 'ID Ascending', key: 'asc'}, {label: 'ID Descending', key: 'desc'}],
        partnerTable: [],
        envOptions: [{label: '开发环境', key: 'dev'}, {label: 'stg环境', key: 'stg'}, {label: '生产环境', key: 'pro'}],
        showOwner: false,
        alertTmp: {
          name: '',
          isalert: '',
        },
        dialogFormVisible: false,
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
        fetchErrorList(this.listQuery).then(response => {
          this.list = response.data
          this.total = response.total
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
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
