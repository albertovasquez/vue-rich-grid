import pino from 'pino';
import Column from './Column';

const log = pino();

export default class Row {
    data:any = {};
    constructor(data:any = {}) {
      this.data = Object.assign({}, {
        isOdd: false,
        expandedData: null,
        isExpandedRow: false,
        isSelected: false,
        isExpanded: false,
      }, data);
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

    async renderExpanderData(column: Column) {
      if (!column.data.renderer) {
        log.error({ row: this.data, column }, 'Column definitions of type expander require a renderer function (text:null, row:object)');
        return '';
      }

      return column.data.renderer('', this.data);
    }

    renderExpandedData(column: Column) {
      return column.data.renderer('', this.data);
    }

    /**
     * Handles promises from renderer
     * @param col
     */
    toggleExpander(col: Column) {
      this.data.isExpanded = !this.data.isExpanded;
      if (this.data.isExpanded) {
        this.data.expandedData = this.renderExpanderData(col);
      }
    }

    getClass() {
      const classes = [];
      if (this.data.isSelected) {
        classes.push('row-selected');
      }
      if (this.data.isExpandedRow) {
        classes.push('row-expansion');
      }
      return classes;
    }
}
