/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';

const { adminPath } = useGlobSetting();

// 权限数据接口定义
export interface Permissions {
  companyCode?: string;
  loginCode?: string;
  userName?: string;
  mobile?: string;
  status?: string;
  updateDate?: string;
  viewCode?: string;
  companyName?: string;
  refName?: string;
}

// 权限列表数据
export const permissionsListData = (params?: Permissions | any) =>
  defHttp.get<Permissions[]>({ url: adminPath + '/sys/empUser/listData', params });

// 删除权限
export const permissionsDelete = (params?: any) =>
  defHttp.post({ url: adminPath + '/sys/empUser/delete', params });

// 禁用权限
export const companyDisable = (params?: any) =>
  defHttp.post({ url: adminPath + '/sys/empUser/disable', params });

// 启用权限
export const companyEnable = (params?: any) =>
  defHttp.post({ url: adminPath + '/sys/empUser/enable', params });

export const createPermission = (params: any) => defHttp.post({ url: adminPath + '/sys/empUser/savePro', params });

// 获取单个权限详情
export const getPermissionDetail = (params: { userCode: string }) =>
  defHttp.get({ url: adminPath + '/sys/empUser/formData', params });