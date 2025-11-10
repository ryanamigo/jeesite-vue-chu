import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';

const { adminPath } = useGlobSetting();

export const faceRecognitionBySnapshot = (blob: Blob) => {
  const formData = new FormData();
  formData.append('multipartFile', blob, 'snapshot.png');
  return defHttp.post({
    url: adminPath + '/face/faceWeb/faceRecognitionTest',
    data: formData,
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
  
