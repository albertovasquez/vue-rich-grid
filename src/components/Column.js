module.exports = class Column {
    constructor(column, baseParams) {
        this.data = column;
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

    get active(){
        return this.data.isActive;
    }

    set active(val){
        this.data.isActive = val;
    }

    getStyle() {
        if (this.data.width) {
            return `width:${this.data.width}px`;
        }
        return "";
    };

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

        return colClasses;
    };
};