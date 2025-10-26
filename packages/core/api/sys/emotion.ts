
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';
import { TreeDataModel, TreeModel } from '@jeesite/core/api/model/baseModel';


const { adminPath } = useGlobSetting();

export const getPermissionList = (params: any) => defHttp.post({ url: adminPath + '/sys/empUser/listData', params })

export const createPermission = (params: any) => defHttp.post({ url: adminPath + '/sys/empUser/savePro', params })