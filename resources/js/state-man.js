export const store = {

  state: {

    show: null

  },

  changeState(boll) {
    this.state.show = boll;
  },

  clearState() {
    this.state.show = null;
  },

  dispatchState() {
    return this.state.show;
  }

};
