<template>
    <div :class="[loading ? 'pager-loading' : '', pageClass, (totalRow === 0 || !visible) ? 'hide-pager' : '', 'vue-rich-pager' ]">
        <div class="vue-page-info">
            {{ `Page ${currentPage} of ${totalPage} （${totalRow} items)` }}
        </div>
        <ul>
            <li>
                <a :disabled="currentPage === 1" href="javascript:" @click="switchPage('first')">{{firstLabel}}</a>
            </li>
            <li>
                <a :disabled="currentPage === 1" href="javascript:" @click="switchPage('previous')">{{previousLabel}}</a>
            </li>
            <li v-for="(num,index) in pageNumbers" :key="index">
                <a :class="[num === currentPage ? 'active': '']" href="javascript:" @click="switchPage(num)">{{num}}</a>
            </li>
            <li>
                <a :disabled="currentPage === totalPage" href="javascript:" @click="switchPage('next')">{{nextLabel}}</a>
            </li>
            <li>
                <a :disabled="currentPage === totalPage" href="javascript:" @click="switchPage('last')">{{lastLabel}}</a>
            </li>
            <li>
                <select @change="switchLength" v-model="pageSize">
                    <option v-for="(len, index) in lengthList" :key="index" :value="len">Page size | {{len}}</option>
                </select>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "v-page",
        props: ['setting', 'loading'],
        data(){
            let config = Object.assign({}, {
                totalRow: 0,
                pageSize: 5,
                pageSizeMenu: [5,10,20,50,100],
                align: 'right'
            }, this.setting);
            return {
                firstLabel: "<<",
                previousLabel: "<",
                nextLabel: ">",
                lastLabel: ">>",
                config: config,
                pageNumber: 1,
                pageSize: config.pageSize,
                totalRow: config.totalRow,
                totalPage: 0,
                currentPage: 1,
                lengthList: config.pageSizeMenu,
                pageNumberSize: 5,
                pageClass : {
                    vPagination: false,
                    vPaginationRight: false,
                    vPaginationCenter: false
                }
            };
        },
        computed:{
            visible: function() {
                return (this.totalRow > this.pageNumberSize);
            },
            pageNumbers: function(){
                let start, end, nums = [], pNum = this.currentPage, half = Math.floor(this.pageNumberSize / 2);
                if(this.totalPage < this.pageNumberSize) {
                    start = 1;
                    end = this.totalPage;
                } else if ( pNum <= half ) {
                    start = 1;
                    end = this.pageNumberSize;
                } else if ( pNum >= (this.totalPage - half) ) {
                    start = this.totalPage - this.pageNumberSize + 1;
                    end = this.totalPage;
                } else {
                    start = pNum - half;
                    end = start + this.pageNumberSize - 1;
                }
                for(let i = start;i <= end; i++){
                    nums.push(i);
                }
                return nums;
            }
        },
        watch:{
            'setting.totalRow':function(val){
                this.totalRow = val;
                if(!this.lengthList.includes(this.pageSize)){
                    this.pageSize = this.lengthList[0];
                }
                this.calcTotalPage();
            }
        },
        methods:{
            goPage(pNum, emit = true){
                this.currentPage = pNum;
                if (emit) {
                    this.$emit('page-change',{
                        pageNumber: pNum,
                        pageSize: Number(this.pageSize)
                    });
                }
                this.calcTotalPage();
            },
            calcTotalPage(){
                this.totalPage = Math.ceil(this.totalRow / this.pageSize);
            },
            switchPage(pNum){
                if (pNum === this.currentPage) return;
                if(typeof(pNum) === 'string'){
                    switch (pNum){
                        case 'first':
                            if(this.currentPage!==1) this.currentPage = 1;
                            else return;
                            break;
                        case 'previous':
                            if(this.currentPage!==1) this.currentPage--;
                            else return;
                            break;
                        case 'next':
                            if(this.currentPage!==this.totalPage) this.currentPage++;
                            else return;
                            break;
                        case 'last':
                            if(this.currentPage!==this.totalPage) this.currentPage = this.totalPage;
                            else return;
                            break;
                    }
                }else if(typeof(pNum) === 'number'){
                    this.currentPage = pNum;
                }
                this.goPage(this.currentPage);
            },
            switchLength(){
                this.goPage(1);
            }
        },
        mounted(){
            if(this.config.align === 'center')
                this.pageClass['pager-center'] = true;
            else if(this.config.align === 'right')
                this.pageClass['pager-right'] = true;
            // Lets not emit on the first mount
            this.goPage(1, false);
        }
    }
</script>

<style lang="scss" scoped>
    $insetHover: inset -1px -2px 16px 1px rgba(0, 0, 0, 0.08);
    $inset: inset 2px -11px 14px 1px rgba(0, 0, 0, 0.08);

    .vue-rich-pager {
        font-family: 'Avenir';
        transition: opacity .3s;
        margin: 0;
        display: block;
        &.pager-loading {
            opacity: .8;
        }
        &.hide-pager {
            display:none;
        }
        &.pager-right{
            text-align: right;
        }
        &.pager-center{
            text-align: center;
        }
        > ul {
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
                    font-size: 13px;
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
            padding: 6px 12px;
            float: left;
            border-left-width: 0;
            color: #444;
        }
    }
</style>