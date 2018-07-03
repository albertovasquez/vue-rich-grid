interface Data {
    isActive: boolean,
    dir: string,
    id: string,
    isCheckbox: boolean,
    isExpander: boolean,
    width: number,
    type: string|null,
    renderer: (id: string, data: object) => string,
    align: string,
    sortable: boolean,
}

interface BaseParams {
    sort: string,
    dir: string
}

export default class Column {
    data: Data;
    constructor(column: Data, baseParams: BaseParams) {
      this.data = column;
      this.data.isCheckbox = (this.data.type === 'checkbox');
      this.data.isExpander = (this.data.type === 'expander');
      if (column.id === baseParams.sort) {
        this.data.isActive = true;
      } else {
        this.data.isActive = false;
      }
      this.data.dir = column.dir ? column.dir : baseParams.dir;
    }

    get id() {
      return this.data.id;
    }

    get active() {
      return this.data.isActive;
    }

    set active(val) {
      this.data.isActive = val;
    }

    getStyle() {
      if (this.data.width) {
        return `width:${this.data.width}px`;
      }
      return '';
    }

    getClass() {
      const colClasses = [];
      if (this.data.align) {
        colClasses.push(this.data.align);
      }
      if (this.data.sortable) {
        colClasses.push('sort-icon');
        colClasses.push('sortable');
        colClasses.push(`sort-${this.data.dir}`);
        // initial load lets determien if I am selected
        if (this.data.isActive) {
          colClasses.push('active-column');
        }
      }
      if (this.data.isExpander) {
        colClasses.push('expander');
      } else if (this.data.isCheckbox) {
        colClasses.push('checkbox');
      }

      return colClasses;
    }

    getRowClass() {
      const rowClasses = [];
      if (this.data.align) {
        rowClasses.push(this.data.align);
      }
      if (this.active) {
        rowClasses.push('active-column');
      }
      return rowClasses;
    }
}
