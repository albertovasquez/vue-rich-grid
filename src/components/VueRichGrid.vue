<template>
    <div :id="richId">
        <div :class="[loading ? 'loading' : '', 'vue-rich-grid']">
            <table>
                <thead>
                    <tr>
                        <th v-for="column in parsedColumns" v-on="sortable(column)" rowspan="1" colspan="1" :class="[column.getClass()]" :dataindex="column.id" :key="column.id" :style="column.getStyle()">
                            <svg v-show="column.sortable" :class="column.dir" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 401.998 401.998" style="top: 1px;position: relative; enable-background:new 0 0 401.998 401.998;" xml:space="preserve">
                                <g class="column-sort-up">
                                    <path d="M73.092,164.452h255.813c4.949,0,9.233-1.807,12.848-5.424c3.613-3.616,5.427-7.898,5.427-12.847 c0-4.949-1.813-9.229-5.427-12.85L213.846,5.424C210.232,1.812,205.951,0,200.999,0s-9.233,1.812-12.85,5.424L60.242,133.331 c-3.617,3.617-5.424,7.901-5.424,12.85c0,4.948,1.807,9.231,5.424,12.847C63.863,162.645,68.144,164.452,73.092,164.452z"/>
                                </g>
                                <g class="column-sort-down">
                                    <path d="M328.905,237.549H73.092c-4.952,0-9.233,1.808-12.85,5.421c-3.617,3.617-5.424,7.898-5.424,12.847 c0,4.949,1.807,9.233,5.424,12.848L188.149,396.57c3.621,3.617,7.902,5.428,12.85,5.428s9.233-1.811,12.847-5.428l127.907-127.906 c3.613-3.614,5.427-7.898,5.427-12.848c0-4.948-1.813-9.229-5.427-12.847C338.139,239.353,333.854,237.549,328.905,237.549z" style=""/>
                                </g>
                            </svg>
                            <span>{{ column.text }}&nbsp;</span>
                        </th>
                        <th nowrap="nowrap" rowspan="1" colspan="1" class="extra_th" dataindex="extra_th" style="width:100%;display:none;">
                            <span class="">&nbsp;</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in parsedRows" :class="{'odd':(rowIndex % 2)}" :key="rowIndex">
                        <template v-for="column in parsedColumns">
                            <td v-if="typeof $scopedSlots[column.id] !== 'undefined'" :key="column.id" :class="[row.getClass(column)]">
                                <slot :name="column.id" :column="column" :data="row"></slot>
                            </td>
                            <td v-else :key="column.id" :class="[row.getClass(column)]" v-html="renderData(column, row)"></td>
                        </template>
                        <td class="extra_td" valign="top"></td>
                    </tr>
                    <tr v-show="!parsedRows.length && !loading">
                        <td :colspan="parsedColumns.length" class="richgrid-nodata"><translate>No data found</translate></td>
                        <td class="extra_td" valign="top"></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <rich-page :setting="pageSet" ref="pager" :loading="loading" @page-change="pageChange"></rich-page>
    </div>
</template>

