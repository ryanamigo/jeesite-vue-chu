import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';

const { adminPath } = useGlobSetting();

export const faceRecognitionBySnapshot = (blob: Blob) => {
  const formData = new FormData();
  formData.append('multipartFile', blob, 'snapshot.png');
  return defHttp.post({
    url: adminPath + '/face/faceWeb/faceRecognitionTest',
    params: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getTasksData = () => {
  return defHttp.post({
    url:adminPath+"/test/testNumber/findTestNumberByLimit",
  })
}
  
export const getVideoStatus = (testNumber: string) =>{
  return defHttp.post({
    url:adminPath + "/emotion/emotionVideo/findVideoStatusByDate",
    params:{testNumber}
  })
}

export const insertOrModifyInformation = (formData: FormData) =>{
  return defHttp.post({
    url:adminPath + "/face/faceInformation/insertOrModifyInformation",
    params:{
      formData
    }
  })
}