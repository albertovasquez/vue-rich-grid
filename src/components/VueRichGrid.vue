<template>
    <div :id="richId">
        <div :class="[isDisabled ? 'disabled' : '', 'vue-rich-grid']">
            <table>
                <thead>
                    <tr>
                        <th v-for="(column, index) in richColumns" v-on="sortable(column.data)" rowspan="1" colspan="1" :class="[column.getClass()]" :key="index" :style="column.getStyle()">
                            <span v-if="column.data.isCheckbox" :key="index">
                              <input type="checkbox" :checked="allRowsSelected" @click="toggleCheckboxes" />
                            </span>
                            <span v-else>
                              <!-- eslint-disable-next-line max-len -->
                              <svg v-show="column.data.sortable" :class="column.data.dir" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 401.998 401.998" style="top: 1px;position: relative; enable-background:new 0 0 401.998 401.998;" xml:space="preserve">
                                  <g class="column-sort-up">
                                      <!-- eslint-disable-next-line max-len -->
                                      <path d="M73.092,164.452h255.813c4.949,0,9.233-1.807,12.848-5.424c3.613-3.616,5.427-7.898,5.427-12.847 c0-4.949-1.813-9.229-5.427-12.85L213.846,5.424C210.232,1.812,205.951,0,200.999,0s-9.233,1.812-12.85,5.424L60.242,133.331 c-3.617,3.617-5.424,7.901-5.424,12.85c0,4.948,1.807,9.231,5.424,12.847C63.863,162.645,68.144,164.452,73.092,164.452z"/>
                                  </g>
                                  <g class="column-sort-down">
                                      <!-- eslint-disable-next-line max-len -->
                                      <path d="M328.905,237.549H73.092c-4.952,0-9.233,1.808-12.85,5.421c-3.617,3.617-5.424,7.898-5.424,12.847 c0,4.949,1.807,9.233,5.424,12.848L188.149,396.57c3.621,3.617,7.902,5.428,12.85,5.428s9.233-1.811,12.847-5.428l127.907-127.906 c3.613-3.614,5.427-7.898,5.427-12.848c0-4.948-1.813-9.229-5.427-12.847C338.139,239.353,333.854,237.549,328.905,237.549z" style=""/>
                                  </g>
                              </svg>
                              {{ column.data.text }}
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in sortedRows" :class="[{'odd':row.data.isOdd}, row.getClass()]" :key="rowIndex">
                        <td v-if="row.data.isExpandedRow" :colspan="richColumns.length">
                          <promised :promise="row.data.expandedData">
                            <div class="row-loading">
                              <!-- yes we need all these divs -->
                              <div style="color: #84a5dd" class="la-ball-pulse la-sm"><div></div><div></div><div></div></div>
                            </div>
                            <!-- The default scoped slots will be used as the result -->
                            <div slot="then" slot-scope="data" v-html="data"></div>
                            <!-- The 'catch' named scoped slots will be used if there is an error -->
                            <div slot="catch" slot-scope="error">Error: {{ error.message }}</div>
                          </promised>
                        </td>
                        <template v-else v-for="(column, colIndex) in richColumns">
                            <td v-if="column.data.isExpander" :key="colIndex">
                              <div class="expander-wrapper" @click="row.toggleExpander(column)">
                                <i :class="[{'right': !row.data.isExpanded}, 'arrow']"></i>
                              </div>
                            </td>
                            <td v-else-if="column.data.isCheckbox" :key="colIndex">
                              <input type="checkbox" :checked="row.data.isSelected" @click="toggleCheckbox(row.data)" />
                            </td>
                            <td v-else-if="typeof $scopedSlots[column.data.id] !== 'undefined'" :key="colIndex" :class="[column.getRowClass()]">
                                <slot :name="column.data.id" :column="column.data" :data="row.data"></slot>
                            </td>
                            <td v-else :key="colIndex" :class="[column.getRowClass()]" v-html="row.renderData(column)"></td>
                        </template>
                    </tr>
                    <tr v-show="(initialLoad && !rows.length) && !loading">
                      <!-- default state // prevents bounce when we start doing something -->
                      <td :colspan="richColumns.length" class="richgrid-nodata"></td>
                    </tr>
                    <tr v-show="!rows.length && loading">
                      <td :colspan="richColumns.length" class="richgrid-nodata">{{settings.loadingText}}</td>
                    </tr>
                    <tr v-show="!rows.length && !loading && !initialLoad">
                        <td v-if="typeof $slots['nodata'] !== 'undefined'" :colspan="richColumns.length" class="richgrid-nodata">
                            <slot name="nodata"></slot>
                        </td>
                        <td v-else :colspan="richColumns.length" class="richgrid-nodata">{{settings.noDataText}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <rich-page :settings="pageSet" :rowsLength="rowsLength" ref="pager" :isDisabled="isPagerDisabled" @page-change="pageChange"></rich-page>
    </div>
</template>

<script type="ts">
import pino from 'pino';
import get from 'lodash.get';
import Vue from 'vue';
import Promised from 'vue-promised';
import Row from './Row';
import Column from './Column';
import RichPage from './VueRichPage.vue';

const log = pino();
let componentCount = 0;

export default Vue.extend({
  components: { richPage: RichPage, promised: Promised },
  name: 'richgrid',
  props: {
    columns: {
      type: Array,
      default() { return []; },
    },
    options: {
      type: Object,
      default() {},
    },
    data: {
      type: Array,
      default() { return []; },
    },
    onSelectionChange: null,
  },
  computed: {
    isPagerDisabled: cmp => cmp.isDisabled || cmp.sortedRows.length === 0,
    isDisabled: cmp => cmp.loading || cmp.disabled,
    allRowsSelected: cmp => cmp.rows.length > 0 &&
             cmp.rows.filter(row => row.data.isSelected).length === cmp.rows.length,
    sortedRows: ({ rows, ...cmp }) => {
      let newRows = rows;
      if (cmp.loadType === 'local') {
        // we are dealing with data array
        // all sorts and filters are done locally
        const activeColumn = cmp.richColumns.find(col => col.active);
        if (activeColumn) {
          // if we have an active column sort by the id
          const dir = get(activeColumn, 'data.dir', cmp.settings.baseParams.dir);
          rows.sort((a, b) => {
            // If parsing Non numbers return NaN just use unParsedValues
            // otherwise lets deal with numbers for more accurage sorts
            const aId = Number.isNaN(parseInt(a.data[activeColumn.id], 10)) ? a.data[activeColumn.id] : parseInt(a.data[activeColumn.id], 10);
            const bId = Number.isNaN(parseInt(b.data[activeColumn.id], 10)) ? b.data[activeColumn.id] : parseInt(b.data[activeColumn.id], 10);
            if (dir === 'asc') {
              return (aId > bId);
            }
            return (aId < bId);
          });
        }
        // limit by page size
        newRows = newRows.slice(cmp.params.start, cmp.params.start + cmp.pageSet.pageSize);
      }

      // let's add any expander rows
      return newRows.map((row, index) => {
        // Calculating isOdd before we add expander
        row.data.isOdd = (index % 2); // eslint-disable-line no-param-reassign
        return row;
      }).reduce((accum, row) => {
        accum.push(row);
        if (row.data.isExpanded) {
          accum.push(new Row(Object.assign({}, row.data, {
            isExpanded: false, // I am the expended row
            isExpandedRow: true,
            isSelected: false,
          })));
        }
        return accum;
      }, []);
    },
  },
  methods: {
    selectionChanged() {
      this.$emit('selectionChange', this.rows.filter(row => row.data.isSelected).map(row => row.data));
    },
    toggleCheckboxes() {
      const { allRowsSelected } = this;
      this.rows = this.rows.map((row) => {
        const newRow = row;
        newRow.data.isSelected = !allRowsSelected;
        return newRow;
      });
      this.selectionChanged();
    },
    toggleCheckbox(data) {
      const selectedRow = this.rows.find(row => row.data.id === data.id);
      if (selectedRow) {
        selectedRow.data.isSelected = !selectedRow.data.isSelected;
      }
      this.selectionChanged();
    },
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
        });
      }
    },
    // receive page info change callback
    async pageChange(pInfo) {
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
        return { click: this.sort.bind(this, column) };
      }
      return null;
    },
    /**
     * creates a new columns array by
     * updating the dir and active propery
     */
    sort(clickedColumn) {
      const oldActiveColumn = this.richColumns.find(col => col.active);
      const newActiveColumn = this.richColumns.find(col => col.id === clickedColumn.id);

      if (newActiveColumn) {
        newActiveColumn.active = true;
      }

      if (oldActiveColumn && oldActiveColumn.id === newActiveColumn.id) {
        newActiveColumn.data.dir = (newActiveColumn.data.dir === 'asc') ? 'desc' : 'asc';
      } else if (oldActiveColumn) {
        // if we are not the same column
        // ensre that we are setting as inactive
        oldActiveColumn.active = false;
      }

      this.settings.baseParams.sort = clickedColumn.id;
      this.fetchFromStart(false);
    },
    async fetchRows(start = 0) {
      this.setLoading(true);
      this.params.start = start;

      let rows = this.$props.data || [];

      // only try to do an async
      // get if a plugin was added that
      // provides the method and a url is provided
      if (this.httpGet && this.settings.url) {
        let response;
        try {
          response = await this.httpGet(this.settings.url);
        } catch (ex) {
          log.error({ url: this.settings.url, exception: ex }, 'error httpGet');
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
        this.loadType = 'http';
      } else if (rows.length) {
        this.pageSet.totalRow = rows.length;
        this.loadType = 'local';
      }

      // populate rows with array of Classes
      this.rowsLength = rows.length;
      this.rows = rows.map(row => new Row(row));
      this.selectionChanged();
      this.setLoading(false);
    },
    // ** Below are methods available to parent via refs
    /**
     * Fetch from first page
     * method to call when you are
     * fetching rows from a sort
     * No event is fired from this event
     * Note: This is called externally by ref
     * Do not delete this method or rename it
     */
    async fetchFromStart(initialLoad = true) {
      const activeColumn = this.richColumns.find(col => col.active);
      if (!initialLoad) {
        this.$refs.pager.goPage(1, false);
      }
      this.params.dir = get(activeColumn, 'data.dir', this.settings.baseParams.dir);
      try {
        await this.fetchRows(0);
      } catch (ex) {
        log.error({ from: 0, exception: ex }, 'issue fetching rows');
      }

      this.initialLoad = false;
      this.enable();
    },
    // Visual modifiers only. If parent
    // sends calls other methods via ref
    // they will still be performed
    disable() {
      this.disabled = true;
    },
    enable() {
      this.disabled = false;
    },
  },
  data(props) {
    // lets merge our passed options with defaults
    const defaults = Object.assign({}, {
      baseParams: get(props, 'options.baseParams', {}),
      noDataText: 'No data found',
      fetchOnLoad: true,
      hidePagingWhenNotNeeded: false,
      loadingText: 'Loading...',
      pageSizeMenu: [5, 10, 20, 50, 100, 300],
    }, props.options);

    defaults.baseParams.limit = get(defaults, 'baseParams.limit', 5);
    defaults.baseParams.dir = get(defaults, 'baseParams.dir', 'asc');
    return {
      settings: defaults,
      pageSet: {
        totalRow: 0,
        hidePagingWhenNotNeeded: defaults.hidePagingWhenNotNeeded,
        pageSize: defaults.baseParams.limit,
        pageSizeMenu: defaults.pageSizeMenu,
      },
      params: {
        start: 0,
      },
      loadType: 'local', // 'local' || 'http'
      rowsLength: 0,
      disabled: false,
      loading: false,
      richId: null,
      richColumns: props.columns.map(column => new Column(column, defaults.baseParams)),
      rows: [],
      initialLoad: true,
      gridCount: null,
    };
  },
  beforeMount() {
    // calculate grid's id
    if (this.settings.id) {
      this.richId = this.settings.id;
    } else {
      componentCount += 1;
      this.richId = `rich-grid-${componentCount}`;
    }
  },
  mounted() {
    // determine what the initial
    // selected column is if any at all.
    // then perform the initial search
    // if option of render on load is true
    if (this.initialLoad && this.settings.fetchOnLoad) {
      this.fetchFromStart();
    }
  },
});
</script>

