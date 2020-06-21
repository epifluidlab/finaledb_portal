import { s3Bucket } from '../../settings';

const initialState = {
  downloadList: [],
  downloadListStash: [],
};

// Simply remove all entries from the download list
function removeDownloadItems(state, entries) {
  const { downloadList } = state;
  const entryIds = entries.map((entry) => entry.id);
  return {
    ...state,
    downloadList: downloadList.filter(
      (item) => !entryIds.includes(item.entry.id)
    ),
  };
}

// Toggle the download item in the stash
function toggleDownloadItem(state, entryId, isChecked) {
  const { downloadListStash } = state;

  const newStash = downloadListStash.map((downloadItem) => {
    if (entryId === downloadItem.entry.id) {
      const newFileItems = downloadItem.downloads.map((fileItem) => ({
        ...fileItem,
        checked: isChecked,
      }));
      return { ...downloadItem, checked: isChecked, downloads: newFileItems };
    }
    return downloadItem;
  });

  const newDownloadList = JSON.parse(
    JSON.stringify(newStash.filter((item) => item.checked))
  );
  return {
    ...state,
    downloadListStash: newStash,
    downloadList: newDownloadList,
  };
}

// Instead of toggling the entire download item, select individual files instead
function toggleDownloadFiles(state, entryId, fileKeys, isChecked) {
  const { downloadListStash } = state;

  const newDownloadListStash = downloadListStash.map((downloadItem) => {
    if (entryId !== downloadItem.entry.id) return downloadItem;

    // Set all file items with matching keys
    const newFileItems = downloadItem.downloads.map((fileItem) => {
      if (!fileKeys.includes(fileItem.key)) return fileItem;
      return { ...fileItem, checked: isChecked };
    });
    // If all files are deselected, we need to uncheck the downloadItem
    const hasSelectedItem = newFileItems.reduce(
      (acc, item) => acc || item.checked,
      false
    );
    return {
      ...downloadItem,
      checked: hasSelectedItem,
      downloads: newFileItems,
    };
  });

  const newDownloadList = JSON.parse(
    JSON.stringify(newDownloadListStash.filter((item) => item.checked))
  );
  return {
    ...state,
    downloadListStash: newDownloadListStash,
    downloadList: newDownloadList,
  };
}

// Add a list of entries to the download list
function addDownloadItems(state, entries) {
  const analysis2Download = (item, assembly) => {
    // if (item.type === 'txt' && item.desc === 'fragment size')
    //   return {
    //     desc: `Fragment size distribution (${assembly})`,
    //     url: `${s3Bucket}/${item.key}`,
    //     key: item.key,
    //     checked: true,
    //   };
    if (item.type === 'bedGraph' && item.desc === 'coverage')
      return {
        desc: `Fragment coverage (${assembly})`,
        url: `${s3Bucket}/${item.key}`,
        key: item.key,
        checked: true,
      };
    if (item.type === 'bedGraph' && item.desc === 'fragment profile')
      return {
        desc: `Fragment size profile (${assembly})`,
        url: `${s3Bucket}/${item.key}`,
        key: item.key,
        checked: true,
      };
    if (item.type === 'bedGraph' && item.desc === 'WPS')
      return {
        desc: `Windowed Protection Score (WPS) (${assembly})`,
        url: `${s3Bucket}/${item.key}`,
        key: item.key,
        checked: true,
      };
    if (item.type === 'tsv' && item.desc === 'fragment')
      return {
        desc: `Fragment .tsv file (${assembly})`,
        url: `${s3Bucket}/${item.key}`,
        key: item.key,
        checked: true,
      };
    return null;
  };

  const downloadListPatch = entries.map((entry) => {
    // each entry contains an analysis attribute.
    const { analysis = {} } = entry;
    // For now, only support hg19 and hg38 files
    return {
      entry,
      checked: true,
      downloads: ['hg19', 'hg38'].reduce((downloadItemsForEntry, assembly) => {
        const downloadItemsForAssembly = (analysis[assembly] || []).reduce(
          (acc, analysisEntry) => {
            const downloadItem = analysis2Download(analysisEntry, assembly);
            return downloadItem ? [...acc, downloadItem] : acc;
          },
          []
        );
        return [...downloadItemsForEntry, ...downloadItemsForAssembly];
      }, []),
    };
  });

  // Merge newDownloadList to the previous one (override)
  const { downloadList } = state;
  const newDownloadList = downloadList.reduce((acc, item) => {
    // if the same entry appears in the patch, use the patched version
    const entryId = item.entry.id;
    const patchedItem = downloadListPatch.find(
      (ele) => ele.entry.id === entryId
    );
    return patchedItem ? [...acc, patchedItem] : [...acc, item];
  }, []);

  // Apply items that are present in the patch but not the download list
  const finalList = downloadListPatch
    .reduce((acc, item) => {
      const entryId = item.entry.id;
      const peerItem = acc.find((ele) => ele.entry.id === entryId);
      return peerItem ? acc : [...acc, item];
    }, newDownloadList)
    .sort((a, b) => a.entry.id - b.entry.id);

  return { ...state, downloadList: finalList };
}

export default function downloadListReducer(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case 'CLEAR_DOWNLOAD_LIST':
      return { downloadList: [], downloadListStash: [] };
    case 'ADD_DOWNLOAD_ITEMS':
      return payload.isAdding
        ? addDownloadItems(state, payload.entries)
        : removeDownloadItems(state, payload.entries);
    case 'INIT_DOWNLOAD_LIST_STASH':
      return {
        ...state,
        downloadListStash: JSON.parse(JSON.stringify(state.downloadList)),
      };
    case 'TOGGLE_DOWNLOAD_ITEM': {
      const { entryId, isChecked } = action.payload;
      return toggleDownloadItem(state, entryId, isChecked);
    }
    case 'TOGGLE_DOWNLOAD_FILES': {
      const { entryId, fileKeys, isChecked } = action.payload;
      return toggleDownloadFiles(state, entryId, fileKeys, isChecked);
    }
    default:
      return state;
  }
}
