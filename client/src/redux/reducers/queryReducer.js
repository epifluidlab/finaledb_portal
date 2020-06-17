const initialState = {};

export default (state = initialState, action) => {
  let newState = {
    ...state,
  };

  switch (action.type) {
    case 'QUERY_SEQRUN': {
      newState = { ...newState, ...action.payload };
      break;
    }
    default:
      break;
  }

  return newState;
};
