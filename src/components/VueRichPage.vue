<template>
    <div :class="[isDisabled ? 'pager-disabled' : '', showPager ? 'show-pager' : '', 'vue-rich-pager' ]">
        <div class="vue-page-info">
            {{ `Showing ${fromRow} to ${toRow} of ${totalRow} entries` }}
        </div>
        <ul>
            <li>
                <a :disabled="currentPage === 1"
                    href="javascript:"
                    @click="switchPage('first')">&lt;&lt;</a>
            </li>
            <li>
                <a :disabled="currentPage === 1"
                    href="javascript:"
                    @click="switchPage('previous')">&lt;</a>
            </li>
            <li v-for="(num,index) in pageNumbers" :key="index">
                <a :class="[num === currentPage ? 'active': '']"
                    href="javascript:"
                    @click="switchPage(num)">{{num}}</a>
            </li>
            <li>
                <a :disabled="currentPage === totalPage"
                    href="javascript:"
                    @click="switchPage('next')">&gt;</a>
            </li>
            <li>
                <a :disabled="currentPage === totalPage"
                    href="javascript:"
                    @click="switchPage('last')">&gt;&gt;</a>
            </li>
            <li>
                <select @change="goPage(1)" v-model="pageSize">
                    <option v-for="(len, index) in config.pageSizeMenu"
                            :key="index"
                            :value="len">{{len}}</option>
                </select>
            </li>
        </ul>
    </div>
</template>

<script type="ts">
import pino from 'pino';
import Vue from 'vue';
import get from 'lodash.get';

const log = pino();

export default Vue.extend({
  props: ['settings', 'rowsLength', 'isDisabled'],
  data(props) {
    return {
      config: Object.assign({}, {
        hidePagingWhenNotNeeded: false,
        pageSizeMenu: [5, 10, 20, 50, 100],
      }, this.settings),
      pageSize: parseInt(get(props, 'settings.pageSize', 5), 10),
      totalRow: parseInt(get(props, 'settings.totalRow', 0), 10),
      pageNumber: 1,
      totalPage: 0,
      loadedFirstTime: false,
      currentPage: 1,
      // total number of page buttons we want
      // to divide our paging options into.
      maxPageNumberSize: 4,
    };
  },
  computed: {
    fromRow: cmp => ((cmp.currentPage - 1) * cmp.pageSize) + 1,
    toRow: cmp => (cmp.fromRow + cmp.rowsLength) - 1,
    /**
     * Hides pager if all rows are visible and
     * hidePagingWhenNotNeeded was explicitly passed as true
     */
    showPager: (cmp) => {
      const pagingNotNeededToViewAllRows = cmp.totalRow <= cmp.pageSize;
      if (!cmp.loadedFirstTime) {
        return false;
      }
      return !pagingNotNeededToViewAllRows || (pagingNotNeededToViewAllRows && !cmp.config.hidePagingWhenNotNeeded);
    },
    /**
     * Calculate the different paging options
     * where maxPageNumberSize is the max available
     */
    pageNumbers: (cmp) => {
      let start;
      let end;
      const numOptions = [];
      const half = Math.floor(cmp.maxPageNumberSize / 2);

      if (cmp.totalPage < cmp.maxPageNumberSize) {
        start = 1;
        end = cmp.totalPage;
      } else if (cmp.currentPage <= half) {
        start = 1;
        end = cmp.maxPageNumberSize;
      } else if (cmp.currentPage >= (cmp.totalPage - half)) {
        start = (cmp.totalPage - cmp.maxPageNumberSize) + 1;
        end = cmp.totalPage;
      } else {
        start = cmp.currentPage - half;
        end = (start + cmp.maxPageNumberSize) - 1;
      }

      for (let i = start; i <= end; i++) {
        numOptions.push(i);
      }

      return numOptions;
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'settings.totalRow': function (val) {
      this.totalRow = val;
      if (!this.config.pageSizeMenu.includes(this.pageSize)) {
        [this.pageSize] = this.config.pageSizeMenu;
      }
      this.calcTotalPage();
      this.loadedFirstTime = true;
    },
  },
  methods: {
    goPage(pNum, emit = true) {
      this.currentPage = pNum;
      if (emit) {
        this.$emit('page-change', {
          pageNumber: pNum,
          pageSize: Number(this.pageSize),
        });
      }
      this.calcTotalPage();
    },
    calcTotalPage() {
      this.totalPage = Math.ceil(this.totalRow / this.pageSize);
    },
    switchPage(pageNumber) {
      if (pageNumber === this.currentPage) {
        return;
      }

      if (typeof (pageNumber) === 'string') {
        switch (pageNumber) {
          case 'first':
            if (this.currentPage !== 1) {
              this.currentPage = 1;
            } else {
              return;
            }
            break;
          case 'previous':
            if (this.currentPage !== 1) {
              this.currentPage = this.currentPage - 1;
            } else {
              return;
            }
            break;
          case 'next':
            if (this.currentPage !== this.totalPage) {
              this.currentPage = this.currentPage + 1;
            } else {
              return;
            }
            break;
          case 'last':
            if (this.currentPage !== this.totalPage) {
              this.currentPage = this.totalPage;
            } else {
              return;
            }
            break;
          default:
            log.warn('Trying to switch page number that is not defined');
        }
      } else if (typeof (pageNumber) === 'number') {
        this.currentPage = pageNumber;
      }
      this.goPage(this.currentPage);
    },
  },
  mounted() {
    // Lets not emit on the first mount
    this.goPage(1, false);
  },
});
</script>

<style lang="scss" scoped>
    $insetHover: inset -1px -2px 16px 1px rgba(0, 0, 0, 0.08);
    $inset: inset 2px -11px 14px 1px rgba(0, 0, 0, 0.08);

    .vue-rich-pager {
        font-family: 'Avenir', Arial;
        transition: opacity .3s;
        margin: 0;
        display: none;
        text-align: right;
        &.pager-disabled {
            opacity: .8;
        }
        &.show-pager {
            display:block;
        }
        > ul {
            font-size: 12px;
            margin: 0 0 0 0;
            display: inline-block;
            > li {
                text-align: center;
                display: table-cell;
                box-sizing: border-box;
                margin: 0;
                > a {
                    border: 1px solid #C4C4C4;
                    border-radius: 3px 3px 3px 3px;
                    box-shadow: $inset;
                    color: #555555;
                    line-height: 12px;
                    margin: 0 7px 0 0;
                    text-decoration: none;
                    display: inline-block;
                    padding: 8px 10px 0 10px;
                    height: 20px;
                    width: 14px;

                    &:hover {
                        box-shadow: $insetHover;
                    }
                    &[disabled] {
                        cursor: default;
                        opacity: 0.45;
                        &:hover {
                            box-shadow: $insetHover;
                        }
                    }
                    &.active {
                        background-color: #299ed2;
                        color: #fff;
                        &:hover {
                            box-shadow: $inset;
                            cursor: default;
                        }
                    }
                }

                select {
                    font-size: 12px;
                    box-shadow: $inset;
                    border: 1px solid #C4C4C4;
                    vertical-align: baseline;
                    width: auto;
                    height: 30px;
                    display: inline-block;
                    &:hover {
                        box-shadow: $insetHover;
                    }
                }
            }
        }

        .vue-page-info {
            height: 20px;
            font-size:14px;
            padding: 6px 0;
            float: left;
            border-left-width: 0;
            color: #444;
        }
    }
</style>
