const initialState = {};

export default (state = initialState, action) => {
  let newState = {
    ...state,
  };

  switch (action.type) {
    case 'SET_DB_SUMMARY': {
      newState = { ...newState, ...action.payload };
      break;
    }
    default:
      break;
  }

  return newState;
};
