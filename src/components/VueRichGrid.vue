<template>
    <div :id="richId">
        <div :class="[loading ? 'loading' : '', 'vue-rich-grid']">
            <table>
                <thead>
                    <tr>
                        <th v-for="column in richColumns" v-on="sortable(column.data)" rowspan="1" colspan="1" :class="[column.getClass()]" :key="column.data.id" :style="column.getStyle()">
                            <svg v-show="column.data.sortable" :class="column.data.dir" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 401.998 401.998" style="top: 1px;position: relative; enable-background:new 0 0 401.998 401.998;" xml:space="preserve">
                                <g class="column-sort-up">
                                    <path d="M73.092,164.452h255.813c4.949,0,9.233-1.807,12.848-5.424c3.613-3.616,5.427-7.898,5.427-12.847 c0-4.949-1.813-9.229-5.427-12.85L213.846,5.424C210.232,1.812,205.951,0,200.999,0s-9.233,1.812-12.85,5.424L60.242,133.331 c-3.617,3.617-5.424,7.901-5.424,12.85c0,4.948,1.807,9.231,5.424,12.847C63.863,162.645,68.144,164.452,73.092,164.452z"/>
                                </g>
                                <g class="column-sort-down">
                                    <path d="M328.905,237.549H73.092c-4.952,0-9.233,1.808-12.85,5.421c-3.617,3.617-5.424,7.898-5.424,12.847 c0,4.949,1.807,9.233,5.424,12.848L188.149,396.57c3.621,3.617,7.902,5.428,12.85,5.428s9.233-1.811,12.847-5.428l127.907-127.906 c3.613-3.614,5.427-7.898,5.427-12.848c0-4.948-1.813-9.229-5.427-12.847C338.139,239.353,333.854,237.549,328.905,237.549z" style=""/>
                                </g>
                            </svg>
                            <span>{{ column.data.text }}&nbsp;</span>
                        </th>
                        <th nowrap="nowrap" rowspan="1" colspan="1" class="extra_th" dataindex="extra_th" style="width:100%;display:none;">
                            <span class="">&nbsp;</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in rows" :class="{'odd':(rowIndex % 2)}" :key="rowIndex">
                        <template v-for="column in richColumns">
                            <td v-if="typeof $scopedSlots[column.data.id] !== 'undefined'" :key="column.data.id" :class="[row.getClass(column)]">
                                <slot :name="column.data.id" :column="column.data" :data="row.data"></slot>
                            </td>
                            <td v-else :key="column.data.id" :class="[row.getClass(column)]" v-html="row.renderData(column)"></td>
                        </template>
                        <td class="extra_td" valign="top"></td>
                    </tr>
                    <tr v-show="!rows.length && !loading">
                        <td v-if="typeof $slots['nodata'] !== 'undefined'" :colspan="richColumns.length" class="richgrid-nodata">
                            <slot name="nodata"></slot>
                        </td>
                        <td v-else :colspan="richColumns.length" class="richgrid-nodata">{{settings.noDataText}}</td>
                        <td class="extra_td" valign="top"></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <rich-page :setting="pageSet" :rowsLength="rowsLength" ref="pager" :loading="loading" @page-change="pageChange"></rich-page>
    </div>
</template>

