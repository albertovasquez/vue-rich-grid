module.exports = class Row {
    constructor(data) {
        this.data = data;
    }

    getClass(column) {
        const rowClasses = [];
        if (column.data.align) {
            rowClasses.push(column.data.align);
        }
        if (column.active) {
            rowClasses.push('active-column');
        }
        return rowClasses;
    }

    /**
     * Use column custom render
     * If not present match data row
     * by the columns Id
     */
    renderData(column) {
        if (!column.data.renderer) {
            return this.data[column.data.id];
        }
        return column.data.renderer(this.data[column.data.id], this.data);
    }
}