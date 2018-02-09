import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/v1/node/list',
    method: 'get',
    params: query
  })
}

export function createHcinfo(data) {
  return request({
    url: '/api/v1/node/add',
    method: 'post',
    data
  })
}

export function updateHcinfo(data) {
  return request({
    url: '/api/v1/node/edit',
    method: 'post',
    data
  })
}

export function updateAlertStatus(data) {
  return request({
    url: '/api/v1/node/alert/update',
    method: 'post',
    data
  })
}

export function fetchErrorList(query) {
  return request({
    url: '/api/v1/alert/list',
    method: 'get',
    params: query
  })
}