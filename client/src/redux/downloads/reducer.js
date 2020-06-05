import { ADD_DOWNLOAD, REMOVE_DOWNLOAD } from './types';

const initialState = {
  downloads: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_DOWNLOAD: {
      return {
        ...state,
        downloads: [...state.downloads, action.payload],
      };
    }
    case REMOVE_DOWNLOAD:
      return {
        ...state,
        downloads: state.downloads.filter(
          (download) => download.sra_id !== action.payload
        ),
      };
    default:
      return state;
  }
}