<style lang="scss" scoped>
    @import '../css/_loadings.css';
    .vue-rich-grid {
        font-family: 'Avenir';
        font-size: 14px;
        transition: opacity .6s;
        .row-loading {
          padding-top: 5px;
          margin-left: 50%;
        }
        input[type='checkbox'] {
            margin: 0;
        }

        &.disabled {
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
                &.expander {
                  width: 20px;
                  padding-right: 0;
                }
                &.checkbox {
                  width: 28px;
                  padding:0;
                }
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
                &.row-selected {
                  td {
                    background-color: #f5f5e9;
                  }
                }
                &.row-expansion {
                  td {
                    text-align: left;
                    padding-left: 40px;
                    background-color: #eff7ff;
                  }
                }
            }
        }
        .expander-wrapper {
          display: inline-block;
          position: relative;
          z-index: 1;
          padding: 1em;
          margin: -1em;

          &:hover {
            i {
              &.arrow {
                &.right {
                  border: solid #33abd9;
                  border-width: 0 2px 2px 0;
                }
              }
            }
            cursor: pointer;
          }

          i {
            &.arrow {
              border: solid #33abd9;
              border-width: 0 2px 2px 0;
              display: inline-block;
              padding: 2px;
              &.right {
                  border: solid black;
                  border-width: 0 2px 2px 0;
                  transform: rotate(-45deg);
                  -webkit-transform: rotate(-45deg);
              }
            }
          }
        }
    }
</style>
