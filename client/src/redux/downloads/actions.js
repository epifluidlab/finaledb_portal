import { ADD_DOWNLOAD, REMOVE_DOWNLOAD } from './types';

export const addDownload = (download) => (dispatch, getState) => {
  const currentDownloads = getState().downloads.downloads;
  const exists = currentDownloads.find((item) => item.sra_id === download.sra_id);

  if (!exists) {
    dispatch({
      type: ADD_DOWNLOAD,
      payload: download
    });
  }
};

export const removeDownload = (sraId) => (dispatch) => {
  dispatch({
    type: REMOVE_DOWNLOAD,
    payload: sraId
  });
};