<script>
    import axiosMixin from '../mixins/axios.js';
    import Row from './Row';
    import Column from './Column';
    import get from 'lodash.get';
    import RichPage from '../components/VueRichPage';

    let componentCount = 0;
    export default {
        mixins: [axiosMixin],
        components: { 'richPage': RichPage },
        name: 'richgrid',
        props: {
            columns: {
                type: Array,
                default() { return []},
            },
            options: {
                type: Object,
                default() {},
            },
            data: {
                type: Array,
                default() { return []},
            },
            limit: {
                type: Number,
                default: 5,
            },
            dir: {
                type: String,
                default: 'asc',
            },
        },
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
            pageChange: async function(pInfo){
                // update params with new page info
                this.params.limit = pInfo.pageSize;
                this.pageSet.pageSize = pInfo.pageSize;
                const newPage = (pInfo.pageNumber - 1) * pInfo.pageSize;
                await this.fetchRows(newPage);
            },
            /**
             * Dynamically adds a click handler
             * to the column that is sortable
             */
            sortable(column) {
                if (column.sortable) {
                    return { click: this.sort.bind(this, column) }
                }
                return null;
            },
            /**
             * creates a new columns array by
             * updating the dir and active propery
             */
            sort(clickedColumn) {
                const activeColumn = this.richColumns.find(col => col.active);
                this.richColumns = this.richColumns.map((col) => {
                    col.active = false;
                    if (col.id === clickedColumn.id) {
                        // only switch sort if active
                        // column is clicked otherwise
                        // just set the default sort
                        if (activeColumn && activeColumn.id === col.id) {
                            col.data.dir = (col.data.dir === 'asc') ? 'desc' : 'asc';
                        }
                        col.active = true;
                    }
                    return col;
                });

                this.settings.baseParams.sort = clickedColumn.id;
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
            fetchFromStart: async function() {
                const activeColumn = this.richColumns.find(col => col.active);
                this.$refs.pager.goPage(1, false);
                this.params.dir = get(activeColumn, 'data.dir', this.settings.baseParams.dir);
                await this.fetchRows(0);
            },
            initialFetch: async function () {
                const activeColumn = this.richColumns.find(col => col.active);
                this.params.dir = get(activeColumn, 'data.dir', this.settings.baseParams.dir);
                await this.fetchRows(0);
            },
            fetchRows: async function (start = 0) {
                this.setLoading(true);
                this.params.start = start;

                let rows = this.$props.data || [];
                this.pageSet.totalRow = rows.length;

                // only try to do an async
                // get if a plugin was added that
                // provides the method and a url is provided
                if (this.get && this.settings.url) {
                    const response = await this.get(this.settings.url);
                    if (!response.data) {
                        console.error(`Richgrid did not receive data from ${this.settings.url}`)
                    }

                    // get rows
                    if (this.settings.rootElement) {
                        rows = response.data[this.settings.rootElement];
                    } else {
                        rows = response.data;
                    }

                    // update paging totalRows based
                    // on the returned results from get
                    if (this.settings.totalProperty) {
                        this.pageSet.totalRow = response.data[this.settings.totalProperty];
                    } else {
                        this.pageSet.totalRow = response.data.totalcount;
                    }
                } else if(rows.length){
                    // we are dealing with data array
                    // all sorts and filters are done locally
                    const activeColumn = this.richColumns.find(col => col.active);
                    // if we have an active column sort by the id
                    if (activeColumn) {
                        rows = rows.sort((a, b) => get(activeColumn, 'data.dir', this.settings.baseParams.dir) === 'asc' ?
                                a[activeColumn.id] < b[activeColumn.id] :
                                a[activeColumn.id] > b[activeColumn.id]);
                    }

                    // limit by page size
                    rows = rows.slice(this.params.start, this.params.start + this.pageSet.pageSize);
                }

                // populate rows with array of Classes
                this.rowsLength = rows.length;
                this.rows = rows.map(row => new Row(row));
                this.setLoading(false);
            },
        },
        data(props) {
            // lets merge our passed options with defaults
            const defaults = Object.assign({}, {
                baseParams: {
                    limit: 10,
                    dir: 'asc',
                },
                noDataText: 'No data found',
                pageSizeMenu: [5, 10, 20, 50, 100, 300],
            }, props.options || {});

            defaults.baseParams.limit = props.limit;
            defaults.baseParams.dir = props.dir;

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
                rowsLength: 0,
                loading: false,
                richId: null,
                richColumns: props.columns.map(column => new Column(column, defaults.baseParams)),
                rows: [],
                initialLoad: true,
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
        mounted() {
            // determine what the initial
            // selected column is if any at all.
            // then perform the initial search
            // if option of render on load is true
            if (this.initialLoad) {
                this.initialLoad = false;
                this.initialFetch();
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vue-rich-grid {
        font-family: 'Avenir', Arial;
        font-size: 14px;
        transition: opacity .6s;

        &.loading {
            tbody {
                opacity: .4;
            }
        }

        >table {
            border-spacing: 0;
            border-collapse: collapse;
            margin-bottom: 10px;
            table-layout: fixed;
            width:100%;
            border-top: 2px solid #F90;

            tbody {
                border: 1px solid #EEE;
                .richgrid-nodata {
                    text-align: center;
                    height: 60px;
                    font-size: 18px;
                    vertical-align: middle;
                }
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
                        background-color: #f5f7fa;
                    }
                }
                td {
                    height: 20px;
                    padding: 12px 10px 12px 10px;
                    // border-bottom: 1px solid #eee;
                        border-bottom: 1px solid #ffdeae;
                    background-color: #fff;
                    vertical-align: top;
                    text-align: center;
                    &.active-column {
                        background-color: #eff7ff;
                        border-bottom: 1px solid #b7e4f8;
                        border-left: 1px solid #eee;
                        border-right: 1px solid #eee;
                    }
                }
            }
        }
    }
</style>