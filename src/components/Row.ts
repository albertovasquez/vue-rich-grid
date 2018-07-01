import Column from './Column';

export default class Row {
    data:any = {};
    constructor(data:any = {}) {
      this.data = Object.assign({}, data, {
        isSelected: false,
      });
    }

    /**
     * Use column custom render
     * If not present match data row
     * by the columns Id
     */
    renderData(column: Column) {
      if (!column.data.renderer) {
        return this.data[column.data.id];
      }
      return column.data.renderer(this.data[column.data.id], this.data);
    }
}
