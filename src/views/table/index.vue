<template>
    <div class="app-container">
        <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit
                  highlight-current-row>
            <el-table-column align="center" label='服务名' width="80">
                <template slot-scope="scope">
                    {{scope.row.name}}
                </template>
            </el-table-column>
            <el-table-column label="host" width="200" align="center">
                <template slot-scope="scope">
                    {{scope.row.host}}
                </template>
            </el-table-column>
            <el-table-column label="port" width="100" align="center">
                <template slot-scope="scope">
                    {{scope.row.port}}
                </template>
            </el-table-column>
            <el-table-column label="redis" align="center">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.redis | statusFilter">{{scope.row.redis}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column class-name="status-col" label="partnerStatus" align="center">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.partnerStatus | statusFilter">{{scope.row.partnerStatus}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="created_at" label="server_time" width="200">
                <template slot-scope="scope">
                    <i class="el-icon-time"></i>
                    <span>{{scope.row.time}}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
  import {getList} from '@/api/table'

  export default {
    data() {
      return {
        list: null,
        listLoading: true
      }
    },
    filters: {
      statusFilter(partnerStatus) {
        const statusMap = {
          online: 'success'
        }

        statusMap["-"] = 'info'

        return statusMap[partnerStatus]
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.listLoading = true
        getList(this.listQuery).then(response => {
          this.list = response.data
          this.listLoading = false
        })
      }
    }
  }
</script>