<script>
    import axios from '@/mixins/axios.js';
    import richPage from '@/components/VueRichPage';
    let componentCount = 0;
    export default {
        mixins: [axios],
        components: { richPage },
        name: 'richgrid',
        props: ['options'],
        methods: {
            /**
             * custom emitter used in the event
             * options is passed with a busEmitter
             */
            customEmitter(name, params) {
                if (this.settings.eventBus) {
                    this.settings.eventBus.$emit(name, params);
                } else {
                    this.$emit(name, params);
                }
            },
            setLoading(loading = false) {
                this.loading = loading;
                if (this.loading) {
                    this.customEmitter('app:startLoading', {
                        id: this.settings.id,
                    });
                } else {
                    this.customEmitter('app:stopLoading', {
                        id: this.settings.id,
                    })
                }
            },
            //receive page info change callback
            pageChange(pInfo){
                // update params with new page info
                this.params.limit = pInfo.pageSize;
                this.params.start = (pInfo.pageNumber - 1) * pInfo.pageSize;
                this.fetchRows();
            },
            /**
             * Use column custom render
             * If not present match data row
             * by the columns dataIndex or Id
             */
            renderData(column, row) {
                if (!column.renderer) {
                    if (column.id) {
                        return row[column.id]
                    }
                    return row[column.dataIndex]
                }
                return column.renderer(row[column.id], row);
            },
            /**
             * Dynamically adds a click handler
             * to the column that is sortable
             */
            sortable(column) {
                if (column.sortable) {
                    return { click: this.sort }
                }
                return null
            },
            /**
             * creates a new richColumn array which is used by
             * computed property parsedColumns to display our header
             */
            sort(event) {
                const columnId = event.currentTarget.getAttribute('dataindex');
                this.richColumns = this.richColumns.map((col) => {
                    if (col.id === columnId) {
                        col.dir = (col.dir === 'asc') ? 'desc' : 'asc';
                        this.sortingByColumn = col;
                    }
                    return col;
                });

                this.settings.baseParams.sort = this.sortingByColumn.dataIndex;
                this.fetchFromStart();
            },
            /**
             * Fetch from first page
             * method to call when you are
             * fetching rows from a sort
             * No event is fired from this event
             * Note: This is called externally by ref
             * Do not delete this method or rename it
             */
            fetchFromStart() {
                this.params.start = 0;
                const baseDir = this.$props.options.baseParams.dir;
                this.params.dir = this.sortingByColumn ? this.sortingByColumn.dir : baseDir;
                this.fetchRows();
                this.$refs.pager.goPage(1, false);
            },
            initialFetch: async function () {
                const baseDir = this.$props.options.baseParams.dir;
                this.params.dir = this.sortingByColumn && this.sortingByColumn.dir ? this.sortingByColumn.dir : baseDir;
                await this.fetchRows();
            },
            fetchRows: async function () {
                this.setLoading(true);
                const response = await this.get(this.settings.url);
                let rows = [];
                if (!response.data) {
                    console.error(`Richgrid did not receive data from ${this.$props.url}`)
                }

                // get rows
                if (this.settings.rootElement) {
                    rows = response.data[this.settings.rootElement];
                } else {
                    rows = response.data;
                }

                // get total rows
                if (this.settings.totalProperty) {
                    this.pageSet.totalRow = response.data[this.settings.totalProperty];
                } else {
                    this.pageSet.totalRow = response.data.totalcount;
                }

                this.rows = rows;
                this.setLoading(false);
            },
        },
        computed: {
            parsedRows() {
                return this.rows.map(row => Object.assign(row, {
                    getClass: (column) => {
                        const rowClasses = [];
                        if (column.align) {
                            rowClasses.push(column.align);
                        }

                        if (this.sortingByColumn && this.sortingByColumn.id === column.id) {
                            rowClasses.push('active-column');
                        }
                        return rowClasses;
                    },
                }));
            },
            parsedColumns: function() {
                const columns = this.richColumns.map(column => Object.assign(column, {
                    dir: column.dir ? column.dir : this.$props.options.baseParams.dir,
                    getStyle: () => {
                        if (column.width) {
                            return `width:${column.width}px`;
                        }
                        return "";
                    },
                    getClass: () => {
                        const colClasses = [];
                        if (column.align) {
                            colClasses.push(column.align);
                        }
                        if (column.sortable) {
                            colClasses.push('sort-icon');
                            colClasses.push('sortable');
                            colClasses.push(`sort-${column.dir}`);
                            // initial load lets determien if I am selected
                            if (this.sortingByColumn && this.sortingByColumn.dataIndex === column.dataIndex) {
                                colClasses.push('active-column');
                            }
                        }
                        return colClasses;
                    },
                }));

                // determine what the initial
                // selected column is if any at all.
                // then perform the initial search
                // if option of render on load is true
                if (!this.initialLoad) {
                    this.initialLoad = true;
                    this.sortingByColumn = columns.find(col => col.dataIndex === this.$props.options.baseParams.sort);
                    this.initialFetch();
                }

                return columns;
            },
        },
        data(props) {
            // lets merge our passed options with defaults
            const defaults = Object.assign({}, {
                columns: [],
                baseParams: {},
                pageSizeMenu: [5, 10, 20, 50, 100],
            }, props.options || {});

            if (defaults.baseParams.limit) {
                defaults.baseParams.limit = parseInt(defaults.baseParams.limit, 10);
            } else {
                defaults.baseParams.limit = 0;
            }

            if (!defaults.baseParams.dir) {
                defaults.baseParams.dir = 'asc';
            }

            return {
                settings: defaults,
                pageSet: {
                    totalRow: 0,
                    pageSize: defaults.baseParams.limit,
                    pageSizeMenu: defaults.pageSizeMenu,
                },
                params: {
                    start: 0,
                },
                loading: false,
                richId: null,
                richColumns: defaults.columns,
                sortingByColumn: null,
                rows: [],
                initialLoad: false,
                gridCount: null,
            }
        },
        beforeMount: function() {
            // calculate grid's id
            if (this.settings.id) {
                this.richId = this.settings.id;
            } else {
                componentCount = componentCount + 1;
                this.richId = `rich-grid-${componentCount}`
            }
        },
    }
</script>

<style lang="scss" scoped>
    .vue-rich-grid {
        font-family: 'Avenir';
        font-size: 14px;
        transition: opacity .6s;

        &.loading {
            opacity: .4;
        }

        >table {
            margin-bottom: 10px;
            table-layout: fixed;
            width:100%;
            border-top: 2px solid #F90;

            tbody {
                border: 1px solid #EEE;
            }

            th.right,
            td.right {
                text-align: right;
            }

            th.left,
            td.left {
                text-align: left;
            }

            th {
                border-top: 1px solid #fafafa;
                border-left: 1px solid #eee;
                border-right: 1px solid #eee;
                white-space: nowrap;
                width: 100%;
                height: 30px;
                padding: 0 .7em;
                font-size: 14px;
                font-weight: 600;
                color: #373737;
                background: #eaebec;
                background-image: none;
                text-shadow: none;

                &.sortable {
                    &:hover {
                        cursor: pointer;
                    }
                }
                &.sort-icon {
                    fill: #777777;
                    &.active-column {
                        background-color: #DFDFDF;
                        border-top-color: #DFDFDF;
                        &.sort-desc {
                            .column-sort-up {
                                fill: #f0ffff00;
                            }
                        }
                        &.sort-asc {
                            .column-sort-down {
                                fill: #f0ffff00;
                            }
                        }
                    }
                }
            }

            tr {
                &.odd {
                    td {
                        background-color: #fafafa;
                    }
                }
                td {
                    height: 20px;
                    padding: 5px;
                    padding-right: 10px;
                    padding-left: 10px;
                    border-bottom: 1px solid #eee;
                    background-color: #fff;
                    vertical-align: top;
                    &.active-column {
                        background-color: #eff7ff;
                        border-bottom: 1px solid #fff;
                        border-left: 1px solid #eee;
                        border-right: 1px solid #eee;
                    }
                }
            }
        }
    }
</style>