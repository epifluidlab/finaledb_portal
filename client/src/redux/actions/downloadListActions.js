// Add an entry to the download list.
// Param: entries: array of entries, isAdding: true if is adding rather than removing
export const addDownloadItems = (entries, isAdding) => ({
  type: 'ADD_DOWNLOAD_ITEMS',
  payload: { entries, isAdding },
});

// Users can fine-tune the download list by check/uncheck individual files
// associated to the entry
// Param: fileKeys: array of the keys of the files (see entry.analysis)
//        isChecked: bool
export const toggleDownloadFiles = (entryId, fileKeys, isChecked) => ({
  type: 'TOGGLE_DOWNLOAD_FILES',
  payload: { entryId, fileKeys, isChecked },
});

// Toggle a download item in the dowload list stash
export const toggleDownloadItem = (entryId, isChecked) => ({
  type: 'TOGGLE_DOWNLOAD_ITEM',
  payload: { entryId, isChecked },
});

export const clearDownloadList = () => ({
  type: 'CLEAR_DOWNLOAD_LIST',
  payload: {},
});

export const initDownloadListStash = () => ({
  type: 'INIT_DOWNLOAD_LIST_STASH',
  payload: {},
});
